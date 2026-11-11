import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  AppCard,
  AppText,
  Brand,
  Button,
  Field,
  Icon,
  IconButton,
  ProgressRing,
  Screen,
  SectionHeader,
  styles,
} from "../../src/components/ui";
import { useApp, uuid } from "../../src/features/AppProvider";
import {
  dayTasks,
  plannedStreak,
  progress,
  totalXP,
} from "../../src/domain/planner";
import { colors as c } from "../../src/theme/tokens";
import { MissionRow } from "../../src/components/MissionRow";
const quotes = [
  "O próximo passo não precisa ser épico. Precisa ser possível.",
  "Organização primeiro. Consistência depois.",
  "Um riff por vez. Precisão antes de velocidade.",
  "O plano não acabou. Ajuste a rota e volte quando puder.",
];
export default function Today() {
  const { state, today, mutate, run, busy } = useApp();
  const tasks = dayTasks(state, today);
  const p = progress(tasks);
  const [reflection, setReflection] = useState("");
  const next = tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) =>
      (a.localTime ?? "99").localeCompare(b.localTime ?? "99"),
    )[0];
  const quote = quotes[Number(today.replaceAll("-", "")) % quotes.length];
  const save = () =>
    run(async () => {
      await mutate((s) => {
        const old = s.reflections.find((r) => r.localDate === today);
        if (old) old.notes = reflection;
        else
          s.reflections.push({
            id: uuid(),
            localDate: today,
            notes: reflection,
            createdAt: new Date().toISOString(),
          });
      });
      setReflection("");
    });
  return (
    <Screen>
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Brand />
        <IconButton
          icon="trophy-outline"
          label="Abrir Motivation Center"
          onPress={() => router.push("/motivation")}
        />
      </View>
      <View>
        <AppText variant="micro" tone="muted">
          {new Date(`${today}T12:00:00`)
            .toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
            .toUpperCase()}
        </AppText>
        <AppText variant="title">
          Vamos nessa
          {state.profiles[0]?.displayName
            ? `, ${state.profiles[0].displayName.split(" ")[0]}`
            : ""}
          .
        </AppText>
        <AppText tone="muted">Seu próximo passo começa aqui.</AppText>
      </View>
      <LinearGradient
        colors={[c.forest, c.surface]}
        style={[styles.card, { borderColor: "#3C6B52", padding: 20 }]}
      >
        <AppText variant="micro" tone="green">
          OPERAÇÃO // UM DIA DE CADA VEZ
        </AppText>
        <View style={styles.row}>
          <ProgressRing {...p} />
          <View style={{ flex: 1, minWidth: 105, gap: 8 }}>
            <AppText variant="heading">
              {p.total && p.done === p.total
                ? "Missão cumprida."
                : p.done
                  ? "Você já começou."
                  : "Hoje é uma chance."}
            </AppText>
            <AppText tone="muted">{quote}</AppText>
          </View>
        </View>
        <Button
          title="VER MISSÕES"
          icon="arrow-forward-outline"
          onPress={() => router.push("/missions")}
        />
      </LinearGradient>
      <View style={styles.row}>
        <AppCard style={{ flex: 1, minWidth: 115 }}>
          <Icon name="flash-outline" color={c.accent} />
          <AppText variant="heading">{totalXP(state)} XP</AppText>
          <AppText variant="micro" tone="muted">
            CONQUISTADOS
          </AppText>
        </AppCard>
        <AppCard style={{ flex: 1, minWidth: 115 }}>
          <Icon name="leaf-outline" />
          <AppText variant="heading">
            {state.settings[0]?.hideStreak
              ? state.badges.length
              : plannedStreak(state, today)}
          </AppText>
          <AppText variant="micro" tone="muted">
            {state.settings[0]?.hideStreak ? "CONQUISTAS" : "DIAS CUMPRIDOS"}
          </AppText>
        </AppCard>
      </View>
      <SectionHeader title="Suas frentes" eyebrow="TREINE. CUIDE. PRATIQUE." />
      {(
        [
          {
            title: "Movimento",
            desc: "Um passo possível, sem pressa.",
            icon: "fitness-outline",
            path: "/movement",
            cat: "movement",
          },
          {
            title: "Alimentação",
            desc: "Observe sua rotina, sem julgamentos.",
            icon: "restaurant-outline",
            path: "/food",
            cat: "meal",
          },
          {
            title: "Guitarra",
            desc: "Dê espaço ao próximo riff.",
            icon: "musical-notes-outline",
            path: "/guitar",
            cat: "guitar",
          },
        ] as const
      ).map((item) => {
        const count = progress(tasks.filter((t) => t.category === item.cat));
        return (
          <AppCard key={item.cat}>
            <View style={styles.row}>
              <Icon name={item.icon} />
              <View style={{ flex: 1 }}>
                <AppText variant="heading">{item.title}</AppText>
                <AppText tone="muted">{item.desc}</AppText>
              </View>
              <AppText variant="micro" tone="green">
                {count.done}/{count.total}
              </AppText>
            </View>
            <Button
              title={`Abrir ${item.title.toLowerCase()}`}
              secondary
              onPress={() => router.push(item.path)}
            />
          </AppCard>
        );
      })}
      <SectionHeader title="Próximo compromisso" />
      {next ? (
        <MissionRow task={next} />
      ) : (
        <AppText tone="muted">
          {tasks.length
            ? "Sem pendências por aqui. Reserve espaço para descansar."
            : "Seu plano está aberto. Crie uma missão para começar."}
        </AppText>
      )}
      <SectionHeader title="Resumo do dia" />
      <AppText tone="muted">
        {p.done} concluídas ·{" "}
        {tasks.filter((t) => t.status === "pending").length} pendentes ·{" "}
        {tasks.filter((t) => t.status === "skipped").length} não rolaram ·{" "}
        {tasks.filter((t) => t.status === "postponed").length} adiadas
      </AppText>
      <AppCard>
        <AppText>O que vale guardar de hoje?</AppText>
        {state.reflections.find((r) => r.localDate === today)?.notes && (
          <AppText tone="green">
            {state.reflections.find((r) => r.localDate === today)?.notes}
          </AppText>
        )}
        <Field
          label="Reflexão do dia"
          multiline
          value={reflection}
          onChangeText={setReflection}
          maxLength={2000}
          placeholder="Uma pequena vitória também conta."
        />
        <Button
          title="Guardar reflexão"
          secondary
          onPress={save}
          disabled={busy || !reflection.trim()}
        />
      </AppCard>
    </Screen>
  );
}
