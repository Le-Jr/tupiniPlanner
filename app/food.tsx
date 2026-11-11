import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  AppCard,
  AppText,
  Button,
  Chip,
  Field,
  Screen,
  SectionHeader,
  styles,
} from "../src/components/ui";
import { useApp, uuid } from "../src/features/AppProvider";
import { dayTasks, setStatus, validDate } from "../src/domain/planner";
import { numberInput } from "../src/utils/input";
import { LogMission } from "../src/features/LogMission";
import { MissionRow } from "../src/components/MissionRow";
export default function Food() {
  const { state, today, run, mutate, busy, celebrate } = useApp();
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
  const [saved, setSaved] = useState(false);
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
      setSaved(true);
      if (awards[0]) celebrate(awards[0]);
    });
  return (
    <Screen>
      <AppText variant="micro" tone="green">
        ALIMENTAÇÃO // SEM JULGAMENTO
      </AppText>
      <AppText variant="title">Organização primeiro.</AppText>
      <AppText tone="muted">
        Observe sua rotina e sua fome. Os horários são lembretes ajustáveis, não
        uma obrigação de comer.
      </AppText>
      <SectionHeader title="Lembretes de hoje" />
      {dayTasks(state, today, "meal").map((t) => (
        <MissionRow key={t.id} task={t} />
      ))}
      <Button
        title="Ajustar refeições e horários"
        secondary
        onPress={() => router.push("/missions")}
      />
      <SectionHeader title="Como foi sua refeição?" />
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
              { id: "completed", label: "Feito" },
              { id: "postponed", label: "Adiado" },
              { id: "skipped", label: "Não fiz" },
            ] as const
          ).map((s) => (
            <Chip
              key={s.id}
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
        <Button title="Salvar registro" onPress={save} disabled={busy} />
        {saved && (
          <AppText tone="green" accessibilityLiveRegion="polite">
            Registro salvo. Sem julgamentos.
          </AppText>
        )}
      </AppCard>
      <SectionHeader title="Seu histórico alimentar" />
      {!state.meals.length && (
        <AppText tone="muted">Nenhuma refeição registrada ainda.</AppText>
      )}
      {state.meals
        .slice()
        .reverse()
        .slice(0, 30)
        .map((m) => (
          <AppCard key={m.id}>
            <AppText>
              {m.mealType} ·{" "}
              {
                { completed: "feito", skipped: "não fiz", postponed: "adiado" }[
                  m.status
                ]
              }
            </AppText>
            <AppText variant="micro" tone="muted">
              {m.localDate} {m.at}
              {m.hunger !== undefined ? ` · fome ${m.hunger}/10` : ""}
            </AppText>
            {!!m.description && <AppText>{m.description}</AppText>}
            {!!m.notes && <AppText tone="muted">{m.notes}</AppText>}
          </AppCard>
        ))}
    </Screen>
  );
}
