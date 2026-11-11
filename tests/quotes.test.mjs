import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bruteQueries,
  quoteOfDay,
  randomQuote,
  retroQuotes,
} from "../src/domain/quotes.ts";
import { emptyState } from "../src/domain/model.ts";
import { exportBackup, parseBackup } from "../src/domain/backup.ts";

test("retro quotes are complete, attributed and 70s/80s-era", () => {
  const ids = new Set();
  for (const q of retroQuotes) {
    assert.ok(!ids.has(q.id), `duplicate ${q.id}`);
    ids.add(q.id);
    for (const key of ["text", "original", "who", "work", "year", "gif"])
      assert.ok(q[key].trim(), `${q.id}.${key}`);
    assert.ok(["filme", "série", "livro"].includes(q.kind));
    assert.ok(q.original.split(/\s+/).length <= 20, `${q.id} too long`);
  }
  assert.ok(bruteQueries.length >= 8);
});

test("quote of the day is stable and random quote avoids the current one", () => {
  assert.equal(quoteOfDay("2026-11-11").id, quoteOfDay("2026-11-11").id);
  for (let i = 0; i < 50; i++)
    assert.notEqual(randomQuote("yoda-try").id, "yoda-try");
});

test("backup accepts optional gifsEnabled and rejects non-boolean", () => {
  const s = emptyState();
  const now = "2026-11-11T12:00:00.000Z";
  s.profiles.push({
    id: "p1",
    displayName: "",
    onboardingCompleted: true,
    consentAt: now,
    createdAt: now,
  });
  assert.ok(parseBackup(exportBackup(s)));
  s.settings[0].gifsEnabled = false;
  assert.equal(parseBackup(exportBackup(s)).settings[0].gifsEnabled, false);
  s.settings[0].gifsEnabled = "sim";
  assert.throws(() => parseBackup(exportBackup(s)));
});
