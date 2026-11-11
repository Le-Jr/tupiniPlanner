import React, { useState } from "react";
import { View } from "react-native";
import {
  categories,
  categoryNames,
  type Category,
  type TaskTemplate,
} from "../domain/model";
import { saveTemplate } from "../domain/planner";
import { useApp, uuid } from "./AppProvider";
import { AppText, Button, Chip, Field, Toggle, styles } from "../components/ui";
import { Sheet } from "../components/Sheet";
import { numberInput, message } from "../utils/input";
export function TaskEditor({
  template,
  onClose,
}: {
  template?: TaskTemplate;
  onClose: () => void;
}) {
  const { mutate, today, busy } = useApp();
  const [title, setTitle] = useState(template?.title ?? "");
  const [category, setCategory] = useState<Category>(
    template?.category ?? "custom",
  );
  const [time, setTime] = useState(template?.localTime ?? "");
  const [days, setDays] = useState(
    template?.recurrenceDays ?? [new Date().getDay()],
  );
  const [date, setDate] = useState(template?.oneOffDate ?? today);
  const [single, setSingle] = useState(!!template?.oneOffDate);
  const [xp, setXP] = useState(String(template?.xpValue ?? 15));
  const [active, setActive] = useState(template?.active ?? true);
  const [workout, setWorkout] = useState<"walk" | "calisthenics">(
    template?.workoutRef ?? "walk",
  );
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const save = () => {
    setError("");
    void Promise.resolve()
      .then(async () => {
        const xpValue = numberInput(xp, 0, 100, "XP")!;
        await mutate((s) =>
          saveTemplate(
            s,
            {
              id: template?.id ?? uuid(),
              title: title.trim(),
              category,
              localTime: time || undefined,
              recurrenceDays: single ? [] : days,
              oneOffDate: single ? date : undefined,
              active,
              xpValue,
              order: template?.order ?? s.templates.length,
              createdDate: template?.createdDate ?? today,
              workoutRef: category === "movement" ? workout : undefined,
            },
            today,
            uuid,
          ),
        );
        onClose();
      })
      .catch((e) => setError(message(e)));
  };
  const remove = () => {
    void mutate((s) => {
      s.templates = s.templates.filter((t) => t.id !== template?.id);
      s.occurrences = s.occurrences.filter(
        (o) =>
          !(
            o.templateId === template?.id &&
            o.localDate >= today &&
            o.status === "pending" &&
            !s.xp.some((x) => x.sourceId === o.id)
          ),
      );
      for (const o of s.occurrences)
        if (o.templateId === template?.id) o.templateId = undefined;
    })
      .then(onClose)
      .catch((e) => setError(message(e)));
  };
  return (
    <Sheet
      visible
      title={template ? "Editar plano" : "Nova missão"}
      onClose={onClose}
    >
      <Field
        label="Título"
        value={title}
        onChangeText={setTitle}
        maxLength={120}
      />
      <View style={styles.row}>
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={categoryNames[cat]}
            selected={category === cat}
            onPress={() => setCategory(cat)}
          />
        ))}
      </View>
      {category === "movement" && (
        <View style={styles.row}>
          <Chip
            label="Caminhada"
            selected={workout === "walk"}
            onPress={() => setWorkout("walk")}
          />
          <Chip
            label="Calistenia"
            selected={workout === "calisthenics"}
            onPress={() => setWorkout("calisthenics")}
          />
        </View>
      )}
      <Field
        label="Horário opcional (HH:MM)"
        value={time}
        onChangeText={setTime}
        placeholder="Sem horário fixo"
      />
      <Toggle label="Apenas uma vez" value={single} onChange={setSingle} />
      {single ? (
        <Field label="Data (AAAA-MM-DD)" value={date} onChangeText={setDate} />
      ) : (
        <View style={styles.row}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, i) => (
            <Chip
              key={day}
              label={day}
              selected={days.includes(i)}
              onPress={() =>
                setDays(
                  days.includes(i) ? days.filter((d) => d !== i) : [...days, i],
                )
              }
            />
          ))}
        </View>
      )}
      <Field
        label="XP por conclusão (0 a 100)"
        value={xp}
        onChangeText={setXP}
        keyboardType="number-pad"
      />
      <Toggle
        label="Missão ativa"
        value={active}
        onChange={setActive}
        detail="Desative para pausar o plano."
      />
      <AppText tone="muted">
        Alterações valem para pendências de hoje em diante. Registros anteriores
        ficam preservados.
      </AppText>
      {error && (
        <AppText tone="accent" accessibilityLiveRegion="assertive">
          {error}
        </AppText>
      )}
      <Button title="Salvar missão" onPress={save} disabled={busy} />
      {template && (
        <Button
          title={deleting ? "Confirmar exclusão do plano" : "Excluir plano"}
          secondary
          danger
          onPress={() => (deleting ? remove() : setDeleting(true))}
          disabled={busy}
        />
      )}
      {deleting && (
        <AppText tone="muted">
          O histórico é preservado; pendências atuais e futuras serão removidas.
        </AppText>
      )}
    </Sheet>
  );
}
