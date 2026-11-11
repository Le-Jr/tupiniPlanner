import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "../src/domain/model.ts";
import { planReminders, sampleReminder } from "../src/domain/reminders.ts";
import { exportBackup, parseBackup } from "../src/domain/backup.ts";

// 2026-11-11 is a Wednesday (getDay() === 3).
const now = new Date(2026, 10, 11, 8, 0, 0);

function state() {
  const s = emptyState();
  const iso = now.toISOString();
  s.profiles.push({
    id: "p1",
    displayName: "Leandro Junior",
    onboardingCompleted: true,
    consentAt: iso,
    createdAt: iso,
  });
  s.settings[0].notificationsEnabled = true;
  s.templates.push({
    id: "walk",
    category: "movement",
    title: "Caminhada 20 min",
    recurrenceDays: [3, 4],
    localTime: "18:30",
    active: true,
    xpValue: 10,
    order: 0,
    createdDate: "2026-11-01",
  });
  s.occurrences.push({
    id: "o1",
    templateId: "walk",
    localDate: "2026-11-11",
    titleSnapshot: "Caminhada 20 min",
    category: "movement",
    status: "pending",
    localTime: "18:30",
    xpValue: 10,
    order: 0,
  });
  return s;
}

test("no reminders unless the user turned them on", () => {
  const s = state();
  s.settings[0].notificationsEnabled = false;
  assert.deepEqual(planReminders(s, now), []);
});

test("plans personalized mission, morning and evening reminders", () => {
  const list = planReminders(state(), now);
  const today = list.filter(
    (r) => r.id.endsWith("2026-11-11") || r.id === "mission:o1",
  );
  // 07:00 morning already passed at 08:00, so only mission + evening today.
  assert.deepEqual(
    today.map((r) => r.kind),
    ["mission", "evening"],
  );
  const mission = today[0];
  assert.equal(mission.at.getHours(), 18);
  assert.equal(mission.at.getMinutes(), 30);
  assert.match(mission.title, /18:30 · Caminhada 20 min/);
  assert.match(mission.body, /Leandro/);
  assert.doesNotMatch(mission.body, /\{n\}/);
  assert.match(today[1].body, /Faltam 1 de 1 missão/);
  // Thursday comes from the template, before it is materialized.
  assert.ok(list.some((r) => r.id === "mission:walk@2026-11-12"));
  assert.ok(list.some((r) => r.id === "morning:2026-11-12"));
  // Friday has no missions: no morning or evening noise.
  assert.ok(!list.some((r) => r.id.endsWith("2026-11-13")));
  for (let i = 1; i < list.length; i++)
    assert.ok(list[i - 1].at <= list[i].at, "sorted by time");
});

test("respects lead time, sub-toggles and completed missions", () => {
  const s = state();
  s.settings[0].reminders = {
    missions: true,
    lead: 15,
    morning: false,
    morningTime: "07:00",
    evening: true,
    eveningTime: "21:00",
  };
  let list = planReminders(s, now);
  const m = list.find((r) => r.id === "mission:o1");
  assert.equal(m.at.getMinutes(), 15);
  assert.match(m.title, /Em 15 min/);
  assert.ok(!list.some((r) => r.kind === "morning"));
  s.occurrences[0].status = "completed";
  list = planReminders(s, now);
  assert.ok(!list.some((r) => r.id === "mission:o1"));
  assert.ok(!list.some((r) => r.id === "evening:2026-11-11"));
});

test("sample reminder fires in a few seconds and names the user", () => {
  const r = sampleReminder(state(), now);
  assert.equal(r.at.getTime() - now.getTime(), 5000);
  assert.match(r.title, /Leandro/);
});

test("backup accepts reminder prefs and rejects bad times", () => {
  const s = state();
  s.settings[0].reminders = {
    missions: true,
    lead: 10,
    morning: true,
    morningTime: "07:00",
    evening: false,
    eveningTime: "21:00",
  };
  assert.equal(
    parseBackup(exportBackup(s)).settings[0].reminders.morningTime,
    "07:00",
  );
  s.settings[0].reminders.morningTime = "25:00";
  assert.throws(() => parseBackup(exportBackup(s)), /Horário inválido/);
});
