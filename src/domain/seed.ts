import { type State, type Category } from "./model.ts";
export function seedPlan(s: State, today: string, id: () => string): void {
  if (s.templates.length) return;
  const add = (
    title: string,
    category: Category,
    recurrenceDays: number[],
    xpValue: number,
    localTime?: string,
    workoutRef?: "walk" | "calisthenics",
  ) =>
    s.templates.push({
      id: id(),
      title,
      category,
      recurrenceDays,
      xpValue,
      localTime,
      workoutRef,
      active: true,
      createdDate: today,
      order: s.templates.length,
    });
  add(
    "Calistenia · um passo possível",
    "movement",
    [1, 4],
    30,
    undefined,
    "calisthenics",
  );
  add("Caminhada leve · 15 min", "movement", [2, 5, 6], 20, undefined, "walk");
  ["Café da manhã", "Almoço", "Lanche", "Jantar"].forEach((t, i) =>
    add(
      t,
      "meal",
      [0, 1, 2, 3, 4, 5, 6],
      15,
      ["08:30", "12:30", "16:30", "19:30"][i],
    ),
  );
  add("Guitarra · 25 min no seu ritmo", "guitar", [1, 3, 5, 6], 20);
}
