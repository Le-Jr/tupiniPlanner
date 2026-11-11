import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  AppCard,
  AppText,
  Brand,
  Button,
  Field,
  Icon,
  IconButton,
  IconTile,
  PressableScale,
  ProgressBar,
  ProgressRing,
  Screen,
  SectionHeader,
  StatTile,
  styles,
} from "../../src/components/ui";
import { useApp, uuid } from "../../src/features/AppProvider";
import {
  dayTasks,
  plannedStreak,
  progress,
  totalXP,
} from "../../src/domain/planner";
import { categoryColors, colors as c, fonts } from "../../src/theme/tokens";
import { MissionRow } from "../../src/components/MissionRow";
const quotes = [
  "O próximo passo não precisa ser épico. Precisa ser possível.",
  "Organização primeiro. Consistência depois.",
  "Um riff por vez. Precisão antes de velocidade.",
  "O plano não acabou. Ajuste a rota e volte quando puder.",
];
const fronts = [
  {
    title: "Movimento",
    desc: "Um passo possível",
    icon: "fitness",
    path: "/movement",
    cat: "movement",
  },
  {
    title: "Alimentação",
    desc: "Rotina sem julgamento",
    icon: "restaurant",
    path: "/food",
    cat: "meal",
  },
  {
    title: "Guitarra",
    desc: "O próximo riff",
    icon: "musical-notes",
    path: "/guitar",
    cat: "guitar",
  },
] as const;
function greeting() {
  const h = new Date().getHours();
  return h < 5
    ? "Boa madrugada"
    : h < 12
      ? "Bom dia"
      : h < 18
        ? "Boa tarde"
        : "Boa noite";
}
export default function Today() {
  const { state, today, mutate, run, busy, notify } = useApp();
  const tasks = dayTasks(state, today);
  const p = progress(tasks);
  const [reflection, setReflection] = useState("");
  const saved = state.reflections.find((r) => r.localDate === today)?.notes;
  const pending = tasks
    .filter((t) => t.status === "pending")
    .sort((a, b) => (a.localTime ?? "99").localeCompare(b.localTime ?? "99"));
  const next = pending[0];
  const quote = quotes[Number(today.replaceAll("-", "")) % quotes.length];
  const name = state.profiles[0]?.displayName?.split(" ")[0];
  const settings = state.settings[0];
  const complete = p.total > 0 && p.done === p.total;
  const count = (s: string) => tasks.filter((t) => t.status === s).length;
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
      notify("Reflexão guardada");
    });
  return (
    <Screen>
      <View
        style={[
          styles.row,
          { justifyContent: "space-between", flexWrap: "nowrap" },
        ]}
      >
        <Brand />
        <IconButton
          icon="trophy"
          color={c.accent}
          label="Abrir Motivation Center"
          badge={state.badges.length > 0}
          onPress={() => router.push("/motivation")}
        />
      </View>

      <View style={{ gap: 4, marginTop: 4 }}>
        <AppText variant="micro" tone="subtle">
          {new Date(`${today}T12:00:00`)
            .toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
            .toUpperCase()}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {greeting()}
          {name ? `, ${name}` : ""}.
        </AppText>
      </View>

      <AppCard variant="hero" corners>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <AppText variant="micro" tone="green">
            {"> OPERAÇÃO_HOJE"}
          </AppText>
          {complete && (
            <AppText variant="micro" tone="accent">
              ★ MISSION COMPLETE
            </AppText>
          )}
        </View>
        <View style={[styles.row, { gap: 18 }]}>
          <ProgressRing done={p.done} total={p.total} />
          <View style={{ flex: 1, minWidth: 140, gap: 8 }}>
            <AppText variant="heading">
              {!p.total
                ? "Dia livre."
                : complete
                  ? "Missão cumprida."
                  : p.done
                    ? "Você já começou."
                    : "Hoje é uma chance."}
            </AppText>
            <AppText tone="muted" variant="small">
              {quote}
            </AppText>
          </View>
        </View>
        <View style={[styles.row, { gap: 14 }]}>
          {[
            { n: p.done, l: "feitas", color: c.primary },
            { n: count("pending"), l: "pendentes", color: c.muted },
            { n: count("skipped"), l: "não rolaram", color: c.accent },
            { n: count("postponed"), l: "adiadas", color: "#9FB4FF" },
          ]
            .filter((x) => x.n > 0 || x.l === "feitas" || x.l === "pendentes")
            .map((x) => (
              <View
                key={x.l}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <View
                  style={{ width: 6, height: 6, backgroundColor: x.color }}
                />
                <AppText variant="small" tone="muted">
                  <AppText variant="small" style={{ fontFamily: fonts.bold }}>
                    {x.n}
                  </AppText>{" "}
                  {x.l}
                </AppText>
              </View>
            ))}
        </View>
        <Button
          title={complete ? "REVER MISSÕES" : "VER MISSÕES"}
          icon="arrow-forward"
          onPress={() => router.push("/missions")}
        />
      </AppCard>

      <View style={[styles.row, { flexWrap: "nowrap" }]}>
        <StatTile
          icon="flash"
          color={c.accent}
          value={totalXP(state)}
          label="XP TOTAL"
        />
        {settings?.hideStreak ? (
          <StatTile
            icon="ribbon"
            value={state.badges.length}
            label="CONQUISTAS"
          />
        ) : (
          <StatTile
            icon="flame"
            value={plannedStreak(state, today)}
            label="DIAS CUMPRIDOS"
          />
        )}
      </View>

      {next && (
        <>
          <SectionHeader
            eyebrow="PRÓXIMO PASSO"
            title="Agora é com você"
            action={
              pending.length > 1 ? (
                <AppText variant="micro" tone="subtle">
                  +{pending.length - 1} NA FILA
                </AppText>
              ) : undefined
            }
          />
          <MissionRow task={next} />
        </>
      )}
      {!next && p.total > 0 && (
        <AppCard
          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <IconTile icon="cafe" color={c.accent} />
          <AppText tone="muted" style={{ flex: 1 }}>
            Sem pendências por aqui. Reserve espaço para descansar.
          </AppText>
        </AppCard>
      )}
      {!p.total && (
        <AppCard
          variant="outline"
          style={{ alignItems: "center", paddingVertical: 24 }}
        >
          <IconTile icon="add" />
          <AppText tone="muted" style={{ textAlign: "center" }}>
            Seu plano está aberto. Crie uma missão para começar.
          </AppText>
          <Button
            title="Criar missão"
            size="sm"
            secondary
            icon="add"
            onPress={() => router.push("/missions")}
          />
        </AppCard>
      )}

      <SectionHeader eyebrow="TREINE · CUIDE · PRATIQUE" title="Suas frentes" />
      <View style={{ gap: 10 }}>
        {fronts.map((item) => {
          const fp = progress(tasks.filter((t) => t.category === item.cat));
          const color = categoryColors[item.cat];
          return (
            <PressableScale
              key={item.cat}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${item.title}: ${fp.done} de ${fp.total} hoje`}
              onPress={() => router.push(item.path)}
            >
              <AppCard style={{ gap: 12 }}>
                <View style={[styles.row, { flexWrap: "nowrap" }]}>
                  <IconTile icon={item.icon} color={color} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" style={{ fontSize: 16 }}>
                      {item.title}
                    </AppText>
                    <AppText variant="small" tone="subtle">
                      {item.desc}
                    </AppText>
                  </View>
                  <AppText variant="micro" style={{ color }}>
                    {fp.done}/{fp.total}
                  </AppText>
                  <Icon name="chevron-forward" color={c.subtle} size={18} />
                </View>
                {fp.total > 0 && (
                  <ProgressBar value={fp.done} total={fp.total} color={color} />
                )}
              </AppCard>
            </PressableScale>
          );
        })}
      </View>

      <SectionHeader eyebrow="DIÁRIO" title="O que vale guardar de hoje?" />
      <AppCard>
        {saved && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View
              style={{ width: 2, backgroundColor: c.primary, borderRadius: 1 }}
            />
            <AppText tone="normal" style={{ flex: 1, fontStyle: "italic" }}>
              {saved}
            </AppText>
          </View>
        )}
        <Field
          label={saved ? "Atualizar reflexão" : "Reflexão do dia"}
          multiline
          value={reflection}
          onChangeText={setReflection}
          maxLength={2000}
          placeholder="Uma pequena vitória também conta."
        />
        <Button
          title="Guardar reflexão"
          secondary
          icon="bookmark-outline"
          onPress={save}
          disabled={busy || !reflection.trim()}
        />
      </AppCard>
    </Screen>
  );
}
