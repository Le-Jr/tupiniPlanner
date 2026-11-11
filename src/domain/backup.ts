import { categories, tables, type State } from "./model.ts";
import { validDate, validateMeasurement } from "./planner.ts";
type Obj = Record<string, unknown>;
function object(v: unknown): Obj {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new Error("Objeto inválido no backup.");
  return v as Obj;
}
function str(o: Obj, key: string, optional = false): void {
  if (optional && o[key] === undefined) return;
  if (typeof o[key] !== "string" || (o[key] as string).length > 10000)
    throw new Error(`Campo inválido: ${key}.`);
}
function num(
  o: Obj,
  key: string,
  min: number,
  max: number,
  optional = false,
): void {
  if (optional && o[key] === undefined) return;
  if (
    typeof o[key] !== "number" ||
    !Number.isFinite(o[key]) ||
    (o[key] as number) < min ||
    (o[key] as number) > max
  )
    throw new Error(`Número inválido: ${key}.`);
}
function bool(o: Obj, key: string): void {
  if (typeof o[key] !== "boolean") throw new Error(`Opção inválida: ${key}.`);
}
function date(o: Obj, key: string): void {
  str(o, key);
  if (
    !validDate(o[key] as string) ||
    (o[key] as string) < "1900-01-01" ||
    (o[key] as string) > "2200-12-31"
  )
    throw new Error(`Data inválida: ${key}.`);
}
function timestamp(o: Obj, key: string): void {
  str(o, key);
  if (!Number.isFinite(Date.parse(o[key] as string)))
    throw new Error(`Instante inválido: ${key}.`);
}
function choice(o: Obj, key: string, choices: readonly string[]): void {
  if (!choices.includes(o[key] as string))
    throw new Error(`Valor inválido: ${key}.`);
}
export function parseBackup(text: string): State {
  if (text.length > 20_000_000) throw new Error("Backup excede 20 MB.");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Não foi possível ler este JSON.");
  }
  const root = object(raw);
  if (root.format !== "tupiniplanner" || root.version !== 1)
    throw new Error("Formato ou versão de backup incompatível.");
  const data = object(root.data);
  if (
    Object.keys(data).some(
      (key) => !(tables as readonly string[]).includes(key),
    )
  )
    throw new Error("Backup contém tabelas desconhecidas.");
  for (const table of tables) {
    const rows = data[table];
    if (!Array.isArray(rows) || rows.length > 100000)
      throw new Error(`Tabela inválida: ${table}.`);
    const ids = new Set<string>();
    for (const row of rows) {
      const o = object(row);
      str(o, "id");
      if (!o.id || ids.has(o.id as string))
        throw new Error("IDs ausentes ou repetidos.");
      ids.add(o.id as string);
      for (const key of [
        "notes",
        "reason",
        "technique",
        "repertoire",
        "description",
        "source",
        "measurementMethod",
        "mood",
        "sleepRoutine",
        "activityLevel",
        "limitations",
        "mealRoutine",
      ])
        str(o, key, true);
      if (["templates", "occurrences"].includes(table)) {
        choice(o, "category", categories);
        num(o, "xpValue", 0, 100);
        num(o, "order", 0, 100000);
        if (!Number.isInteger(o.xpValue)) throw new Error("XP inválido.");
        str(o, "localTime", true);
        if (
          o.localTime &&
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(o.localTime as string)
        )
          throw new Error("Horário inválido.");
        if (o.workoutRef !== undefined)
          choice(o, "workoutRef", ["walk", "calisthenics"]);
      }
      switch (table) {
        case "profiles":
          str(o, "displayName");
          bool(o, "onboardingCompleted");
          timestamp(o, "createdAt");
          timestamp(o, "consentAt");
          num(o, "heightCm", 80, 250, true);
          num(o, "birthYear", 1900, 2200, true);
          break;
        case "baselines":
          date(o, "measuredAt");
          num(o, "weightKg", 20, 400);
          num(o, "bodyFatPercent", 0, 100, true);
          num(o, "leanMassKg", 0, 400, true);
          num(o, "visceralIndex", 0, 100, true);
          str(o, "source");
          break;
        case "goals":
          choice(o, "category", [...categories, "body"]);
          str(o, "title");
          bool(o, "active");
          timestamp(o, "createdAt");
          num(o, "targetValue", 0, 10000, true);
          str(o, "unit", true);
          break;
        case "templates":
          str(o, "title");
          if (!(o.title as string).trim() || (o.title as string).length > 120)
            throw new Error("Título inválido.");
          bool(o, "active");
          date(o, "createdDate");
          if (
            !Array.isArray(o.recurrenceDays) ||
            o.recurrenceDays.some(
              (d) => !Number.isInteger(d) || d < 0 || d > 6,
            ) ||
            new Set(o.recurrenceDays).size !== o.recurrenceDays.length
          )
            throw new Error("Recorrência inválida.");
          if (o.oneOffDate !== undefined) date(o, "oneOffDate");
          if (!o.oneOffDate && !o.recurrenceDays.length)
            throw new Error("Agenda vazia.");
          break;
        case "occurrences":
          str(o, "titleSnapshot");
          date(o, "localDate");
          choice(o, "status", ["pending", "completed", "skipped", "postponed"]);
          str(o, "templateId", true);
          str(o, "originId", true);
          if (o.completedAt !== undefined) timestamp(o, "completedAt");
          if (o.status === "completed" && !o.completedAt)
            throw new Error("Conclusão sem horário.");
          break;
        case "workouts":
          date(o, "localDate");
          choice(o, "workoutType", ["walk", "calisthenics"]);
          num(o, "minutes", 0.01, 1440);
          num(o, "effort", 0, 10, true);
          if (!Array.isArray(o.exercises))
            throw new Error("Exercícios inválidos.");
          for (const ex of o.exercises) {
            const e = object(ex);
            str(e, "name");
            num(e, "sets", 1, 100);
            num(e, "reps", 1, 1000);
          }
          break;
        case "meals":
          date(o, "localDate");
          str(o, "mealType");
          str(o, "at", true);
          if (o.at && !/^([01]\d|2[0-3]):[0-5]\d$/.test(o.at as string))
            throw new Error("Horário inválido.");
          choice(o, "status", ["completed", "skipped", "postponed"]);
          num(o, "hunger", 0, 10, true);
          break;
        case "guitar":
          date(o, "localDate");
          num(o, "durationMinutes", 0.01, 1440);
          num(o, "bpm", 20, 400, true);
          break;
        case "measurements":
          date(o, "date");
          validateMeasurement(
            o.weightKg as number | undefined,
            o.waistCm as number | undefined,
          );
          num(o, "bodyFatPercent", 0, 100, true);
          break;
        case "xp":
          choice(o, "sourceType", ["task", "day"]);
          str(o, "sourceId");
          num(o, "points", 0, 100);
          if (!Number.isInteger(o.points)) throw new Error("XP inválido.");
          timestamp(o, "createdAt");
          break;
        case "badges":
          choice(o, "badgeId", [
            "first",
            "walks",
            "week",
            "strings",
            "return",
            "month",
          ]);
          timestamp(o, "unlockedAt");
          break;
        case "reflections":
          date(o, "localDate");
          str(o, "notes");
          timestamp(o, "createdAt");
          break;
        case "settings":
          choice(o, "theme", ["forest", "midnight"]);
          choice(o, "locale", ["pt-BR"]);
          for (const key of [
            "animationsEnabled",
            "reducedMotion",
            "soundEnabled",
            "hapticsEnabled",
            "notificationsEnabled",
            "hideBody",
            "hideStreak",
            "skipReactions",
          ])
            bool(o, key);
          if (o.gifsEnabled !== undefined) bool(o, "gifsEnabled");
          if (o.reminders !== undefined) {
            const r = object(o.reminders);
            for (const key of ["missions", "morning", "evening"]) bool(r, key);
            num(r, "lead", 0, 120);
            for (const key of ["morningTime", "eveningTime"]) {
              str(r, key);
              if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(r[key] as string))
                throw new Error(`Horário inválido: ${key}.`);
            }
          }
          num(o, "guitarMinutes", 1, 180);
          num(o, "guitarWeeklyGoal", 1, 7);
          if (
            !Array.isArray(o.guitarBlocks) ||
            o.guitarBlocks.length !== 4 ||
            o.guitarBlocks.some(
              (n) =>
                typeof n !== "number" || !Number.isFinite(n) || n < 1 || n > 60,
            )
          )
            throw new Error("Blocos de prática inválidos.");
          if (o.lastAgendaDate !== undefined) date(o, "lastAgendaDate");
          if (o.guitarTimer !== undefined) {
            const timer = object(o.guitarTimer);
            num(timer, "elapsedSeconds", 0, 86400);
            num(timer, "startedAt", 0, 1e15, true);
            num(timer, "targetSeconds", 60, 14400);
            date(timer, "localDate");
          }
          break;
      }
    }
  }
  const s = data as unknown as State;
  if (
    s.profiles.length !== 1 ||
    !s.profiles[0]?.onboardingCompleted ||
    s.settings.length !== 1 ||
    s.settings[0]?.id !== "settings"
  )
    throw new Error("Backup deve conter um perfil e suas configurações.");
  const unique = (keys: string[]) => {
    if (new Set(keys).size !== keys.length)
      throw new Error("Backup contém registros duplicados.");
  };
  unique(s.xp.map((e) => `${e.sourceType}:${e.sourceId}`));
  unique(s.badges.map((b) => b.badgeId));
  unique(
    s.occurrences
      .filter((o) => o.templateId)
      .map((o) => `${o.templateId}:${o.localDate}`),
  );
  unique(s.reflections.map((r) => r.localDate));
  for (const o of s.occurrences) {
    if (o.templateId && !s.templates.some((t) => t.id === o.templateId))
      throw new Error("Missão com modelo ausente.");
    if (o.originId && !s.occurrences.some((p) => p.id === o.originId))
      throw new Error("Missão com origem ausente.");
  }
  for (const e of s.xp)
    if (
      e.sourceType === "task"
        ? !s.occurrences.some((o) => o.id === e.sourceId)
        : !validDate(e.sourceId)
    )
      throw new Error("Origem de XP inválida.");
  return s;
}
export function exportBackup(s: State): string {
  return JSON.stringify(
    {
      format: "tupiniplanner",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: s,
    },
    null,
    2,
  );
}
