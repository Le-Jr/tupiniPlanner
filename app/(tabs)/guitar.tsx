import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  AppCard,
  AppText,
  Button,
  Field,
  Icon,
  Screen,
  SectionHeader,
  styles,
} from "../../src/components/ui";
import { useApp, uuid } from "../../src/features/AppProvider";
import { dayTasks, setStatus, weekStart } from "../../src/domain/planner";
import { elapsedSeconds } from "../../src/domain/timer";
import { numberInput } from "../../src/utils/input";
import { LogMission } from "../../src/features/LogMission";
const blockNames = [
  "Aquecimento",
  "Técnica",
  "Riffs / repertório",
  "Prática livre",
];
export default function Guitar() {
  const { state, today, mutate, run, busy, celebrate } = useApp();
  const settings = state.settings[0]!;
  const timer = settings.guitarTimer;
  const [now, setNow] = useState(Date.now());
  const [technique, setTechnique] = useState("");
  const [repertoire, setRepertoire] = useState("");
  const [bpm, setBpm] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState("");
  const [manual, setManual] = useState("");
  const [editing, setEditing] = useState(false);
  const [blocks, setBlocks] = useState(settings.guitarBlocks.map(String));
  const [goal, setGoal] = useState(String(settings.guitarWeeklyGoal));
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);
  const seconds = elapsedSeconds(timer, now);
  const target = timer?.targetSeconds ?? settings.guitarMinutes * 60;
  const remaining = Math.max(0, Math.ceil(target - seconds));
  const running = timer?.startedAt !== undefined && remaining > 0;
  const startPause = () =>
    run(() =>
      mutate((s) => {
        const config = s.settings[0]!;
        const old = config.guitarTimer;
        const elapsed = elapsedSeconds(old);
        config.guitarTimer = {
          elapsedSeconds: elapsed,
          startedAt: old?.startedAt !== undefined ? undefined : Date.now(),
          localDate: old?.localDate ?? today,
          targetSeconds: old?.targetSeconds ?? config.guitarMinutes * 60,
        };
      }),
    );
  const finish = () =>
    run(async () => {
      const duration = manual.trim()
        ? numberInput(manual, 0.01, 1440, "Minutos praticados")!
        : Math.round((elapsedSeconds(timer) / 60) * 100) / 100;
      if (duration < 0.01)
        throw new Error("Inicie o timer ou informe os minutos praticados.");
      const beats = numberInput(bpm, 20, 400, "BPM", true);
      let awards: string[] = [];
      await mutate((s) => {
        s.guitar.push({
          id: uuid(),
          localDate: timer?.localDate ?? today,
          durationMinutes: duration,
          technique,
          repertoire,
          bpm: beats,
          notes,
        });
        s.settings[0]!.guitarTimer = undefined;
        if (selected)
          awards = setStatus(
            s,
            selected,
            "completed",
            new Date().toISOString(),
            uuid,
          );
      });
      setSelected("");
      setManual("");
      setNotes("");
      setSaved(true);
      if (awards[0]) celebrate(awards[0]);
    });
  const savePlan = () =>
    run(async () => {
      const parsed = blocks.map((b, i) =>
        numberInput(b, 1, 45, blockNames[i]!)!,
      );
      const weekly = numberInput(goal, 1, 7, "Sessões semanais")!;
      if (!Number.isInteger(weekly))
        throw new Error("A meta semanal deve ser um número inteiro.");
      await mutate((s) => {
        s.settings[0]!.guitarBlocks = parsed;
        s.settings[0]!.guitarMinutes = parsed.reduce((a, b) => a + b, 0);
        s.settings[0]!.guitarWeeklyGoal = weekly;
      });
      setEditing(false);
    });
  const weekly = state.guitar.filter(
    (g) => g.localDate >= weekStart(today) && g.localDate <= today,
  );
  return (
    <Screen>
      <AppText variant="micro" tone="accent">
        CORDAS EM CHAMAS
      </AppText>
      <AppText variant="title">Dê play na evolução.</AppText>
      <AppText tone="muted">
        Um riff por vez. Precisão antes de velocidade.
      </AppText>
      <AppCard>
        <View style={styles.row}>
          <Icon name="musical-notes-outline" />
          <AppText variant="heading">Sua sessão de prática</AppText>
        </View>
        <AppText
          variant="big"
          style={{
            textAlign: "center",
            marginVertical: 12,
            fontVariant: ["tabular-nums"],
          }}
        >
          {String(Math.floor(remaining / 60)).padStart(2, "0")}:
          {String(remaining % 60).padStart(2, "0")}
        </AppText>
        <AppText variant="micro" tone="green" style={{ textAlign: "center" }}>
          {remaining === 0
            ? "SESSÃO CONCLUÍDA · SALVE SEU REGISTRO"
            : running
              ? "NO SEU RITMO. SEM PRESSA."
              : timer
                ? "PAUSADO · SUA PRÁTICA ESTÁ GUARDADA"
                : `${settings.guitarMinutes} MINUTOS PARA A SUA MÚSICA`}
        </AppText>
        <Button
          title={running ? "PAUSAR" : timer ? "CONTINUAR" : "INICIAR SESSÃO"}
          icon={running ? "pause-outline" : "play-outline"}
          onPress={startPause}
          disabled={busy || remaining === 0}
        />
        <AppText tone="muted">
          O timer continua durante o bloqueio da tela. Pause ao interromper a
          prática.
        </AppText>
        {settings.guitarBlocks.map((min, i) => (
          <View
            key={i}
            style={[styles.row, { justifyContent: "space-between" }]}
          >
            <AppText tone="muted">
              0{i + 1} {blockNames[i]}
            </AppText>
            <AppText>{min} min</AppText>
          </View>
        ))}
        <Button
          title="Editar sessão e meta semanal"
          secondary
          onPress={() => setEditing(!editing)}
        />
        {editing && (
          <>
            {blocks.map((b, i) => (
              <Field
                key={i}
                label={`${blockNames[i]} (min)`}
                value={b}
                onChangeText={(v) =>
                  setBlocks(blocks.map((old, j) => (i === j ? v : old)))
                }
                keyboardType="number-pad"
              />
            ))}
            <Field
              label="Sessões por semana (1–7)"
              value={goal}
              onChangeText={setGoal}
              keyboardType="number-pad"
            />
            <Button
              title="Salvar plano de prática"
              onPress={savePlan}
              disabled={busy}
            />
          </>
        )}
      </AppCard>
      <AppCard>
        <AppText variant="heading">
          {weekly.length} / {settings.guitarWeeklyGoal} sessões nesta semana
        </AppText>
        <AppText tone="muted">
          {Math.round(weekly.reduce((a, b) => a + b.durationMinutes, 0))}{" "}
          minutos de música. A meta é uma referência, não uma obrigação.
        </AppText>
      </AppCard>
      <SectionHeader title="Guarde o que você tocou" />
      <Field
        label="Técnica (opcional)"
        value={technique}
        onChangeText={setTechnique}
        placeholder="Ex.: palhetada alternada"
      />
      <Field
        label="Repertório (opcional)"
        value={repertoire}
        onChangeText={setRepertoire}
      />
      <Field
        label="BPM (opcional)"
        value={bpm}
        onChangeText={setBpm}
        keyboardType="number-pad"
      />
      <Field
        label="Notas (opcional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Field
        label="Minutos praticados (opcional; substitui timer)"
        value={manual}
        onChangeText={setManual}
        keyboardType="decimal-pad"
      />
      <LogMission
        tasks={dayTasks(state, today, "guitar")}
        selected={selected}
        onSelect={setSelected}
      />
      <Button title="FINALIZAR E SALVAR" onPress={finish} disabled={busy} />
      {saved && (
        <AppText tone="green" accessibilityLiveRegion="polite">
          Prática registrada. Mais um riff na sua história.
        </AppText>
      )}
      <SectionHeader title="Últimas sessões" />
      {!state.guitar.length && (
        <AppText tone="muted">
          Seu histórico começa com a primeira prática.
        </AppText>
      )}
      {state.guitar
        .slice()
        .reverse()
        .slice(0, 30)
        .map((g) => (
          <AppCard key={g.id}>
            <AppText>{g.repertoire || g.technique || "Prática livre"}</AppText>
            <AppText variant="micro" tone="muted">
              {g.localDate} · {g.durationMinutes} min
              {g.bpm ? ` · ${g.bpm} BPM` : ""}
            </AppText>
            {!!g.technique && <AppText>{g.technique}</AppText>}
            {!!g.notes && <AppText tone="muted">{g.notes}</AppText>}
          </AppCard>
        ))}
    </Screen>
  );
}
