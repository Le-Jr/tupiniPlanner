import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  AppCard,
  AppText,
  Button,
  Chip,
  EmptyState,
  Field,
  IconButton,
  IconTile,
  Pill,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  styles,
} from "../../src/components/ui";
import { MissionRow } from "../../src/components/MissionRow";
import { DateStrip } from "../../src/components/DateStrip";
import { TaskEditor } from "../../src/features/TaskEditor";
import { useApp, uuid } from "../../src/features/AppProvider";
import {
  categories,
  categoryNames,
  type Category,
  type TaskTemplate,
} from "../../src/domain/model";
import {
  dayTasks,
  materialize,
  progress,
  validDate,
} from "../../src/domain/planner";
import {
  categoryColors,
  categoryIcons,
  colors as c,
} from "../../src/theme/tokens";
const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export default function Missions() {
  const { state, today, run, mutate } = useApp();
  const [date, setDate] = useState(today);
  const [input, setInput] = useState(today);
  const [jump, setJump] = useState(false);
  const [filter, setFilter] = useState<Category | undefined>();
  const [editor, setEditor] = useState<TaskTemplate | "new" | null>(null);
  const [plans, setPlans] = useState(false);
  const navigate = (d: string) =>
    run(async () => {
      if (!validDate(d)) throw new Error("Data inválida. Use AAAA-MM-DD.");
      if (d >= today) await mutate((s) => materialize(s, d, uuid));
      setDate(d);
      setInput(d);
      setJump(false);
    });
  const tasks = dayTasks(state, date, filter);
  const all = progress(dayTasks(state, date));
  const used = categories.filter((cat) =>
    dayTasks(state, date).some((t) => t.category === cat),
  );
  const label =
    date === today
      ? "Hoje"
      : new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "short",
        });
  return (
    <Screen>
      <ScreenHeader
        eyebrow="SEU PLANNER"
        title="Uma missão por vez."
        right={
          <IconButton
            icon="calendar-outline"
            label="Ir para uma data específica"
            onPress={() => setJump(!jump)}
          />
        }
      />
      <DateStrip value={date} onChange={navigate} />
      {jump && (
        <AppCard>
          <Field
            label="Ir para data (AAAA-MM-DD)"
            value={input}
            onChangeText={setInput}
            autoFocus
          />
          <Button
            title="Ir para data"
            size="sm"
            onPress={() => navigate(input)}
          />
        </AppCard>
      )}

      <View style={{ gap: 8 }}>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <AppText variant="heading" style={{ textTransform: "capitalize" }}>
            {label}
          </AppText>
          <AppText
            variant="micro"
            tone={all.total && all.done === all.total ? "green" : "muted"}
          >
            {all.done}/{all.total} CONCLUÍDAS
          </AppText>
        </View>
        {all.total > 0 && (
          <ProgressBar value={all.done} total={all.total} segments={20} />
        )}
      </View>

      {(used.length > 1 || !!filter) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ marginHorizontal: -20 }}
        >
          <View style={{ width: 12 }} />
          <Chip
            label="Todas"
            selected={!filter}
            onPress={() => setFilter(undefined)}
          />
          {used.map((cat) => (
            <Chip
              key={cat}
              icon={categoryIcons[cat]}
              color={categoryColors[cat]}
              label={categoryNames[cat]}
              selected={filter === cat}
              onPress={() => setFilter(filter === cat ? undefined : cat)}
            />
          ))}
          <View style={{ width: 12 }} />
        </ScrollView>
      )}

      {!tasks.length && (
        <EmptyState
          icon="cafe-outline"
          title="Espaço para o que importa."
          detail="Nenhuma missão nesta data ou categoria. Descansar também faz parte."
        />
      )}
      {categories.map((cat) => {
        const group = tasks.filter((t) => t.category === cat);
        if (!group.length) return null;
        const gp = progress(group);
        return (
          <View key={cat} style={{ gap: 10 }}>
            <View
              style={[
                styles.row,
                { justifyContent: "space-between", marginTop: 6 },
              ]}
            >
              <AppText variant="micro" style={{ color: categoryColors[cat] }}>
                {"// "}
                {categoryNames[cat].toUpperCase()}
              </AppText>
              <AppText variant="micro" tone="subtle">
                {gp.done}/{gp.total}
              </AppText>
            </View>
            {group.map((t) => (
              <MissionRow key={t.id} task={t} />
            ))}
          </View>
        );
      })}

      <Button title="NOVA MISSÃO" icon="add" onPress={() => setEditor("new")} />

      <SectionHeader
        eyebrow="RECORRÊNCIAS"
        title="Seus planos"
        action={
          <Button
            title={plans ? "Ocultar" : "Gerenciar"}
            size="sm"
            ghost
            icon={plans ? "chevron-up" : "chevron-down"}
            onPress={() => setPlans(!plans)}
          />
        }
      />
      {plans &&
        state.templates
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((t, index) => (
            <AppCard
              key={t.id}
              accent={categoryColors[t.category]}
              style={{ paddingLeft: 16 }}
            >
              <View style={[styles.row, { flexWrap: "nowrap" }]}>
                <IconTile
                  icon={categoryIcons[t.category]}
                  color={t.active ? categoryColors[t.category] : c.subtle}
                  size={38}
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText variant="label" tone={t.active ? "normal" : "muted"}>
                    {t.title}
                  </AppText>
                  <View style={[styles.row, { gap: 6 }]}>
                    <Pill
                      label={t.active ? "ATIVA" : "PAUSADA"}
                      color={t.active ? c.primary : c.subtle}
                    />
                    <AppText variant="small" tone="subtle">
                      {t.oneOffDate ??
                        t.recurrenceDays.map((d) => weekdays[d]).join(" · ")}
                      {t.localTime ? ` · ${t.localTime}` : ""}
                    </AppText>
                  </View>
                </View>
              </View>
              <View style={[styles.row, { flexWrap: "nowrap" }]}>
                <Button
                  title="Editar"
                  size="sm"
                  secondary
                  icon="create-outline"
                  style={{ flex: 1 }}
                  onPress={() => setEditor(t)}
                />
                <IconButton
                  label={`Mover ${t.title} para cima`}
                  icon="arrow-up"
                  color={index === 0 ? c.subtle : c.primary}
                  onPress={() =>
                    run(() =>
                      mutate((s) => {
                        const ordered = s.templates
                          .slice()
                          .sort((a, b) => a.order - b.order);
                        const i = ordered.findIndex((x) => x.id === t.id);
                        if (i > 0)
                          [ordered[i - 1], ordered[i]] = [
                            ordered[i]!,
                            ordered[i - 1]!,
                          ];
                        ordered.forEach((p, k) => {
                          p.order = k;
                          for (const o of s.occurrences)
                            if (
                              o.templateId === p.id &&
                              o.localDate >= today &&
                              o.status === "pending"
                            )
                              o.order = k;
                        });
                      }),
                    )
                  }
                />
              </View>
            </AppCard>
          ))}
      {editor && (
        <TaskEditor
          template={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
        />
      )}
    </Screen>
  );
}
