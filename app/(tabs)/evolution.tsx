import React, { useState } from "react";
import { View } from "react-native";
import {
  AppCard,
  AppText,
  Button,
  Field,
  Icon,
  IconButton,
  Pill,
  ProgressBar,
  ProgressRing,
  Screen,
  ScreenHeader,
  SectionHeader,
  StatTile,
  Toggle,
  styles,
} from "../../src/components/ui";
import {
  categoryColors,
  categoryIcons,
  colors as c,
} from "../../src/theme/tokens";
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
  const { state, today, mutate, run, busy, notify } = useApp();
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<string | undefined>();
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
      notify(editing ? "Medição atualizada" : "Medição salva");
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
      <ScreenHeader
        eyebrow="SEU PROGRESSO É MAIOR QUE UM NÚMERO"
        title="Constância em construção."
      />
      <AppCard variant="hero" corners>
        <AppText variant="micro" tone="green">
          {"> ESTA_SEMANA · DESDE "}
          {start.split("-").reverse().slice(0, 2).join("/")}
        </AppText>
        <View style={[styles.row, { gap: 18 }]}>
          <ProgressRing
            done={week.done}
            total={week.total}
            size={112}
            stroke={8}
          />
          <View style={{ flex: 1, minWidth: 140, gap: 4 }}>
            <AppText variant="heading">
              {week.total
                ? `${Math.round((week.done / week.total) * 100)}% de adesão`
                : "Semana aberta"}
            </AppText>
            <AppText variant="small" tone="muted">
              {workouts
                .filter((w) => w.workoutType === "walk")
                .reduce((a, b) => a + b.minutes, 0)}{" "}
              min caminhados ·{" "}
              {Math.round(sessions.reduce((a, b) => a + b.durationMinutes, 0))}{" "}
              min de guitarra
            </AppText>
          </View>
        </View>
      </AppCard>
      <View style={[styles.row, { flexWrap: "nowrap" }]}>
        <StatTile
          icon="fitness"
          value={workouts.length}
          label="ATIVIDADES"
          color={categoryColors.movement}
        />
        <StatTile
          icon="restaurant"
          value={meals.length}
          label="REFEIÇÕES"
          color={categoryColors.meal}
        />
        <StatTile
          icon="musical-notes"
          value={sessions.length}
          label="PRÁTICAS"
          color={categoryColors.guitar}
        />
      </View>
      <SectionHeader eyebrow="ADESÃO" title="Por categoria" />
      {categories.map((cat) => {
        const p = progress(weekTasks.filter((t) => t.category === cat));
        return p.total ? (
          <View key={cat} style={{ gap: 8 }}>
            <View
              style={[
                styles.row,
                { justifyContent: "space-between", flexWrap: "nowrap" },
              ]}
            >
              <Icon
                name={categoryIcons[cat]}
                color={categoryColors[cat]}
                size={16}
              />
              <AppText variant="label" style={{ flex: 1 }}>
                {categoryNames[cat]}
              </AppText>
              <AppText variant="micro" style={{ color: categoryColors[cat] }}>
                {p.done}/{p.total}
              </AppText>
            </View>
            <ProgressBar
              value={p.done}
              total={p.total}
              color={categoryColors[cat]}
              segments={20}
            />
          </View>
        ) : null;
      })}
      <AppText variant="small" tone="muted">
        Você realizou ao menos uma missão em {meaningful} de{" "}
        {activeDates.length} dias planejados (
        {activeDates.length
          ? Math.round((meaningful / activeDates.length) * 100)
          : 0}
        %). Descanso não é falha.
      </AppText>
      <Toggle
        icon="eye-off"
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
          <SectionHeader eyebrow="CORPO" title="Sua linha do tempo" />
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
            <AppText variant="small" tone="subtle">
              Oscilações fazem parte. Bioimpedância é estimativa, não
              diagnóstico. Peso sozinho não informa gordura corporal.
            </AppText>
          </AppCard>
          <SectionHeader
            eyebrow="MEDIÇÃO"
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
          <Button
            title="Salvar medição"
            icon="checkmark"
            onPress={save}
            disabled={busy}
          />
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
              <AppCard key={m.id} style={{ paddingVertical: 12 }}>
                <View style={[styles.row, { flexWrap: "nowrap" }]}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText variant="micro" tone="subtle">
                      {m.date.split("-").reverse().join("/")}
                    </AppText>
                    <View style={[styles.row, { gap: 6 }]}>
                      {m.weightKg !== undefined && (
                        <AppText variant="heading">
                          {m.weightKg}
                          <AppText variant="small" tone="subtle">
                            {" "}
                            kg
                          </AppText>
                        </AppText>
                      )}
                      {m.waistCm !== undefined && (
                        <Pill label={`CINTURA ${m.waistCm} CM`} />
                      )}
                    </View>
                    {!!m.notes && (
                      <AppText variant="small" tone="muted">
                        {m.notes}
                      </AppText>
                    )}
                  </View>
                  <IconButton
                    icon="create-outline"
                    label={`Editar medição de ${m.date}`}
                    color={c.muted}
                    onPress={() => {
                      setEditing(m.id);
                      setDate(m.date);
                      setWeight(m.weightKg?.toString() ?? "");
                      setWaist(m.waistCm?.toString() ?? "");
                      setNotes(m.notes ?? "");
                    }}
                  />
                </View>
              </AppCard>
            ))}
        </>
      )}
    </Screen>
  );
}
