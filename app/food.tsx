import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  AppCard,
  AppText,
  Button,
  Chip,
  EmptyState,
  Field,
  Pill,
  Screen,
  ScreenHeader,
  SectionHeader,
  styles,
} from "../src/components/ui";
import { categoryColors, colors as c } from "../src/theme/tokens";
import { useApp, uuid } from "../src/features/AppProvider";
import { dayTasks, setStatus, validDate } from "../src/domain/planner";
import { numberInput } from "../src/utils/input";
import { LogMission } from "../src/features/LogMission";
import { MissionRow } from "../src/components/MissionRow";
export default function Food() {
  const { state, today, run, mutate, busy, celebrate, notify } = useApp();
  const [meal, setMeal] = useState("");
  const [description, setDescription] = useState("");
  const [hunger, setHunger] = useState("");
  const [notes, setNotes] = useState("");
  const [at, setAt] = useState("");
  const [date, setDate] = useState(today);
  const [status, setMealStatus] = useState<
    "completed" | "skipped" | "postponed"
  >("completed");
  const [selected, setSelected] = useState("");
  const save = () =>
    run(async () => {
      if (!meal.trim()) throw new Error("Dê um nome ao registro.");
      if (!validDate(date) || date > today)
        throw new Error("Escolha uma data válida até hoje.");
      if (at && !/^([01]\d|2[0-3]):[0-5]\d$/.test(at))
        throw new Error("Use HH:MM no horário.");
      const level = numberInput(hunger, 0, 10, "Fome", true);
      let awards: string[] = [];
      await mutate((s) => {
        s.meals.push({
          id: uuid(),
          localDate: date,
          mealType: meal.trim(),
          description,
          hunger: level,
          notes,
          at,
          status,
        });
        if (selected && date === today && status !== "postponed")
          awards = setStatus(
            s,
            selected,
            status,
            new Date().toISOString(),
            uuid,
            notes,
            status === "skipped" ? "outro" : undefined,
          );
      });
      setSelected("");
      setDescription("");
      setNotes("");
      notify("Registro salvo. Sem julgamentos.");
      if (awards[0]) celebrate(awards[0]);
    });
  return (
    <Screen>
      <ScreenHeader
        eyebrow="ALIMENTAÇÃO · SEM JULGAMENTO"
        tone="accent"
        title="Organização primeiro."
        subtitle="Observe sua rotina e sua fome. Os horários são lembretes ajustáveis, não uma obrigação de comer."
      />
      <SectionHeader eyebrow="HOJE" title="Seus lembretes" />
      {dayTasks(state, today, "meal").map((t) => (
        <MissionRow key={t.id} task={t} />
      ))}
      <Button
        title="Ajustar refeições e horários"
        secondary
        icon="options-outline"
        onPress={() => router.push("/missions")}
      />
      <SectionHeader eyebrow="REGISTRO" title="Como foi sua refeição?" />
      <AppCard>
        <Field
          label="Nome da refeição"
          value={meal}
          onChangeText={setMeal}
          placeholder="Ex.: almoço"
        />
        <Field label="Data (AAAA-MM-DD)" value={date} onChangeText={setDate} />
        <Field
          label="Horário (HH:MM, opcional)"
          value={at}
          onChangeText={setAt}
        />
        <View style={styles.row}>
          {(
            [
              {
                id: "completed",
                label: "Feito",
                icon: "checkmark-circle",
                color: c.primary,
              },
              {
                id: "postponed",
                label: "Adiado",
                icon: "time",
                color: "#9FB4FF",
              },
              {
                id: "skipped",
                label: "Não fiz",
                icon: "cloud-outline",
                color: c.accent,
              },
            ] as const
          ).map((s) => (
            <Chip
              key={s.id}
              icon={s.icon}
              color={s.color}
              label={s.label}
              selected={status === s.id}
              onPress={() => {
                setMealStatus(s.id);
                setSelected("");
              }}
            />
          ))}
        </View>
        {status === "postponed" && (
          <AppText tone="muted">
            Este registro guarda a observação. Para mover um lembrete, use os
            detalhes da missão acima.
          </AppText>
        )}
        <Field
          label="Composição livre (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="O que fez parte da refeição?"
        />
        <Field
          label="Fome de 0 a 10 (opcional)"
          value={hunger}
          onChangeText={setHunger}
          keyboardType="decimal-pad"
        />
        <Field
          label="Observações (opcional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        {date === today && status !== "postponed" && (
          <LogMission
            tasks={dayTasks(state, today, "meal")}
            selected={selected}
            onSelect={setSelected}
          />
        )}
        <Button
          title="Salvar registro"
          icon="checkmark"
          onPress={save}
          disabled={busy}
        />
      </AppCard>
      <SectionHeader eyebrow="HISTÓRICO" title="Seu histórico alimentar" />
      {!state.meals.length && (
        <EmptyState
          icon="restaurant-outline"
          title="Nada por aqui ainda."
          detail="Seu primeiro registro já ajuda a enxergar a rotina."
        />
      )}
      {state.meals
        .slice()
        .reverse()
        .slice(0, 30)
        .map((m) => (
          <AppCard
            key={m.id}
            accent={categoryColors.meal}
            style={{ paddingLeft: 16, gap: 6 }}
          >
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <AppText
                variant="label"
                style={{ flex: 1, textTransform: "capitalize" }}
              >
                {m.mealType}
              </AppText>
              <AppText variant="micro" tone="subtle">
                {m.localDate.split("-").reverse().join("/")} {m.at}
              </AppText>
            </View>
            <View style={[styles.row, { gap: 6 }]}>
              <Pill
                label={
                  {
                    completed: "FEITO",
                    skipped: "NÃO FIZ",
                    postponed: "ADIADO",
                  }[m.status]
                }
                color={
                  {
                    completed: c.primary,
                    skipped: c.accent,
                    postponed: "#9FB4FF",
                  }[m.status]
                }
              />
              {m.hunger !== undefined && (
                <Pill icon="pulse" label={`FOME ${m.hunger}/10`} />
              )}
            </View>
            {!!m.description && (
              <AppText variant="small">{m.description}</AppText>
            )}
            {!!m.notes && (
              <AppText variant="small" tone="muted">
                {m.notes}
              </AppText>
            )}
          </AppCard>
        ))}
    </Screen>
  );
}
