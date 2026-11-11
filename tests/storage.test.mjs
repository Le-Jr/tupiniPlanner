import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initializeStorage, persistStorage } from "../src/db/storage.ts";
import { materialize, setStatus } from "../src/domain/planner.ts";
const adapter = (db) => ({
  execAsync: async (sql) => {
    db.exec(sql);
  },
  getFirstAsync: async (sql) => db.prepare(sql).get() ?? null,
  getAllAsync: async (sql) => db.prepare(sql).all(),
  runAsync: async (sql, ...params) => db.prepare(sql).run(...params),
  withTransactionAsync: async (fn) => {
    db.exec("BEGIN");
    try {
      await fn();
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  },
});
let count = 0;
const id = () => `db-${++count}`;
test("SQLite migration is idempotent; completion, XP and badge survive closing database", async () => {
  const folder = mkdtempSync(join(tmpdir(), "tupini-"));
  const path = join(folder, "test.db");
  let db = new DatabaseSync(path);
  try {
    let storage = adapter(db);
    const before = await initializeStorage(storage);
    await initializeStorage(storage);
    const next = structuredClone(before);
    next.templates.push({
      id: id(),
      title: "Guitarra",
      category: "guitar",
      recurrenceDays: [2],
      xpValue: 20,
      order: 0,
      active: true,
      createdDate: "2026-11-10",
    });
    materialize(next, "2026-11-10", id);
    setStatus(
      next,
      next.occurrences[0].id,
      "completed",
      new Date().toISOString(),
      id,
    );
    await persistStorage(storage, before, next);
    db.close();
    db = new DatabaseSync(path);
    storage = adapter(db);
    const loaded = await initializeStorage(storage);
    assert.equal(loaded.occurrences[0].status, "completed");
    assert.equal(loaded.xp.length, 2);
    assert.equal(loaded.badges[0].badgeId, "first");
  } finally {
    db.close();
    rmSync(folder, { recursive: true });
  }
});
test("constraint failure rolls back task, XP and badge together", async () => {
  const db = new DatabaseSync(":memory:");
  try {
    const storage = adapter(db);
    const before = await initializeStorage(storage);
    const next = structuredClone(before);
    next.occurrences.push({
      id: "o1",
      localDate: "2026-11-10",
      titleSnapshot: "Tarefa",
      category: "custom",
      status: "completed",
      completedAt: new Date().toISOString(),
      xpValue: 15,
      order: 0,
    });
    next.xp.push(
      {
        id: "x1",
        sourceType: "task",
        sourceId: "o1",
        points: 15,
        createdAt: new Date().toISOString(),
      },
      {
        id: "x2",
        sourceType: "task",
        sourceId: "o1",
        points: 15,
        createdAt: new Date().toISOString(),
      },
    );
    await assert.rejects(persistStorage(storage, before, next));
    const loaded = await initializeStorage(storage);
    assert.equal(loaded.occurrences.length, 0);
    assert.equal(loaded.xp.length, 0);
  } finally {
    db.close();
  }
});
