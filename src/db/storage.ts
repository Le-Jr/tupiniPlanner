import { emptyState, tables, type State } from "../domain/model.ts";
import { schemaV1 } from "./schema.ts";
export interface Storage {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string): Promise<T | null>;
  getAllAsync<T>(sql: string): Promise<T[]>;
  runAsync(sql: string, ...params: string[]): Promise<unknown>;
  withTransactionAsync(fn: () => Promise<void>): Promise<void>;
}
export async function initializeStorage(db: Storage): Promise<State> {
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  if ((row?.user_version ?? 0) > 1)
    throw new Error("Banco de uma versão mais recente. Atualize o aplicativo.");
  if ((row?.user_version ?? 0) < 1)
    await db.withTransactionAsync(async () => {
      await db.execAsync(schemaV1);
    });
  const state = emptyState();
  for (const table of tables) {
    const rows = await db.getAllAsync<{ data: string }>(
      `SELECT data FROM ${table}`,
    );
    if (table === "settings" && !rows.length) continue;
    (state[table] as unknown[]) = rows.map(
      (r) => JSON.parse(r.data) as unknown,
    );
  }
  return state;
}
export async function persistStorage(
  db: Storage,
  previous: State,
  next: State,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of tables) {
      const before = new Map(
        previous[table].map((row) => [row.id, JSON.stringify(row)]),
      );
      const after = new Set(next[table].map((row) => row.id));
      for (const row of previous[table])
        if (!after.has(row.id))
          await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, row.id);
      for (const row of next[table]) {
        const data = JSON.stringify(row);
        if (before.get(row.id) !== data)
          await db.runAsync(
            `INSERT INTO ${table}(id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
            row.id,
            data,
          );
      }
    }
  });
}
