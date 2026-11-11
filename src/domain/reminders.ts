import type { AppSettings, Category, State } from "./model.ts";
import { localDate, scheduled, shiftDate } from "./planner.ts";
import { quoteOfDay } from "./quotes.ts";

/** Optional reminder preferences; older data without them uses the defaults. */
export interface ReminderPrefs {
  missions: boolean;
  /** Minutes before the mission time. */
  lead: number;
  morning: boolean;
  morningTime: string;
  evening: boolean;
  eveningTime: string;
}
export const defaultReminders: ReminderPrefs = {
  missions: true,
  lead: 0,
  morning: true,
  morningTime: "07:00",
  evening: true,
  eveningTime: "21:00",
};
export const leadChoices = [0, 5, 10, 15, 30] as const;
export const morningChoices = ["06:00", "07:00", "08:00", "09:00"] as const;
export const eveningChoices = ["20:00", "21:00", "22:00"] as const;

export function reminderPrefs(settings: AppSettings): ReminderPrefs {
  return { ...defaultReminders, ...settings.reminders };
}

export function validTime(value: string): boolean {
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  return !!m && Number(m[1]) < 24 && Number(m[2]) < 60;
}

export type ReminderKind = "mission" | "morning" | "evening";
export interface Reminder {
  id: string;
  kind: ReminderKind;
  /** Local wall-clock instant. */
  at: Date;
  title: string;
  body: string;
  /** In-app route opened when the notification is tapped. */
  url: string;
}

const emoji: Record<Category, string> = {
  movement: "🏃",
  meal: "🍽️",
  guitar: "🎸",
  hydration: "💧",
  sleep: "🌙",
  custom: "⚡",
};

/** Original lines in the app's 80s-action voice; {n} is the user's name. */
const lines: Record<Category, string[]> = {
  movement: [
    "Bota o tênis, {n}. Ninguém vai treinar por você.",
    "Hora de suar, {n}. Brucutu não pula treino.",
    "Missão de movimento na tela. Partiu, {n}!",
    "{n}, o Campeão já está aquecendo. Bora?",
  ],
  meal: [
    "{n}, até o Comando para pra reabastecer.",
    "Pausa pro combustível, {n}. Come com calma.",
    "Rango na mesa, {n}. Missão cumprida começa no prato.",
  ],
  guitar: [
    "Pluga a guitarra, {n}. O palco é seu.",
    "Afina, respira e solta o riff, {n}.",
    "{n}, os dedos estão chamando. Hora do treino de cordas.",
  ],
  hydration: [
    "Um copo d'água agora, {n}. Simples assim.",
    "Hidrata, {n}. Nem o Rival aguenta sem água.",
  ],
  sleep: [
    "Desliga a tela, {n}. Campeão também descansa.",
    "Hora de recarregar, {n}. Amanhã tem mais missão.",
  ],
  custom: [
    "{n}, tem missão esperando por você.",
    "Missão na área, {n}. Bora riscar da lista.",
  ],
};

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}
function pick<T>(items: readonly T[], seed: string): T {
  return items[hash(seed) % items.length]!;
}
export function firstName(state: State): string {
  const name = state.profiles[0]?.displayName.trim().split(/\s+/)[0];
  return name || "Campeão";
}
function at(date: string, time: string, minusMinutes = 0): Date {
  const [h, m] = time.split(":").map(Number);
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(y!, mo! - 1, d!, h!, m! - minusMinutes, 0, 0);
}

interface Planned {
  key: string;
  title: string;
  category: Category;
  time?: string;
  done: boolean;
  skipped: boolean;
}
/** Missions for a date: stored occurrences plus not-yet-materialized templates. */
function missionsOn(s: State, date: string): Planned[] {
  const stored = s.occurrences.filter(
    (o) => o.localDate === date && o.status !== "postponed",
  );
  const planned: Planned[] = stored.map((o) => ({
    key: o.id,
    title: o.titleSnapshot,
    category: o.category,
    time: o.localTime,
    done: o.status !== "pending",
    skipped: o.status === "skipped",
  }));
  for (const t of s.templates)
    if (
      scheduled(t, date) &&
      !stored.some((o) => o.templateId === t.id) &&
      // A postponed copy of this template's mission already lives elsewhere.
      !s.occurrences.some(
        (o) =>
          o.templateId === t.id &&
          o.localDate === date &&
          o.status === "postponed",
      )
    )
      planned.push({
        key: `${t.id}@${date}`,
        title: t.title,
        category: t.category,
        time: t.localTime,
        done: false,
        skipped: false,
      });
  return planned;
}

/**
 * Personalized local reminders for the next `days` days. Pure: the caller
 * schedules them with the OS and re-plans whenever the data changes.
 */
export function planReminders(s: State, now: Date, days = 3): Reminder[] {
  const settings = s.settings[0];
  if (!settings?.notificationsEnabled || !s.profiles[0]?.onboardingCompleted)
    return [];
  const prefs = reminderPrefs(settings);
  const n = firstName(s);
  const today = localDate(now);
  const out: Reminder[] = [];
  for (let d = 0; d < days; d++) {
    const date = shiftDate(today, d);
    const missions = missionsOn(s, date);
    const open = missions.filter((m) => !m.done);
    if (prefs.missions)
      for (const m of open) {
        if (!m.time || !validTime(m.time)) continue;
        const when = at(date, m.time, prefs.lead);
        out.push({
          id: `mission:${m.key}`,
          kind: "mission",
          at: when,
          title: `${emoji[m.category]} ${prefs.lead ? `Em ${prefs.lead} min` : m.time} · ${m.title}`,
          body: pick(lines[m.category], m.key + date).replace("{n}", n),
          url: "/missions",
        });
      }
    if (prefs.morning && missions.length && validTime(prefs.morningTime)) {
      const quote = quoteOfDay(date);
      const count = missions.length;
      out.push({
        id: `morning:${date}`,
        kind: "morning",
        at: at(date, prefs.morningTime),
        title: `Bom dia, ${n}! ▶ Fita do dia`,
        body: `${count} ${count === 1 ? "missão" : "missões"} hoje. “${quote.text}” — ${quote.who}`,
        url: "/",
      });
    }
    if (prefs.evening && open.length && validTime(prefs.eveningTime)) {
      const total = missions.length;
      out.push({
        id: `evening:${date}`,
        kind: "evening",
        at: at(date, prefs.eveningTime),
        title: d === 0 ? `Ainda dá tempo, ${n}` : `Placar do dia, ${n}`,
        body:
          d === 0
            ? `Faltam ${open.length} de ${total} ${total === 1 ? "missão" : "missões"}.${missions.some((m) => m.skipped) ? " Marca o que rolou e fecha o placar." : " Fecha o dia e leva +20 XP."}`
            : "Marca o que rolou e o que não rolou. Sem julgamento, só registro.",
        url: "/missions",
      });
    }
  }
  return out
    .filter((r) => r.at.getTime() > now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, 60);
}

/** One-off sample so the user can preview the style right away. */
export function sampleReminder(s: State, now: Date): Reminder {
  const n = firstName(s);
  const quote = quoteOfDay(localDate(now));
  return {
    id: `test:${now.getTime()}`,
    kind: "morning",
    at: new Date(now.getTime() + 5000),
    title: `▶ PLAY · Teste de transmissão, ${n}`,
    body: `“${quote.text}” — ${quote.who}`,
    url: "/",
  };
}
