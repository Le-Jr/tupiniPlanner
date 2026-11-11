import * as SQLite from "expo-sqlite";
import type { State } from "../domain/model";
import { initializeStorage, persistStorage } from "./storage";
let connection: Promise<SQLite.SQLiteDatabase> | undefined;
async function database() {
  connection ??= SQLite.openDatabaseAsync("tupiniplanner.db").catch((error) => {
    connection = undefined;
    throw error;
  });
  return connection;
}
export async function initialize(): Promise<State> {
  return initializeStorage(await database());
}
// All writes are serialized by AppProvider; other code must not access this connection.
export async function persist(previous: State, next: State): Promise<void> {
  return persistStorage(await database(), previous, next);
}
