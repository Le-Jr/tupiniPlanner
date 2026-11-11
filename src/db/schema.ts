import { tables } from "../domain/model.ts";
export const schemaV1 = `
${tables.map((t) => `CREATE TABLE IF NOT EXISTS ${t} (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL CHECK(json_valid(data) AND json_extract(data, '$.id') = id));`).join("\n")}
CREATE UNIQUE INDEX IF NOT EXISTS xp_source ON xp(json_extract(data, '$.sourceType'), json_extract(data, '$.sourceId'));
CREATE UNIQUE INDEX IF NOT EXISTS badge_once ON badges(json_extract(data, '$.badgeId'));
CREATE UNIQUE INDEX IF NOT EXISTS occurrence_once ON occurrences(json_extract(data, '$.templateId'), json_extract(data, '$.localDate')) WHERE json_extract(data, '$.templateId') IS NOT NULL;
CREATE INDEX IF NOT EXISTS occurrence_date ON occurrences(json_extract(data, '$.localDate'));
CREATE INDEX IF NOT EXISTS occurrence_status ON occurrences(json_extract(data, '$.status'));
CREATE UNIQUE INDEX IF NOT EXISTS reflection_date ON reflections(json_extract(data, '$.localDate'));
PRAGMA user_version = 1;
`;
