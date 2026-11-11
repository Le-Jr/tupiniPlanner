import React, { useState } from "react";
import { router } from "expo-router";
import {
  AppCard,
  AppText,
  Brand,
  Button,
  Field,
  Screen,
  SectionHeader,
  Toggle,
} from "../../src/components/ui";
import { Sheet } from "../../src/components/Sheet";
import { useApp, uuid } from "../../src/features/AppProvider";
import { emptyState, type State } from "../../src/domain/model";
import { exportBackup, parseBackup } from "../../src/domain/backup";
import { numberInput } from "../../src/utils/input";
import { pickBackup, shareBackup } from "../../src/utils/backupFiles";
export default function Profile() {
  const { state, mutate, run, busy, systemReduce, closeReward } = useApp();
  const profile = state.profiles[0]!;
  const settings = state.settings[0]!;
  const [name, setName] = useState(profile.displayName);
  const [height, setHeight] = useState(profile.heightCm?.toString() ?? "");
  const [goal, setGoal] = useState(
    state.goals
      .find((g) => g.category === "body" && g.active)
      ?.targetValue?.toString() ?? "",
  );
  const [sleep, setSleep] = useState(profile.sleepRoutine ?? "");
  const [activity, setActivity] = useState(profile.activityLevel ?? "");
  const [limits, setLimits] = useState(profile.limitations ?? "");
  const [mealRoutine, setMealRoutine] = useState(profile.mealRoutine ?? "");
  const [backup, setBackup] = useState<State | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [feedback, setFeedback] = useState("");
  const save = () =>
    run(async () => {
      const heightCm = numberInput(height, 80, 250, "Altura", true);
      const targetValue = numberInput(
        goal,
        20,
        400,
        "Meta de referência",
        true,
      );
      await mutate((s) => {
        Object.assign(s.profiles[0]!, {
          displayName: name.trim(),
          heightCm,
          sleepRoutine: sleep,
          activityLevel: activity,
          limitations: limits,
          mealRoutine,
        });
        s.goals.forEach((g) => {
          if (g.category === "body") g.active = false;
        });
        if (targetValue !== undefined)
          s.goals.push({
            id: uuid(),
            category: "body",
            title: "Referência de peso",
            targetValue,
            unit: "kg",
            active: true,
            createdAt: new Date().toISOString(),
          });
      });
      setFeedback("Perfil atualizado.");
    });
  const load = () =>
    run(async () => {
      const text = await pickBackup();
      if (text) setBackup(parseBackup(text));
    });
  const apply = () =>
    run(async () => {
      if (!backup) return;
      await mutate((s) => Object.assign(s, backup));
      closeReward();
      setBackup(null);
      setFeedback("Backup importado.");
      const p = backup.profiles[0]!;
      setName(p.displayName);
      setHeight(p.heightCm?.toString() ?? "");
      setGoal(
        backup.goals
          .find((g) => g.category === "body" && g.active)
          ?.targetValue?.toString() ?? "",
      );
      setSleep(p.sleepRoutine ?? "");
      setActivity(p.activityLevel ?? "");
      setLimits(p.limitations ?? "");
      setMealRoutine(p.mealRoutine ?? "");
    });
  const setting = (
    key:
      | "animationsEnabled"
      | "reducedMotion"
      | "hapticsEnabled"
      | "hideBody"
      | "hideStreak"
      | "skipReactions",
    value: boolean,
  ) =>
    run(() =>
      mutate((s) => {
        s.settings[0]![key] = value;
      }),
    );
  return (
    <Screen>
      <Brand />
      <AppText variant="title">Seu plano. Suas regras.</AppText>
      <AppText tone="muted">
        Tudo fica neste aparelho. Nenhum login necessário.
      </AppText>
      <AppCard>
        <Field
          label="Nome (opcional)"
          value={name}
          onChangeText={setName}
          maxLength={80}
        />
        <Field
          label="Altura em cm (opcional)"
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
        />
        <Field
          label="Meta de referência em kg (opcional)"
          value={goal}
          onChangeText={setGoal}
          keyboardType="decimal-pad"
        />
        <AppText tone="muted">
          Deixe a meta vazia para desativá-la. Não há prazo obrigatório nem
          ajuste automático de alimentação.
        </AppText>
        <Field
          label="Rotina de sono (opcional)"
          value={sleep}
          onChangeText={setSleep}
        />
        <Field
          label="Atividade atual (opcional)"
          value={activity}
          onChangeText={setActivity}
        />
        <Field
          label="Restrições físicas (opcional)"
          value={limits}
          onChangeText={setLimits}
        />
        <Field
          label="Rotina alimentar (opcional)"
          value={mealRoutine}
          onChangeText={setMealRoutine}
        />
        <Button title="Salvar perfil" onPress={save} disabled={busy} />
      </AppCard>
      <Button
        title="Ajustar frequências e dias de descanso"
        secondary
        onPress={() => router.push("/missions")}
      />
      <SectionHeader title="Deixe com a sua cara" />
      <AppCard>
        <Toggle
          label="Tema noturno profundo"
          value={settings.theme === "midnight"}
          onChange={(v) =>
            run(() =>
              mutate((s) => {
                s.settings[0]!.theme = v ? "midnight" : "forest";
              }),
            )
          }
        />
        <Toggle
          label="Mostrar reações de conquistas"
          value={settings.animationsEnabled}
          onChange={(v) => setting("animationsEnabled", v)}
        />
        <Toggle
          label="Reduzir movimento"
          value={settings.reducedMotion}
          onChange={(v) => setting("reducedMotion", v)}
          detail={
            systemReduce
              ? "Redução de movimento também ativa no sistema."
              : "Reações ficam estáticas."
          }
        />
        <Toggle
          label="Vibração nas conquistas"
          value={settings.hapticsEnabled}
          onChange={(v) => setting("hapticsEnabled", v)}
        />
        <Toggle
          label="Humor leve ao pular uma missão"
          value={settings.skipReactions}
          onChange={(v) => setting("skipReactions", v)}
        />
        <Toggle
          label="Ocultar métricas corporais"
          value={settings.hideBody}
          onChange={(v) => setting("hideBody", v)}
        />
        <Toggle
          label="Ocultar sequência de dias"
          value={settings.hideStreak}
          onChange={(v) => setting("hideStreak", v)}
        />
        <AppText variant="micro" tone="muted">
          SONS E NOTIFICAÇÕES: NÃO IMPLEMENTADOS NESTA VERSÃO.
        </AppText>
      </AppCard>
      <SectionHeader title="Seus dados, sob seu controle" />
      <AppCard>
        <AppText tone="muted">
          O backup inclui seus registros pessoais em JSON legível. Escolha onde
          guardar. A importação substitui os dados atuais após sua confirmação.
        </AppText>
        <Button
          title="Exportar backup JSON"
          icon="download-outline"
          secondary
          disabled={busy}
          onPress={() => run(() => shareBackup(exportBackup(state)))}
        />
        <Button
          title="Importar backup JSON"
          icon="cloud-upload-outline"
          secondary
          disabled={busy}
          onPress={load}
        />
        <Button
          title="Apagar todos os dados"
          secondary
          danger
          onPress={() => {
            setDeleting(true);
            setConfirm("");
          }}
        />
      </AppCard>
      {!!feedback && (
        <AppText tone="green" accessibilityLiveRegion="polite">
          {feedback}
        </AppText>
      )}
      <AppCard>
        <AppText variant="heading">TupiniPlanner · v1.0.0</AppText>
        <AppText>Train. Eat. Practice. Evolve.</AppText>
        <AppText tone="muted">
          Marca provisória substituível. Reações vetoriais originais; sem
          imagens, falas ou vozes de filmes. Inter e JetBrains Mono: SIL OFL.
          Ionicons: MIT.
        </AppText>
        <AppText variant="micro" tone="green">
          SIGNED BY LEANDRO JUNIOR
        </AppText>
      </AppCard>
      <Sheet
        visible={!!backup}
        title="Confirmar importação"
        onClose={() => setBackup(null)}
      >
        <AppText>
          Backup validado: {backup?.occurrences.length} missões,{" "}
          {backup?.measurements.length} medições e {backup?.guitar.length}{" "}
          práticas.
        </AppText>
        <AppText>
          Todos os dados atuais serão substituídos. Exporte um backup antes se
          quiser preservá-los. Você autoriza armazenar os dados importados neste
          aparelho?
        </AppText>
        <Button
          title="Autorizar e substituir dados"
          onPress={apply}
          disabled={busy}
        />
        <Button title="Cancelar" secondary onPress={() => setBackup(null)} />
      </Sheet>
      <Sheet
        visible={deleting}
        title="Apagar dados locais"
        onClose={() => setDeleting(false)}
      >
        <AppText>
          Esta ação remove perfil, agenda, histórico e conquistas deste
          aparelho. Backups que você exportou continuam onde foram salvos.
        </AppText>
        <Field
          label="Digite APAGAR para confirmar"
          value={confirm}
          onChangeText={setConfirm}
        />
        <Button
          title="Apagar definitivamente"
          danger
          disabled={busy || confirm !== "APAGAR"}
          onPress={() =>
            run(async () => {
              await mutate((s) => Object.assign(s, emptyState()));
              closeReward();
              setDeleting(false);
            })
          }
        />
      </Sheet>
    </Screen>
  );
}
