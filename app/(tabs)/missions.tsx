import React, { useState } from "react";
import { View } from "react-native";
import {
  AppText,
  AppCard,
  Button,
  Chip,
  EmptyState,
  Field,
  IconButton,
  Screen,
  SectionHeader,
  styles,
} from "../../src/components/ui";
import { MissionRow } from "../../src/components/MissionRow";
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
  shiftDate,
  validDate,
} from "../../src/domain/planner";
export default function Missions() {
  const { state, today, run, mutate } = useApp();
  const [date, setDate] = useState(today);
  const [input, setInput] = useState(today);
  const [filter, setFilter] = useState<Category | undefined>();
  const [editor, setEditor] = useState<TaskTemplate | "new" | null>(null);
  const [plans, setPlans] = useState(false);
  const navigate = (d: string) =>
    run(async () => {
      if (!validDate(d)) throw new Error("Data inválida. Use AAAA-MM-DD.");
      if (d >= today) await mutate((s) => materialize(s, d, uuid));
      setDate(d);
      setInput(d);
    });
  const tasks = dayTasks(state, date, filter);
  return (
    <Screen>
      <SectionHeader eyebrow="SEU PLANNER" title="Uma missão por vez." />
      <AppText tone="muted">
        Planeje o possível. Ajuste quando precisar.
      </AppText>
      <View style={styles.row}>
        <IconButton
          icon="chevron-back"
          label="Dia anterior"
          onPress={() => navigate(shiftDate(date, -1))}
        />
        <AppText style={{ flex: 1, textAlign: "center" }}>
          {date === today ? "Hoje" : date}
        </AppText>
        <IconButton
          icon="chevron-forward"
          label="Próximo dia"
          onPress={() => navigate(shiftDate(date, 1))}
        />
      </View>
      <Field
        label="Consultar data (AAAA-MM-DD)"
        value={input}
        onChangeText={setInput}
      />
      <Button title="Ir para data" secondary onPress={() => navigate(input)} />
      <View style={styles.row}>
        <Chip
          label="Todas"
          selected={!filter}
          onPress={() => setFilter(undefined)}
        />
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={categoryNames[cat]}
            selected={filter === cat}
            onPress={() => setFilter(cat)}
          />
        ))}
      </View>
      <Button
        title="NOVA MISSÃO"
        icon="add-outline"
        onPress={() => setEditor("new")}
      />
      {!tasks.length && (
        <EmptyState
          title="Espaço para o que importa."
          detail="Nenhuma missão nesta data ou categoria. Descansar também faz parte."
        />
      )}
      {categories.map((cat) => {
        const group = tasks.filter((t) => t.category === cat);
        return group.length ? (
          <View key={cat} style={{ gap: 12 }}>
            <SectionHeader title={categoryNames[cat]} />
            {group.map((t) => (
              <MissionRow key={t.id} task={t} />
            ))}
          </View>
        ) : null;
      })}
      <Button
        title={plans ? "Ocultar planos" : "Editar planos e recorrências"}
        secondary
        onPress={() => setPlans(!plans)}
      />
      {plans &&
        state.templates
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((t) => (
            <AppCard key={t.id}>
              <AppText>{t.title}</AppText>
              <AppText variant="micro" tone="muted">
                {t.active ? "ATIVA" : "PAUSADA"} ·{" "}
                {t.oneOffDate ??
                  t.recurrenceDays
                    .map(
                      (d) =>
                        ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d],
                    )
                    .join(", ")}
              </AppText>
              <View style={styles.row}>
                <Button title="Editar" secondary onPress={() => setEditor(t)} />
                <IconButton
                  label={`Mover ${t.title} para cima`}
                  icon="arrow-up-outline"
                  onPress={() =>
                    run(() =>
                      mutate((s) => {
                        const ordered = s.templates
                          .slice()
                          .sort((a, b) => a.order - b.order);
                        const index = ordered.findIndex((x) => x.id === t.id);
                        if (index > 0)
                          [ordered[index - 1], ordered[index]] = [
                            ordered[index]!,
                            ordered[index - 1]!,
                          ];
                        ordered.forEach((p, i) => {
                          p.order = i;
                          for (const o of s.occurrences)
                            if (
                              o.templateId === p.id &&
                              o.localDate >= today &&
                              o.status === "pending"
                            )
                              o.order = i;
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
