import React, { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { type TaskOccurrence, categoryNames } from "../domain/model";
import { postpone, setStatus, shiftDate, totalXP } from "../domain/planner";
import { useApp, uuid } from "../features/AppProvider";
import {
  AppCard,
  AppText,
  Button,
  Chip,
  Field,
  Icon,
  IconButton,
  IconTile,
  Pill,
  styles,
} from "./ui";
import { Character } from "./Character";
import { Sheet } from "./Sheet";
import { categoryColors, categoryIcons, colors as c } from "../theme/tokens";

const reasons = [
  "sem tempo",
  "cansaço",
  "imprevisto",
  "não estava bem",
  "outro",
];
const statusMeta = {
  pending: { text: "Pendente", color: c.muted, icon: "ellipse-outline" },
  completed: { text: "Concluída", color: c.primary, icon: "checkmark-circle" },
  skipped: { text: "Não rolou", color: c.accent, icon: "cloud-outline" },
  postponed: { text: "Adiada", color: "#9FB4FF", icon: "arrow-redo" },
} as const;

export function MissionRow({ task }: { task: TaskOccurrence }) {
  const { mutate, busy, run, celebrate, state, animate, haptic, notify } =
    useApp();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [reason, setReason] = useState(task.reason ?? "sem tempo");
  const [target, setTarget] = useState(shiftDate(task.localDate, 1));
  const [skipped, setSkipped] = useState(false);
  const [localError, setLocalError] = useState("");
  const pop = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));
  const color = categoryColors[task.category];
  const done = task.status === "completed";
  const meta = statusMeta[task.status];

  const update = async (
    status: "pending" | "completed" | "skipped",
    withDetails = false,
  ) => {
    let awards: string[] = [];
    let gained = 0;
    await mutate((s) => {
      const before = totalXP(s);
      awards = setStatus(
        s,
        task.id,
        status,
        new Date().toISOString(),
        uuid,
        withDetails ? notes : undefined,
        withDetails ? reason : undefined,
      );
      gained = totalXP(s) - before;
    });
    if (status === "completed") {
      haptic("success");
      if (gained > 0) notify(`+${gained} XP · ${task.titleSnapshot}`, "reward");
    }
    if (awards[0]) celebrate(awards[0]);
  };
  const toggle = () => {
    if (animate && !done)
      pop.value = withSequence(
        withTiming(0.8, { duration: 90 }),
        withSpring(1, { damping: 7, stiffness: 300 }),
      );
    run(() => update(done ? "pending" : "completed"));
  };
  const act = (fn: () => Promise<void>) => {
    setLocalError("");
    void fn().catch((e) =>
      setLocalError(
        e instanceof Error ? e.message : "Não foi possível salvar.",
      ),
    );
  };
  const reschedule = (date: string) =>
    act(async () => {
      await mutate((s) => postpone(s, task.id, date, uuid, notes));
      setOpen(false);
      notify(
        `Missão movida para ${date.split("-").reverse().slice(0, 2).join("/")}`,
        "info",
      );
    });

  return (
    <>
      <AppCard
        accent={color}
        style={{
          paddingVertical: 10,
          paddingLeft: 14,
          paddingRight: 8,
          opacity: task.status === "postponed" ? 0.6 : 1,
          borderColor: done ? `${c.primary}55` : c.line,
          backgroundColor: done ? "#0B2A1F" : c.surface,
        }}
      >
        <View style={[styles.row, { flexWrap: "nowrap", gap: 8 }]}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={`Concluir ${task.titleSnapshot}`}
            accessibilityState={{
              checked: done,
              disabled: busy || task.status === "postponed",
            }}
            disabled={busy || task.status === "postponed"}
            hitSlop={6}
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={toggle}
          >
            <Animated.View
              style={[
                {
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  borderWidth: 2,
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: done
                    ? c.primary
                    : task.status === "pending"
                      ? c.lineStrong
                      : meta.color,
                  backgroundColor: done ? c.primary : "transparent",
                },
                popStyle,
              ]}
            >
              {done && <Icon name="checkmark" color={c.onPrimary} size={20} />}
              {task.status === "postponed" && (
                <Icon name="arrow-redo" color={meta.color} size={15} />
              )}
              {task.status === "skipped" && (
                <Icon name="remove" color={meta.color} size={16} />
              )}
            </Animated.View>
          </Pressable>
          <Pressable
            style={{ flex: 1, gap: 5, paddingVertical: 4 }}
            accessibilityRole="button"
            accessibilityHint="Abre detalhes, anotação e reprogramação"
            onPress={() => {
              setNotes(task.notes ?? "");
              setSkipped(false);
              setOpen(true);
            }}
          >
            <AppText
              variant="label"
              tone={done ? "muted" : "normal"}
              style={{
                textDecorationLine: done ? "line-through" : "none",
                fontSize: 15,
              }}
            >
              {task.titleSnapshot}
            </AppText>
            <View style={[styles.row, { gap: 6 }]}>
              <Pill icon="time-outline" label={task.localTime ?? "LIVRE"} />
              <Pill
                icon="flash"
                label={`${task.xpValue} XP`}
                color={done ? c.primary : c.accent}
              />
              {task.status !== "pending" && !done && (
                <Pill label={meta.text.toUpperCase()} color={meta.color} />
              )}
            </View>
          </Pressable>
          <IconButton
            icon="ellipsis-horizontal"
            color={c.muted}
            label={`Detalhes de ${task.titleSnapshot}`}
            onPress={() => {
              setNotes(task.notes ?? "");
              setSkipped(false);
              setOpen(true);
            }}
          />
        </View>
      </AppCard>
      <Sheet
        visible={open}
        eyebrow={`${categoryNames[task.category].toUpperCase()} · ${meta.text.toUpperCase()}`}
        title={task.titleSnapshot}
        onClose={() => setOpen(false)}
      >
        <View style={[styles.row, { flexWrap: "nowrap" }]}>
          <IconTile icon={categoryIcons[task.category]} color={color} />
          <View style={{ flex: 1 }}>
            <AppText variant="label">
              {task.localTime ? `Às ${task.localTime}` : "Sem horário fixo"}
            </AppText>
            <AppText variant="small" tone="subtle">
              {task.localDate.split("-").reverse().join("/")} · vale{" "}
              {task.xpValue} XP
            </AppText>
          </View>
        </View>
        {task.status !== "postponed" && (
          <Button
            title={done ? "Desmarcar conclusão" : "Concluir missão"}
            icon={done ? "arrow-undo" : "checkmark-circle"}
            secondary={done}
            disabled={busy}
            onPress={() => {
              toggle();
              setOpen(false);
            }}
          />
        )}
        {task.category === "meal" && (
          <AppText tone="muted" variant="small">
            É um lembrete para observar sua rotina. Não precisa comer sem fome.
          </AppText>
        )}
        <Field
          label="Anotação"
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={2000}
          placeholder="Como foi? O que ajudou ou atrapalhou?"
        />
        <Button
          title="Salvar anotação"
          secondary
          icon="create-outline"
          disabled={busy || notes === (task.notes ?? "")}
          onPress={() =>
            act(async () => {
              await mutate((s) => {
                s.occurrences.find((o) => o.id === task.id)!.notes = notes;
              });
              setOpen(false);
              notify("Anotação guardada");
            })
          }
        />
        {task.status !== "postponed" && (
          <>
            <View
              style={{ height: 1, backgroundColor: c.line, marginVertical: 4 }}
            />
            <AppText variant="micro" tone="accent">
              {"// NÃO ROLOU HOJE?"}
            </AppText>
            <AppText variant="small" tone="muted">
              Sem cobrança: nenhum XP é retirado. Conte o motivo se quiser.
            </AppText>
            <View style={styles.row}>
              {reasons.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  color={c.accent}
                  selected={reason === r}
                  onPress={() => setReason(r)}
                />
              ))}
            </View>
            <Button
              title="Registrar sem cobrança"
              secondary
              icon="cloud-outline"
              disabled={busy}
              onPress={() =>
                act(async () => {
                  await update("skipped", true);
                  setSkipped(true);
                })
              }
            />
            {skipped && state.settings[0]?.skipReactions && (
              <Character index={2} serious />
            )}
            {skipped && (
              <AppCard
                style={{
                  borderColor: `${c.accent}55`,
                  backgroundColor: "#2A220F",
                }}
              >
                <AppText tone="accent">
                  {state.settings[0]?.skipReactions
                    ? "Perdeu um round, não a campanha. "
                    : ""}
                  O plano não acabou. Ajuste a rota e volte quando puder.
                </AppText>
              </AppCard>
            )}
            <AppText variant="micro" tone="green">
              {"// AJUSTAR PLANO"}
            </AppText>
            <View style={styles.row}>
              {[
                { label: "Amanhã", days: 1 },
                { label: "+2 dias", days: 2 },
                { label: "Próx. semana", days: 7 },
              ].map((o) => (
                <Chip
                  key={o.days}
                  icon="calendar-outline"
                  label={o.label}
                  selected={false}
                  onPress={() => reschedule(shiftDate(task.localDate, o.days))}
                />
              ))}
            </View>
            <Field
              label="Ou escolha a data (AAAA-MM-DD)"
              value={target}
              onChangeText={setTarget}
            />
            <Button
              title="Reprogramar"
              secondary
              icon="calendar"
              disabled={busy}
              onPress={() => reschedule(target)}
            />
          </>
        )}
        {localError && (
          <AppText accessibilityLiveRegion="assertive" tone="accent">
            {localError}
          </AppText>
        )}
        <Button
          title="Encerrar por hoje"
          ghost
          onPress={() => setOpen(false)}
        />
      </Sheet>
    </>
  );
}
