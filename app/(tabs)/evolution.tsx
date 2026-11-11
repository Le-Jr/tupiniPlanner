import React, { useState } from "react";
import { View } from "react-native";
import {
  AppCard,
  AppText,
  Button,
  Field,
  Screen,
  SectionHeader,
  Toggle,
  styles,
} from "../../src/components/ui";
import { useApp, uuid } from "../../src/features/AppProvider";
import {
  categories,
  categoryNames,
  type BodyMeasurement,
} from "../../src/domain/model";
import {
  dayTasks,
  goalPercent,
  progress,
  validDate,
  weeklyWeights,
  weekStart,
} from "../../src/domain/planner";
import { numberInput } from "../../src/utils/input";
import { WeightChart } from "../../src/components/WeightChart";
export default function Evolution() {
  const { state, today, mutate, run, busy } = useApp();
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const hidden = state.settings[0]!.hideBody;
  const measures = state.measurements
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  const weights = measures.filter((m) => m.weightKg !== undefined);
  const target = state.goals.find(
    (g) => g.category === "body" && g.active,
  )?.targetValue;
  const save = () =>
    run(async () => {
      if (!validDate(date) || date > today)
        throw new Error("Escolha uma data válida até hoje.");
      const kg = numberInput(weight, 20, 400, "Peso", true);
      const cm = numberInput(waist, 30, 300, "Cintura", true);
      if (kg === undefined && cm === undefined)
        throw new Error("Informe peso ou cintura.");
      await mutate((s) => {
        const old = s.measurements.find((m) => m.id === editing);
        const m: BodyMeasurement = {
          ...old,
          id: editing ?? uuid(),
          date,
          weightKg: kg,
          waistCm: cm,
          notes,
        };
        if (old) Object.assign(old, m);
        else s.measurements.push(m);
      });
      setEditing(undefined);
      setWeight("");
      setWaist("");
      setNotes("");
      setSaved(true);
    });
  const start = weekStart(today);
  const weekTasks = state.occurrences.filter(
    (o) => o.localDate >= start && o.localDate <= today,
  );
  const week = progress(weekTasks);
  const workouts = state.workouts.filter(
    (w) => w.localDate >= start && w.localDate <= today,
  );
  const sessions = state.guitar.filter(
    (g) => g.localDate >= start && g.localDate <= today,
  );
  const meals = state.meals.filter(
    (m) =>
      m.localDate >= start && m.localDate <= today && m.status === "completed",
  );
  const activeDates = [
    ...new Set(
      state.occurrences
        .filter((o) => o.localDate <= today && o.status !== "postponed")
        .map((o) => o.localDate),
    ),
  ];
  const meaningful = activeDates.filter((d) =>
    dayTasks(state, d).some((o) => o.status === "completed"),
  ).length;
  return (
    <Screen>
      <AppText variant="micro" tone="green">
        SEU PROGRESSO É MAIOR QUE UM NÚMERO
      </AppText>
      <AppText variant="title">Constância em construção.</AppText>
      <AppCard>
        <AppText variant="heading">Esta semana</AppText>
        <AppText variant="big" tone="green">
          {week.done}
          <AppText variant="heading" tone="muted">
            {" "}
            / {week.total}
          </AppText>
        </AppText>
        <AppText tone="muted">missões concluídas desde {start}</AppText>
        <View style={styles.row}>
          <AppText>{workouts.length} atividades</AppText>
          <AppText>· {meals.length} refeições</AppText>
          <AppText>· {sessions.length} práticas</AppText>
        </View>
        <AppText tone="muted">
          {workouts
            .filter((w) => w.workoutType === "walk")
            .reduce((a, b) => a + b.minutes, 0)}{" "}
          min caminhados ·{" "}
          {Math.round(sessions.reduce((a, b) => a + b.durationMinutes, 0))} min
          de guitarra
        </AppText>
      </AppCard>
      <SectionHeader title="Adesão por categoria" />
      {categories.map((cat) => {
        const p = progress(weekTasks.filter((t) => t.category === cat));
        return p.total ? (
          <View key={cat} style={{ gap: 8 }}>
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <AppText>{categoryNames[cat]}</AppText>
              <AppText tone="green">
                {p.done}/{p.total}
              </AppText>
            </View>
            <View
              style={{ height: 6, backgroundColor: "#285044", borderRadius: 3 }}
            >
              <View
                style={{
                  width: `${(p.done / p.total) * 100}%`,
                  height: 6,
                  backgroundColor: "#00FF6A",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        ) : null;
      })}
      <AppText tone="muted">
        Você realizou ao menos uma missão em {meaningful} de{" "}
        {activeDates.length} dias planejados (
        {activeDates.length
          ? Math.round((meaningful / activeDates.length) * 100)
          : 0}
        %). Descanso não é falha.
      </AppText>
      <Toggle
        label="Ocultar métricas corporais"
        value={hidden}
        onChange={(v) =>
          run(() =>
            mutate((s) => {
              s.settings[0]!.hideBody = v;
            }),
          )
        }
      />
      {!hidden && (
        <>
          <SectionHeader title="Sua linha do tempo" />
          <AppCard>
            <WeightChart points={weeklyWeights(state)} />
            {target !== undefined && weights.length > 0 && (
              <AppText tone="green">
                Referência: {target} kg ·{" "}
                {Math.round(
                  goalPercent(
                    weights[0]!.weightKg!,
                    weights.at(-1)!.weightKg!,
                    target,
                  ),
                )}
                % da distância inicial
              </AppText>
            )}
            <AppText tone="muted">
              Oscilações fazem parte. Bioimpedância é estimativa, não
              diagnóstico. Peso sozinho não informa gordura corporal.
            </AppText>
          </AppCard>
          <SectionHeader
            title={editing ? "Editar medição" : "Registrar medição"}
          />
          <Field
            label="Data da medição (AAAA-MM-DD)"
            value={date}
            onChangeText={setDate}
          />
          <Field
            label="Peso em kg (opcional)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
          <Field
            label="Cintura em cm (opcional)"
            value={waist}
            onChangeText={setWaist}
            keyboardType="decimal-pad"
          />
          <Field
            label="Comentário (opcional)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <Button title="Salvar medição" onPress={save} disabled={busy} />
          {saved && (
            <AppText tone="green" accessibilityLiveRegion="polite">
              Medição salva.
            </AppText>
          )}
          {editing && (
            <Button
              title="Cancelar edição"
              secondary
              onPress={() => {
                setEditing(undefined);
                setWeight("");
                setWaist("");
                setNotes("");
              }}
            />
          )}
          {measures
            .slice()
            .reverse()
            .map((m) => (
              <AppCard key={m.id}>
                <AppText>
                  {m.date} ·{" "}
                  {m.weightKg !== undefined ? `${m.weightKg} kg` : ""}
                  {m.waistCm !== undefined ? ` · cintura ${m.waistCm} cm` : ""}
                </AppText>
                {!!m.notes && <AppText tone="muted">{m.notes}</AppText>}
                <Button
                  title="Editar medição"
                  secondary
                  onPress={() => {
                    setEditing(m.id);
                    setDate(m.date);
                    setWeight(m.weightKg?.toString() ?? "");
                    setWaist(m.waistCm?.toString() ?? "");
                    setNotes(m.notes ?? "");
                  }}
                />
              </AppCard>
            ))}
        </>
      )}
    </Screen>
  );
}
