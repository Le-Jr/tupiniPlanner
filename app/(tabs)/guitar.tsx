import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  AppCard,
  AppText,
  Button,
  Field,
  IconTile,
  Pill,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  styles,
} from "../../src/components/ui";
import { categoryColors, colors as c } from "../../src/theme/tokens";
import { useApp, uuid } from "../../src/features/AppProvider";
import { dayTasks, setStatus, weekStart } from "../../src/domain/planner";
import { elapsedSeconds } from "../../src/domain/timer";
import { numberInput } from "../../src/utils/input";
import { LogMission } from "../../src/features/LogMission";
const guitarColor = categoryColors.guitar;
const blockNames = [
  "Aquecimento",
  "Técnica",
  "Riffs / repertório",
  "Prática livre",
];
export default function Guitar() {
  const { state, today, mutate, run, busy, celebrate, notify } = useApp();
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
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);
  const seconds = elapsedSeconds(timer, now);
  const target = timer?.targetSeconds ?? settings.guitarMinutes * 60;
  const remaining = Math.max(0, Math.ceil(target - seconds));
  const running = timer?.startedAt !== undefined && remaining > 0;
  const ratio = target ? Math.min(1, seconds / target) : 0;
  const ring = 2 * Math.PI * 100;
  const offsets = settings.guitarBlocks.map((_, i) =>
    settings.guitarBlocks.slice(0, i).reduce((a, b) => a + b * 60, 0),
  );
  const block = offsets.reduce((cur, o, i) => (seconds >= o ? i : cur), 0);
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
      notify("Prática registrada. Mais um riff na sua história.");
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
      <ScreenHeader
        eyebrow="CORDAS EM CHAMAS"
        tone="accent"
        title="Dê play na evolução."
        subtitle="Um riff por vez. Precisão antes de velocidade."
      />
      <AppCard variant="hero" corners style={{ alignItems: "stretch" }}>
        <View style={{ alignItems: "center", paddingVertical: 6 }}>
          <View
            accessible
            accessibilityRole="timer"
            accessibilityLabel={`${Math.floor(remaining / 60)} minutos e ${remaining % 60} segundos restantes`}
            style={{
              width: 230,
              height: 230,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Svg width={230} height={230} style={StyleSheet.absoluteFill}>
              <Circle
                cx={115}
                cy={115}
                r={100}
                stroke={c.line}
                strokeWidth={10}
                strokeDasharray="2 5"
                fill="none"
              />
              {ratio > 0 && (
                <Circle
                  cx={115}
                  cy={115}
                  r={100}
                  stroke={remaining === 0 ? c.primary : guitarColor}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={`${ring} ${ring}`}
                  strokeDashoffset={ring * (1 - ratio)}
                  rotation={-90}
                  origin="115,115"
                  fill="none"
                />
              )}
            </Svg>
            <AppText variant="micro" tone="subtle">
              {remaining === 0
                ? "FINALIZADA"
                : running
                  ? "TOCANDO"
                  : timer
                    ? "PAUSADO"
                    : "PRONTO"}
            </AppText>
            <AppText
              variant="display"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {String(Math.floor(remaining / 60)).padStart(2, "0")}:
              {String(remaining % 60).padStart(2, "0")}
            </AppText>
            <AppText variant="micro" style={{ color: guitarColor }}>
              {timer
                ? blockNames[block]!.toUpperCase()
                : `${settings.guitarMinutes} MIN`}
            </AppText>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {settings.guitarBlocks.map((min, i) => (
            <View key={i} style={{ flex: min, gap: 6 }}>
              <View
                style={{
                  height: 6,
                  borderRadius: 2,
                  backgroundColor: c.line,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.max(0, Math.min(1, (seconds - offsets[i]!) / (min * 60))) * 100}%`,
                    backgroundColor: guitarColor,
                  }}
                />
              </View>
              <AppText
                variant="micro"
                numberOfLines={1}
                style={{
                  fontSize: 9,
                  color: timer && i === block ? guitarColor : c.subtle,
                }}
              >
                {min}′ {blockNames[i]!.split(" ")[0]}
              </AppText>
            </View>
          ))}
        </View>
        <View style={[styles.row, { flexWrap: "nowrap" }]}>
          <Button
            title={
              remaining === 0
                ? "SALVE ABAIXO"
                : running
                  ? "PAUSAR"
                  : timer
                    ? "CONTINUAR"
                    : "INICIAR SESSÃO"
            }
            icon={running ? "pause" : "play"}
            size="lg"
            onPress={startPause}
            disabled={busy || remaining === 0}
            style={{ flex: 1 }}
          />
        </View>
        <AppText variant="small" tone="subtle" style={{ textAlign: "center" }}>
          O timer continua com a tela bloqueada. Pause ao interromper.
        </AppText>
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
        <View style={[styles.row, { flexWrap: "nowrap" }]}>
          <IconTile icon="flame" color={c.accent} />
          <View style={{ flex: 1 }}>
            <AppText variant="heading">
              {weekly.length}
              <AppText variant="label" tone="subtle">
                {" "}
                / {settings.guitarWeeklyGoal} sessões na semana
              </AppText>
            </AppText>
            <AppText variant="small" tone="subtle">
              {Math.round(weekly.reduce((a, b) => a + b.durationMinutes, 0))}{" "}
              min de música · meta é referência, não obrigação
            </AppText>
          </View>
        </View>
        <ProgressBar
          value={weekly.length}
          total={settings.guitarWeeklyGoal}
          segments={settings.guitarWeeklyGoal}
          height={8}
          color={c.accent}
        />
      </AppCard>
      <SectionHeader eyebrow="REGISTRO" title="Guarde o que você tocou" />
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
      <Button
        title="FINALIZAR E SALVAR"
        icon="save"
        onPress={finish}
        disabled={busy}
      />
      <SectionHeader eyebrow="HISTÓRICO" title="Últimas sessões" />
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
          <AppCard
            key={g.id}
            accent={guitarColor}
            style={{ paddingLeft: 16, gap: 6 }}
          >
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <AppText variant="label" style={{ flex: 1 }}>
                {g.repertoire || g.technique || "Prática livre"}
              </AppText>
              <AppText variant="micro" tone="subtle">
                {g.localDate.split("-").reverse().join("/")}
              </AppText>
            </View>
            <View style={[styles.row, { gap: 6 }]}>
              <Pill
                icon="time-outline"
                label={`${Math.round(g.durationMinutes)} MIN`}
                color={guitarColor}
              />
              {!!g.bpm && <Pill icon="pulse" label={`${g.bpm} BPM`} />}
            </View>
            {!!g.technique && g.repertoire && (
              <AppText variant="small">{g.technique}</AppText>
            )}
            {!!g.notes && (
              <AppText variant="small" tone="muted">
                {g.notes}
              </AppText>
            )}
          </AppCard>
        ))}
    </Screen>
  );
}
