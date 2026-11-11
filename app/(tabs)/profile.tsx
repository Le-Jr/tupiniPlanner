import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  AppCard,
  AppText,
  Brand,
  Button,
  Chip,
  Field,
  Pill,
  Screen,
  ScreenHeader,
  SectionHeader,
  Toggle,
  styles,
} from "../../src/components/ui";
import { badgeDefinitions, totalXP } from "../../src/domain/planner";
import { colors as c } from "../../src/theme/tokens";
import { Sheet } from "../../src/components/Sheet";
import { useApp, uuid } from "../../src/features/AppProvider";
import { emptyState, type State } from "../../src/domain/model";
import { exportBackup, parseBackup } from "../../src/domain/backup";
import { numberInput } from "../../src/utils/input";
import { pickBackup, shareBackup } from "../../src/utils/backupFiles";
import { giphyConfigured } from "../../src/services/giphy";
import {
  eveningChoices,
  leadChoices,
  morningChoices,
  reminderPrefs,
  sampleReminder,
  type ReminderPrefs,
} from "../../src/domain/reminders";
import {
  ensurePermission,
  notificationsSupported,
  sendSample,
} from "../../src/services/notifications";
export default function Profile() {
  const { state, mutate, run, busy, systemReduce, closeReward, notify } =
    useApp();
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
      notify("Perfil atualizado");
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
      notify("Backup importado");
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
  const reminders = reminderPrefs(settings);
  const setReminder = (patch: Partial<ReminderPrefs>) =>
    run(() =>
      mutate((s) => {
        const st = s.settings[0]!;
        st.reminders = { ...reminderPrefs(st), ...patch };
      }),
    );
  const toggleNotifications = (on: boolean) =>
    run(async () => {
      if (on && !(await ensurePermission())) {
        notify(
          "Permita as notificações do app nas configurações do Android.",
          "info",
        );
        return;
      }
      await mutate((s) => {
        s.settings[0]!.notificationsEnabled = on;
      });
      notify(on ? "Lembretes ligados" : "Lembretes desligados", "info");
    });
  return (
    <Screen>
      <ScreenHeader
        eyebrow="PERFIL"
        title="Seu plano. Suas regras."
        subtitle="Tudo fica neste aparelho. Nenhum login necessário."
      />
      <AppCard variant="hero" corners>
        <View style={[styles.row, { flexWrap: "nowrap", gap: 14 }]}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: c.primary,
            }}
          >
            <AppText variant="title" style={{ color: c.onPrimary }}>
              {(profile.displayName.trim()[0] ?? ">").toUpperCase()}
            </AppText>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="heading">
              {profile.displayName.trim() || "Recruta anônimo"}
            </AppText>
            <View style={[styles.row, { gap: 6 }]}>
              <Pill
                icon="flash"
                label={`${totalXP(state)} XP`}
                color={c.accent}
              />
              <Pill
                icon="ribbon"
                label={`${state.badges.length}/${badgeDefinitions.length} CONQUISTAS`}
                color={c.primary}
              />
            </View>
          </View>
        </View>
      </AppCard>
      <SectionHeader eyebrow="DADOS PESSOAIS" title="Sobre você" />
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
        <Button
          title="Salvar perfil"
          icon="checkmark"
          onPress={save}
          disabled={busy}
        />
      </AppCard>
      <Button
        title="Ajustar frequências e dias de descanso"
        secondary
        icon="calendar-outline"
        onPress={() => router.push("/missions")}
      />
      <SectionHeader eyebrow="EXPERIÊNCIA" title="Deixe com a sua cara" />
      <AppCard>
        <Toggle
          label="Tema noturno profundo"
          icon="moon"
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
          icon="sparkles"
          value={settings.animationsEnabled}
          onChange={(v) => setting("animationsEnabled", v)}
        />
        <Toggle
          label="GIFs anos 80 (online)"
          icon="film"
          value={settings.gifsEnabled !== false}
          onChange={(v) =>
            run(() =>
              mutate((s) => {
                s.settings[0]!.gifsEnabled = v;
              }),
            )
          }
          detail={
            giphyConfigured
              ? "Busca GIFs no GIPHY nas conquistas e no Motivation Center. Só o termo de busca é enviado."
              : "Defina EXPO_PUBLIC_GIPHY_API_KEY no .env para ativar. Sem chave, usamos os personagens originais."
          }
        />
        <Toggle
          label="Reduzir movimento"
          icon="pause-circle"
          value={settings.reducedMotion}
          onChange={(v) => setting("reducedMotion", v)}
          detail={
            systemReduce
              ? "Redução de movimento também ativa no sistema."
              : "Reações ficam estáticas."
          }
        />
        <Toggle
          label="Vibração e toques"
          icon="phone-portrait"
          value={settings.hapticsEnabled}
          onChange={(v) => setting("hapticsEnabled", v)}
        />
        <Toggle
          label="Humor leve ao pular uma missão"
          icon="happy"
          value={settings.skipReactions}
          onChange={(v) => setting("skipReactions", v)}
        />
        <Toggle
          label="Ocultar métricas corporais"
          icon="eye-off"
          value={settings.hideBody}
          onChange={(v) => setting("hideBody", v)}
        />
        <Toggle
          label="Ocultar sequência de dias"
          icon="flame"
          value={settings.hideStreak}
          onChange={(v) => setting("hideStreak", v)}
        />
      </AppCard>
      <SectionHeader eyebrow="NOTIFICAÇÕES" title="Lembretes no seu ritmo" />
      <AppCard>
        <Toggle
          label="Lembretes no celular"
          icon="notifications"
          value={settings.notificationsEnabled && notificationsSupported}
          onChange={toggleNotifications}
          detail={
            notificationsSupported
              ? "Gerados e agendados no próprio aparelho, com o seu nome. Nada sai do celular."
              : "Disponível no app Android."
          }
        />
        {settings.notificationsEnabled && notificationsSupported && (
          <>
            <Toggle
              label="Na hora de cada missão"
              icon="alarm"
              value={reminders.missions}
              onChange={(v) => setReminder({ missions: v })}
              detail="Só para missões com horário definido."
            />
            {reminders.missions && (
              <View style={[styles.row, { gap: 8 }]}>
                {leadChoices.map((m) => (
                  <Chip
                    key={m}
                    label={m ? `${m} min antes` : "Na hora"}
                    selected={reminders.lead === m}
                    onPress={() => setReminder({ lead: m })}
                  />
                ))}
              </View>
            )}
            <Toggle
              label="Bom dia com a fita do dia"
              icon="sunny"
              value={reminders.morning}
              onChange={(v) => setReminder({ morning: v })}
              detail="Quantas missões tem hoje e uma frase dos anos 70/80."
            />
            {reminders.morning && (
              <View style={[styles.row, { gap: 8 }]}>
                {morningChoices.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={reminders.morningTime === t}
                    onPress={() => setReminder({ morningTime: t })}
                  />
                ))}
              </View>
            )}
            <Toggle
              label="Placar da noite"
              icon="moon"
              value={reminders.evening}
              onChange={(v) => setReminder({ evening: v })}
              detail="Só aparece se ainda houver missões abertas no dia."
            />
            {reminders.evening && (
              <View style={[styles.row, { gap: 8 }]}>
                {eveningChoices.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={reminders.eveningTime === t}
                    onPress={() => setReminder({ eveningTime: t })}
                  />
                ))}
              </View>
            )}
            <Button
              title="Testar notificação"
              secondary
              onPress={() =>
                run(async () => {
                  const ok = await sendSample(
                    sampleReminder(state, new Date()),
                  );
                  notify(
                    ok
                      ? "Chega em 5 segundos. Bloqueie a tela para ver."
                      : "Permita as notificações do app nas configurações do Android.",
                    "info",
                  );
                })
              }
            />
          </>
        )}
      </AppCard>
      <SectionHeader
        eyebrow="PRIVACIDADE"
        title="Seus dados, sob seu controle"
      />
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
      <AppCard variant="outline" style={{ alignItems: "center" }}>
        <Brand />
        <AppText variant="micro" tone="subtle">
          VERSÃO 1.0.0
        </AppText>
        <AppText variant="small" tone="subtle" style={{ textAlign: "center" }}>
          Marca provisória substituível. Reações vetoriais originais; sem
          imagens, falas ou vozes de filmes. Inter e JetBrains Mono: SIL OFL.
          Ionicons: MIT.
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
