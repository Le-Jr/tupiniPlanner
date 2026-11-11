import React, { useState } from "react";
import { View } from "react-native";
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
const exercises = [
  {
    name: "Flexão na parede",
    how: "Apoie as mãos numa parede estável e flexione os cotovelos lentamente.",
    easier: "Fique mais perto da parede e reduza a amplitude.",
    next: "Se confortável, ajuste a distância. Apoio inclinado só quando firme.",
  },
  {
    name: "Agachamento na cadeira",
    how: "Use uma cadeira firme encostada na parede. Sente e levante com controle.",
    easier: "Use apoio estável para as mãos e uma cadeira mais alta.",
    next: "Reduza gradualmente a ajuda das mãos, sem pressa.",
  },
  {
    name: "Remada com faixa",
    how: "Puxe a faixa em direção ao tronco, com ombros relaxados. Confira a ancoragem antes.",
    easier: "Use menor resistência. Sem ancoragem segura, pule este exercício.",
    next: "Ajuste a resistência somente quando o movimento estiver confortável.",
  },
  {
    name: "Bird-dog",
    how: "Em quatro apoios, estenda devagar braço e perna opostos, sem girar o tronco.",
    easier: "Mova apenas um braço ou uma perna por vez.",
    next: "Sustente por mais alguns instantes, sem perder o controle.",
  },
];
export default function Movement() {
  const { state, today, run, mutate, busy, celebrate } = useApp();
  const [type, setType] = useState<"walk" | "calisthenics">("walk");
  const [minutes, setMinutes] = useState("");
  const [effort, setEffort] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState("");
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState(
    exercises.map((e) => ({
      name: e.name,
      enabled: false,
      sets: "1",
      reps: "",
    })),
  );
  const save = () =>
    run(async () => {
      if (!validDate(date) || date > today)
        throw new Error("Escolha uma data válida até hoje.");
      const duration = numberInput(minutes, 1, 1440, "Duração")!;
      const perceived = numberInput(effort, 0, 10, "Esforço", true);
      const actual =
        type === "calisthenics"
          ? entries
              .filter((e) => e.enabled)
              .map((e) => ({
                name: e.name,
                sets: numberInput(e.sets, 1, 100, "Séries")!,
                reps: numberInput(e.reps, 1, 1000, "Repetições")!,
              }))
          : [];
      let awards: string[] = [];
      await mutate((s) => {
        s.workouts.push({
          id: uuid(),
          localDate: date,
          workoutType: type,
          minutes: duration,
          effort: perceived,
          exercises: actual,
          notes,
        });
        if (selected && date === today)
          awards = setStatus(
            s,
            selected,
            "completed",
            new Date().toISOString(),
            uuid,
          );
      });
      setMinutes("");
      setNotes("");
      setSelected("");
      setSaved(true);
      if (awards[0]) celebrate(awards[0]);
    });
  return (
    <Screen>
      <AppText variant="micro" tone="green">
        MOVIMENTO // NO SEU RITMO
      </AppText>
      <AppText variant="title">Um passo possível.</AppText>
      <AppText tone="muted">
        Sugestão para começar: duas sessões leves de calistenia e três
        caminhadas de 15–20 min por semana. Adapte ou pause em Missões. Nenhuma
        progressão é automática.
      </AppText>
      <AppCard>
        <AppText variant="heading">Antes de começar</AppText>
        <AppText>
          Use apoio firme e uma intensidade confortável. Interrompa diante de
          dor no peito, desmaio, tontura intensa ou falta de ar incomum e busque
          avaliação adequada. Adapte o plano às suas limitações.
        </AppText>
      </AppCard>
      <SectionHeader title="Seu repertório de movimento" />
      {exercises.map((e) => (
        <AppCard key={e.name}>
          <AppText variant="heading">{e.name}</AppText>
          <AppText>{e.how}</AppText>
          <AppText tone="muted">Mais fácil: {e.easier}</AppText>
          <AppText tone="muted">Quando confortável: {e.next}</AppText>
          <AppText variant="micro" tone="green">
            SUGESTÃO: 1–2 SÉRIES ADAPTÁVEIS
          </AppText>
        </AppCard>
      ))}
      <SectionHeader title="Registrar atividade" />
      <AppCard>
        <View style={styles.row}>
          <Chip
            label="Caminhada"
            selected={type === "walk"}
            onPress={() => {
              setType("walk");
              setSelected("");
            }}
          />
          <Chip
            label="Calistenia"
            selected={type === "calisthenics"}
            onPress={() => {
              setType("calisthenics");
              setSelected("");
            }}
          />
        </View>
        <Field label="Data (AAAA-MM-DD)" value={date} onChangeText={setDate} />
        <Field
          label="Duração em minutos"
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="decimal-pad"
        />
        <Field
          label="Esforço percebido 0–10 (opcional)"
          value={effort}
          onChangeText={setEffort}
          keyboardType="decimal-pad"
        />
        {type === "calisthenics" &&
          entries.map((e, index) => (
            <View key={e.name} style={{ gap: 8 }}>
              <Chip
                label={e.name}
                selected={e.enabled}
                onPress={() =>
                  setEntries(
                    entries.map((v, i) =>
                      i === index ? { ...v, enabled: !v.enabled } : v,
                    ),
                  )
                }
              />
              {e.enabled && (
                <>
                  <Field
                    label={`Séries · ${e.name}`}
                    value={e.sets}
                    onChangeText={(sets) =>
                      setEntries(
                        entries.map((v, i) =>
                          i === index ? { ...v, sets } : v,
                        ),
                      )
                    }
                    keyboardType="number-pad"
                  />
                  <Field
                    label={`Repetições · ${e.name}`}
                    value={e.reps}
                    onChangeText={(reps) =>
                      setEntries(
                        entries.map((v, i) =>
                          i === index ? { ...v, reps } : v,
                        ),
                      )
                    }
                    keyboardType="number-pad"
                  />
                </>
              )}
            </View>
          ))}
        <Field
          label="Notas (opcional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        {date === today && (
          <LogMission
            tasks={dayTasks(state, today, "movement").filter(
              (t) => t.workoutRef === type,
            )}
            selected={selected}
            onSelect={setSelected}
          />
        )}
        <Button title="Salvar atividade" onPress={save} disabled={busy} />
        {saved && (
          <AppText tone="green" accessibilityLiveRegion="polite">
            Atividade registrada.
          </AppText>
        )}
      </AppCard>
      <SectionHeader title="Seu histórico" />
      {!state.workouts.length && (
        <AppText tone="muted">Suas atividades aparecerão aqui.</AppText>
      )}
      {state.workouts
        .slice()
        .sort((a, b) => b.localDate.localeCompare(a.localDate))
        .slice(0, 30)
        .map((w) => (
          <AppCard key={w.id}>
            <AppText>
              {w.workoutType === "walk" ? "Caminhada" : "Calistenia"} ·{" "}
              {w.minutes} min
            </AppText>
            <AppText variant="micro" tone="muted">
              {w.localDate}
              {w.effort !== undefined ? ` · esforço ${w.effort}/10` : ""}
            </AppText>
            {w.exercises.map((e) => (
              <AppText key={e.name} tone="muted">
                {e.name}: {e.sets} × {e.reps}
              </AppText>
            ))}
            {!!w.notes && <AppText>{w.notes}</AppText>}
          </AppCard>
        ))}
    </Screen>
  );
}
