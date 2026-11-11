import React from "react";
import { View } from "react-native";
import { shiftDate, weekStart, progress, dayTasks } from "../domain/planner";
import { useApp } from "../features/AppProvider";
import { AppText, IconButton, PressableScale } from "./ui";
import { colors as c, fonts, radius } from "../theme/tokens";

const names = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

/** Mon–Sun week selector with per-day progress dots. */
export function DateStrip({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const { state, today } = useApp();
  const start = weekStart(value);
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(start, i));
  const month = new Date(`${value}T12:00:00`)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .toUpperCase();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <IconButton
          icon="chevron-back"
          label="Semana anterior"
          color={c.muted}
          onPress={() => onChange(shiftDate(value, -7))}
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          <AppText variant="micro" tone="muted">
            {month}
          </AppText>
          {value !== today && (
            <AppText
              variant="micro"
              tone="green"
              accessibilityRole="button"
              onPress={() => onChange(today)}
              style={{ paddingVertical: 4 }}
            >
              ↺ VOLTAR PARA HOJE
            </AppText>
          )}
        </View>
        <IconButton
          icon="chevron-forward"
          label="Próxima semana"
          color={c.muted}
          onPress={() => onChange(shiftDate(value, 7))}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {days.map((d, i) => {
          const selected = d === value;
          const isToday = d === today;
          const p = progress(dayTasks(state, d));
          const dot = !p.total
            ? "transparent"
            : p.done === p.total
              ? c.primary
              : p.done
                ? c.accent
                : c.lineStrong;
          return (
            <PressableScale
              key={d}
              haptic={false}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}${isToday ? ", hoje" : ""}${p.total ? `, ${p.done} de ${p.total} missões` : ""}`}
              onPress={() => onChange(d)}
              style={{
                flex: 1,
                minHeight: 68,
                borderRadius: radius.md,
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                borderWidth: 1,
                borderColor: selected
                  ? c.primary
                  : isToday
                    ? c.lineStrong
                    : c.line,
                backgroundColor: selected ? c.primary : c.surface,
              }}
            >
              <AppText
                variant="micro"
                style={{
                  fontSize: 9,
                  lineHeight: 12,
                  letterSpacing: 0.5,
                  color: selected ? c.onPrimary : c.subtle,
                }}
              >
                {names[i]}
              </AppText>
              <AppText
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 17,
                  lineHeight: 21,
                  color: selected ? c.onPrimary : isToday ? c.primary : c.ivory,
                }}
              >
                {Number(d.slice(8))}
              </AppText>
              <View
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: selected && p.total ? c.onPrimary : dot,
                }}
              />
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
