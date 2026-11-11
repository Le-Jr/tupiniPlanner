import React from "react";
import { View } from "react-native";
import { AppText, Chip, styles } from "../components/ui";
import type { TaskOccurrence } from "../domain/model";
export function LogMission({
  tasks,
  selected,
  onSelect,
}: {
  tasks: TaskOccurrence[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <AppText tone="muted">
        Concluir também uma missão? O registro sozinho não gera XP.
      </AppText>
      <View style={styles.row}>
        <Chip
          label="Só registrar"
          selected={!selected}
          onPress={() => onSelect("")}
        />
        {tasks
          .filter((t) => t.status === "pending" || t.status === "skipped")
          .map((t) => (
            <Chip
              key={t.id}
              label={t.titleSnapshot}
              selected={selected === t.id}
              onPress={() => onSelect(t.id)}
            />
          ))}
      </View>
    </>
  );
}
