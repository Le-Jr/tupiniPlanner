import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { type TaskOccurrence, categoryNames } from "../domain/model";
import { postpone, setStatus, shiftDate } from "../domain/planner";
import { useApp, uuid } from "../features/AppProvider";
import {
  AppCard,
  AppText,
  Button,
  Chip,
  Field,
  Icon,
  IconButton,
  styles,
} from "./ui";
import { Character } from "./ReactionModal";
import { Sheet } from "./Sheet";
import { colors as c } from "../theme/tokens";
export function MissionRow({ task }: { task: TaskOccurrence }) {
  const { mutate, busy, run, celebrate, state } = useApp();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [reason, setReason] = useState(task.reason ?? "sem tempo");
  const [target, setTarget] = useState(shiftDate(task.localDate, 1));
  const [skipped, setSkipped] = useState(false);
  const [localError, setLocalError] = useState("");
  const update = async (
    status: "pending" | "completed" | "skipped",
    withDetails = false,
  ) => {
    let awards: string[] = [];
    await mutate((s) => {
      awards = setStatus(
        s,
        task.id,
        status,
        new Date().toISOString(),
        uuid,
        withDetails ? notes : undefined,
        withDetails ? reason : undefined,
      );
    });
    if (awards[0]) celebrate(awards[0]);
  };
  const act = (fn: () => Promise<void>) => {
    setLocalError("");
    void fn().catch((e) =>
      setLocalError(
        e instanceof Error ? e.message : "Não foi possível salvar.",
      ),
    );
  };
  const statusText = {
    pending: "Pendente",
    completed: "Concluída",
    skipped: "Não rolou hoje",
    postponed: "Adiada",
  }[task.status];
  return (
    <>
      <AppCard style={{ padding: 13 }}>
        <View style={[styles.row, { flexWrap: "nowrap" }]}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={`Concluir ${task.titleSnapshot}`}
            accessibilityState={{
              checked: task.status === "completed",
              disabled: busy || task.status === "postponed",
            }}
            disabled={busy || task.status === "postponed"}
            style={{
              minWidth: 48,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() =>
              run(() =>
                update(task.status === "completed" ? "pending" : "completed"),
              )
            }
          >
            <Icon
              name={
                task.status === "completed"
                  ? "checkbox"
                  : task.status === "postponed"
                    ? "arrow-redo-outline"
                    : "square-outline"
              }
              color={task.status === "completed" ? c.primary : c.muted}
              size={26}
            />
          </Pressable>
          <View style={{ flex: 1, gap: 3 }}>
            <AppText
              style={{
                textDecorationLine:
                  task.status === "completed" ? "line-through" : "none",
              }}
            >
              {task.titleSnapshot}
            </AppText>
            <AppText variant="micro" tone="muted">
              {task.localTime ?? "SEM HORÁRIO"} · {statusText} · {task.xpValue}{" "}
              XP
            </AppText>
          </View>
          <IconButton
            icon="ellipsis-horizontal"
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
        title={task.titleSnapshot}
        onClose={() => setOpen(false)}
      >
        <AppText variant="micro" tone="green">
          {categoryNames[task.category]} · {task.localDate} · {statusText}
        </AppText>
        {task.category === "meal" && (
          <AppText tone="muted">
            É um lembrete para observar sua rotina. Não precisa comer sem fome.
          </AppText>
        )}
        <Field
          label="Anotação"
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={2000}
        />
        <Button
          title="Salvar anotação"
          secondary
          disabled={busy}
          onPress={() =>
            act(async () => {
              await mutate((s) => {
                s.occurrences.find((o) => o.id === task.id)!.notes = notes;
              });
              setOpen(false);
            })
          }
        />
        {task.status !== "postponed" && (
          <>
            <AppText variant="heading">Não rolou hoje?</AppText>
            <View style={styles.row}>
              {[
                "sem tempo",
                "cansaço",
                "imprevisto",
                "não estava bem",
                "outro",
              ].map((r) => (
                <Chip
                  key={r}
                  label={r}
                  selected={reason === r}
                  onPress={() => setReason(r)}
                />
              ))}
            </View>
            <Button
              title="Registrar sem cobrança"
              secondary
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
              <AppText tone="accent">
                {state.settings[0]?.skipReactions
                  ? "Perdeu um round, não a campanha. "
                  : ""}
                O plano não acabou. Ajuste a rota e volte quando puder. Nenhum
                XP foi retirado.
              </AppText>
            )}
            <Field
              label="Reprogramar para (AAAA-MM-DD)"
              value={target}
              onChangeText={setTarget}
            />
            <Button
              title="AJUSTAR MISSÃO"
              secondary
              disabled={busy}
              onPress={() =>
                act(async () => {
                  await mutate((s) =>
                    postpone(s, task.id, target, uuid, notes),
                  );
                  setOpen(false);
                })
              }
            />
          </>
        )}
        {localError && (
          <AppText accessibilityLiveRegion="assertive" tone="accent">
            {localError}
          </AppText>
        )}
        <Button title="Encerrar por hoje" onPress={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
