import {
  type Category,
  type State,
  type TaskOccurrence,
  type TaskTemplate,
} from "./model.ts";
export function localDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function validDate(value: string): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "1900-01-01" ||
    value > "2200-12-31"
  )
    return false;
  const d = new Date(`${value}T12:00:00`);
  return Number.isFinite(d.getTime()) && localDate(d) === value;
}
export function shiftDate(value: string, days: number): string {
  const d = new Date(`${value}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d);
}
export function scheduled(t: TaskTemplate, date: string): boolean {
  return (
    t.active &&
    date >= t.createdDate &&
    (t.oneOffDate
      ? date === t.oneOffDate
      : t.recurrenceDays.includes(new Date(`${date}T12:00:00`).getDay()))
  );
}
export function materialize(s: State, date: string, id: () => string): void {
  if (!validDate(date)) throw new Error("Data inválida. Use AAAA-MM-DD.");
  for (const t of s.templates)
    if (
      scheduled(t, date) &&
      !s.occurrences.some((o) => o.templateId === t.id && o.localDate === date)
    )
      s.occurrences.push({
        id: id(),
        templateId: t.id,
        localDate: date,
        titleSnapshot: t.title,
        category: t.category,
        status: "pending",
        localTime: t.localTime,
        xpValue: t.xpValue,
        order: t.order,
        workoutRef: t.workoutRef,
      });
}
export function dayTasks(
  s: State,
  date: string,
  category?: Category,
): TaskOccurrence[] {
  return s.occurrences
    .filter(
      (o) => o.localDate === date && (!category || o.category === category),
    )
    .sort(
      (a, b) =>
        a.category.localeCompare(b.category) ||
        (a.localTime ?? "99:99").localeCompare(b.localTime ?? "99:99") ||
        a.order - b.order,
    );
}
export function progress(tasks: TaskOccurrence[]) {
  const eligible = tasks.filter((o) => o.status !== "postponed");
  return {
    done: eligible.filter((o) => o.status === "completed").length,
    total: eligible.length,
  };
}
export function totalXP(s: State): number {
  return s.xp.reduce((sum, e) => sum + e.points, 0);
}
// A reward belongs to the original task, including when it was postponed more than once.
export function rewardSource(o: TaskOccurrence): string {
  return o.originId ?? o.id;
}
export function setStatus(
  s: State,
  occurrenceId: string,
  status: "pending" | "completed" | "skipped",
  now: string,
  id: () => string,
  notes?: string,
  reason?: string,
): string[] {
  const o = s.occurrences.find((o) => o.id === occurrenceId);
  if (!o) throw new Error("Missão não encontrada.");
  if (o.status === "postponed")
    throw new Error(
      "Esta missão foi reprogramada. Edite a missão na nova data.",
    );
  o.status = status;
  o.notes = notes ?? o.notes;
  o.reason = status === "skipped" ? reason : undefined;
  o.completedAt = status === "completed" ? now : undefined;
  if (status === "completed") {
    const sourceId = rewardSource(o);
    if (!s.xp.some((e) => e.sourceType === "task" && e.sourceId === sourceId))
      s.xp.push({
        id: id(),
        sourceType: "task",
        sourceId,
        points: o.xpValue,
        createdAt: now,
      });
    const p = progress(dayTasks(s, o.localDate));
    if (
      p.total > 0 &&
      p.done === p.total &&
      !s.xp.some((e) => e.sourceType === "day" && e.sourceId === o.localDate)
    )
      s.xp.push({
        id: id(),
        sourceType: "day",
        sourceId: o.localDate,
        points: 20,
        createdAt: now,
      });
  }
  return unlockBadges(s, now, id);
}
export function postpone(
  s: State,
  occurrenceId: string,
  target: string,
  id: () => string,
  notes?: string,
): void {
  const o = s.occurrences.find((o) => o.id === occurrenceId);
  if (!o || o.status === "postponed")
    throw new Error("Missão indisponível para reagendamento.");
  if (!validDate(target) || target <= o.localDate)
    throw new Error("Escolha uma data posterior à missão.");
  o.status = "postponed";
  o.notes = notes ?? o.notes;
  o.completedAt = undefined;
  s.occurrences.push({
    ...o,
    id: id(),
    templateId: undefined,
    originId: rewardSource(o),
    localDate: target,
    status: "pending",
    reason: undefined,
  });
}
// Completed, skipped and past snapshots are immutable when a recurring plan is edited.
export function saveTemplate(
  s: State,
  t: TaskTemplate,
  today: string,
  id: () => string,
): void {
  if (!t.title.trim() || t.title.length > 120)
    throw new Error("Informe um título de até 120 caracteres.");
  if (!Number.isInteger(t.xpValue) || t.xpValue < 0 || t.xpValue > 100)
    throw new Error("XP deve ser um inteiro entre 0 e 100.");
  if (t.localTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(t.localTime))
    throw new Error("Horário deve estar em HH:MM.");
  if (!t.oneOffDate && !t.recurrenceDays.length)
    throw new Error("Escolha dias da semana ou uma data única.");
  if (t.oneOffDate && (!validDate(t.oneOffDate) || t.oneOffDate < today))
    throw new Error("Escolha uma data a partir de hoje.");
  const index = s.templates.findIndex((x) => x.id === t.id);
  if (index >= 0) s.templates[index] = t;
  else s.templates.push(t);
  s.occurrences = s.occurrences.filter(
    (o) =>
      !(
        o.templateId === t.id &&
        o.localDate >= today &&
        o.status === "pending" &&
        !s.xp.some((e) => e.sourceId === rewardSource(o))
      ),
  );
  materialize(s, today, id);
}
export function plannedStreak(
  s: State,
  through: string,
  category?: Category,
): number {
  const dates = [
    ...new Set(
      s.occurrences
        .filter(
          (o) =>
            o.localDate <= through &&
            (!category || o.category === category) &&
            o.status !== "postponed",
        )
        .map((o) => o.localDate),
    ),
  ]
    .sort()
    .reverse();
  let count = 0;
  for (const date of dates) {
    const p = progress(dayTasks(s, date, category));
    if (p.done === p.total && p.total) count++;
    else if (date !== through) break;
  }
  return count;
}
export const badgeDefinitions = [
  {
    id: "first",
    title: "Primeiro Passo",
    description: "Sua primeira missão concluída.",
    character: 0,
  },
  {
    id: "walks",
    title: "3 Caminhadas",
    description: "Três caminhadas registradas no planner.",
    character: 1,
  },
  {
    id: "week",
    title: "Primeira Semana",
    description: "Sete dias de compromisso cumpridos.",
    character: 2,
  },
  {
    id: "strings",
    title: "Cordas em Chamas",
    description: "Quatro missões de guitarra concluídas.",
    character: 3,
  },
  {
    id: "return",
    title: "Voltou ao Jogo",
    description: "Uma ação depois de um dia difícil.",
    character: 0,
  },
  {
    id: "month",
    title: "Quatro Semanas",
    description: "28 dias de compromisso cumpridos.",
    character: 1,
  },
];
export function unlockBadges(
  s: State,
  now: string,
  id: () => string,
): string[] {
  const done = s.occurrences.filter((o) => o.status === "completed");
  const days = [...new Set(done.map((o) => o.localDate))];
  const fullDays = days.filter((d) => {
    const p = progress(dayTasks(s, d));
    return p.total > 0 && p.done === p.total;
  });
  const conditions = [
    done.length > 0,
    done.filter((o) => o.workoutRef === "walk").length >= 3,
    fullDays.length >= 7,
    done.filter((o) => o.category === "guitar").length >= 4,
    done.some((o) =>
      s.occurrences.some(
        (p) => p.localDate < o.localDate && p.status === "skipped",
      ),
    ),
    fullDays.length >= 28,
  ];
  const unlocked: string[] = [];
  badgeDefinitions.forEach((b, i) => {
    if (conditions[i] && !s.badges.some((u) => u.badgeId === b.id)) {
      s.badges.push({ id: id(), badgeId: b.id, unlockedAt: now });
      unlocked.push(b.id);
    }
  });
  return unlocked;
}
export function validateMeasurement(weight?: number, waist?: number): void {
  if (weight === undefined && waist === undefined)
    throw new Error("Informe peso ou cintura.");
  if (
    weight !== undefined &&
    (!Number.isFinite(weight) || weight < 20 || weight > 400)
  )
    throw new Error("Peso deve estar entre 20 e 400 kg.");
  if (
    waist !== undefined &&
    (!Number.isFinite(waist) || waist < 30 || waist > 300)
  )
    throw new Error("Cintura deve estar entre 30 e 300 cm.");
}
export function goalPercent(
  start: number,
  current: number,
  goal: number,
): number {
  if (start === goal) return current === goal ? 100 : 0;
  return Math.max(0, Math.min(100, ((current - start) / (goal - start)) * 100));
}
export function weekStart(date: string): string {
  const day = new Date(`${date}T12:00:00`).getDay();
  return shiftDate(date, -(day + 6) % 7);
}
export function weeklyWeights(s: State): { date: string; weight: number }[] {
  const groups = new Map<string, number[]>();
  for (const m of s.measurements)
    if (m.weightKg !== undefined) {
      const key = weekStart(m.date);
      groups.set(key, [...(groups.get(key) ?? []), m.weightKg]);
    }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, weights]) => ({
      date,
      weight: weights.reduce((a, b) => a + b, 0) / weights.length,
    }));
}
