import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "../src/domain/model.ts";
import { seedPlan } from "../src/domain/seed.ts";
import {
  dayTasks,
  goalPercent,
  localDate,
  materialize,
  plannedStreak,
  postpone,
  progress,
  saveTemplate,
  setStatus,
  shiftDate,
  totalXP,
  validDate,
  validateMeasurement,
  weeklyWeights,
} from "../src/domain/planner.ts";
import { exportBackup, parseBackup } from "../src/domain/backup.ts";
import { elapsedSeconds } from "../src/domain/timer.ts";
let counter = 0;
const id = () => `id-${++counter}`;
const now = "2026-11-10T12:00:00.000Z";
function fixture(days = [1, 2, 3, 4, 5, 6, 0]) {
  const s = emptyState();
  s.profiles.push({
    id: id(),
    displayName: "",
    onboardingCompleted: true,
    consentAt: now,
    createdAt: now,
  });
  s.templates.push({
    id: id(),
    title: "Caminhada",
    category: "movement",
    recurrenceDays: days,
    active: true,
    xpValue: 20,
    order: 0,
    createdDate: "2026-11-01",
    workoutRef: "walk",
  });
  return s;
}
test("clean install has no invented profile, health data or tasks", () => {
  const s = emptyState();
  assert.equal(s.profiles.length, 0);
  assert.equal(s.measurements.length, 0);
  assert.equal(s.templates.length, 0);
});
test("recurrence uses local calendar; seed is optional and idempotent", () => {
  const s = emptyState();
  seedPlan(s, "2026-11-10", id);
  seedPlan(s, "2026-11-10", id);
  assert.equal(s.templates.length, 7);
  materialize(s, "2026-11-10", id);
  materialize(s, "2026-11-10", id);
  assert.equal(s.occurrences.length, 5);
  assert.equal(s.occurrences.filter((t) => t.workoutRef === "walk").length, 1);
  materialize(s, "2026-11-08", id);
  assert.equal(s.occurrences.length, 5);
});
test("completing, undoing and rechecking never duplicate XP or badges", () => {
  const s = fixture();
  materialize(s, "2026-11-10", id);
  const task = s.occurrences[0];
  assert.deepEqual(setStatus(s, task.id, "completed", now, id), ["first"]);
  assert.equal(totalXP(s), 40);
  setStatus(s, task.id, "pending", now, id);
  assert.equal(progress(s.occurrences).done, 0);
  assert.equal(totalXP(s), 40);
  assert.deepEqual(setStatus(s, task.id, "completed", now, id), []);
  assert.equal(totalXP(s), 40);
});
test("skip stores reason, preserves XP and prevents full-day bonus", () => {
  const s = fixture();
  materialize(s, "2026-11-10", id);
  setStatus(
    s,
    s.occurrences[0].id,
    "skipped",
    now,
    id,
    "Hoje precisei descansar",
    "cansaço",
  );
  assert.equal(totalXP(s), 0);
  assert.equal(s.occurrences[0].reason, "cansaço");
  assert.equal(s.occurrences[0].notes, "Hoje precisei descansar");
  assert.deepEqual(progress(s.occurrences), { done: 0, total: 1 });
});
test("empty day cannot earn bonus", () => {
  const s = emptyState();
  assert.deepEqual(progress(s.occurrences), { done: 0, total: 0 });
  assert.equal(totalXP(s), 0);
});
test("postponing repeatedly keeps reward origin and notes", () => {
  const s = fixture();
  materialize(s, "2026-11-10", id);
  const original = s.occurrences[0];
  setStatus(s, original.id, "completed", now, id);
  postpone(s, original.id, "2026-11-11", id, "Ajustando a rota");
  const second = s.occurrences[1];
  postpone(s, second.id, "2026-11-12", id);
  setStatus(s, s.occurrences[2].id, "completed", now, id);
  assert.equal(s.xp.filter((e) => e.sourceType === "task").length, 1);
  assert.equal(s.occurrences[2].originId, original.id);
  assert.equal(s.occurrences[2].notes, "Ajustando a rota");
  assert.throws(() => setStatus(s, original.id, "completed", now, id));
  assert.throws(() => postpone(s, s.occurrences[2].id, "2026-11-11", id));
});
test("rest days do not break streak, incomplete planned days do", () => {
  const s = fixture([1, 4]);
  ["2026-11-02", "2026-11-05", "2026-11-09"].forEach((date) => {
    materialize(s, date, id);
    setStatus(s, dayTasks(s, date)[0].id, "completed", now, id);
  });
  assert.equal(plannedStreak(s, "2026-11-10"), 3);
  materialize(s, "2026-11-12", id);
  assert.equal(plannedStreak(s, "2026-11-12"), 3);
  assert.equal(plannedStreak(s, "2026-11-13"), 0);
});
test("editing a template preserves historical snapshots", () => {
  const s = fixture();
  materialize(s, "2026-11-09", id);
  materialize(s, "2026-11-10", id);
  saveTemplate(
    s,
    { ...s.templates[0], title: "Novo nome", localTime: "10:00" },
    "2026-11-10",
    id,
  );
  assert.equal(dayTasks(s, "2026-11-09")[0].titleSnapshot, "Caminhada");
  assert.equal(dayTasks(s, "2026-11-10")[0].titleSnapshot, "Novo nome");
  assert.throws(() =>
    saveTemplate(
      s,
      { ...s.templates[0], localTime: "25:99" },
      "2026-11-10",
      id,
    ),
  );
});
test("one-off, pause and resume do not create duplicates", () => {
  const s = fixture();
  s.templates[0].oneOffDate = "2026-11-10";
  materialize(s, "2026-11-11", id);
  assert.equal(s.occurrences.length, 0);
  materialize(s, "2026-11-10", id);
  saveTemplate(s, { ...s.templates[0], active: false }, "2026-11-10", id);
  assert.equal(s.occurrences.length, 0);
  saveTemplate(s, { ...s.templates[0], active: true }, "2026-11-10", id);
  materialize(s, "2026-11-10", id);
  assert.equal(s.occurrences.length, 1);
});
test("measurements reject missing and invalid data; trend is based on real weekly means", () => {
  assert.throws(() => validateMeasurement());
  for (const bad of [NaN, Infinity, -1, 500])
    assert.throws(() => validateMeasurement(bad));
  validateMeasurement(undefined, 90);
  assert.equal(goalPercent(100, 95, 90), 50);
  assert.equal(goalPercent(100, 105, 90), 0);
  assert.equal(goalPercent(100, 85, 90), 100);
  const s = emptyState();
  assert.deepEqual(weeklyWeights(s), []);
  s.measurements = [
    { id: id(), date: "2026-11-09", weightKg: 100 },
    { id: id(), date: "2026-11-11", weightKg: 98 },
  ];
  assert.deepEqual(weeklyWeights(s), [{ date: "2026-11-09", weight: 99 }]);
});
test("dates and DST changes use calendar days rather than 24-hour arithmetic", () => {
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-13-01"), false);
  assert.equal(shiftDate("2026-12-31", 1), "2027-01-01");
  const previous = process.env.TZ;
  process.env.TZ = "America/New_York";
  assert.equal(shiftDate("2026-03-08", 1), "2026-03-09");
  assert.equal(localDate(new Date(2026, 2, 8, 23, 59)), "2026-03-08");
  if (previous) process.env.TZ = previous;
  else delete process.env.TZ;
});
test("timer survives background time, pause and clock regression", () => {
  const timer = {
    elapsedSeconds: 30,
    startedAt: 100000,
    targetSeconds: 600,
    localDate: "2026-11-10",
  };
  assert.equal(elapsedSeconds(timer, 160000), 90);
  assert.equal(elapsedSeconds({ ...timer, startedAt: undefined }, 300000), 30);
  assert.equal(elapsedSeconds(timer, 90000), 30);
  assert.equal(elapsedSeconds(timer, 900000), 600);
});
test("backup round-trip preserves all data and rejects malformed data", () => {
  const s = fixture();
  materialize(s, "2026-11-10", id);
  setStatus(s, s.occurrences[0].id, "completed", now, id);
  assert.deepEqual(parseBackup(exportBackup(s)), JSON.parse(JSON.stringify(s)));
  for (const bad of [
    "{",
    "{}",
    JSON.stringify({ format: "tupiniplanner", version: 2, data: s }),
  ])
    assert.throws(() => parseBackup(bad));
  const tamper = (fn) => {
    const clone = structuredClone(s);
    fn(clone);
    assert.throws(() => parseBackup(exportBackup(clone)));
  };
  tamper((s) => s.xp.push({ ...s.xp[0], id: id() }));
  tamper((s) => (s.occurrences[0].templateId = "missing"));
  tamper((s) => (s.templates[0].recurrenceDays = [7]));
  tamper((s) =>
    s.measurements.push({ id: id(), date: "2026-11-10", weightKg: "96" }),
  );
  tamper((s) => (s.settings[0].guitarBlocks = [-1, 5, 10, 5]));
  tamper((s) => (s.settings[0].guitarTimer = { elapsedSeconds: "bad" }));
});
