import React from "react";
import {
  AppCard,
  AppText,
  Button,
  ProgressBar,
  RetroBadge,
  Screen,
  ScreenHeader,
  SectionHeader,
} from "../src/components/ui";
import { View } from "react-native";
import { colors as c } from "../src/theme/tokens";
import { Character } from "../src/components/ReactionModal";
import { useApp } from "../src/features/AppProvider";
import { badgeDefinitions, totalXP } from "../src/domain/planner";
export default function Motivation() {
  const { state, celebrate } = useApp();
  return (
    <Screen>
      <ScreenHeader
        eyebrow="MOTIVATION CENTER"
        tone="accent"
        title="Você está no jogo."
        subtitle="Seu esforço fica registrado. Dias difíceis não apagam suas conquistas."
      />
      <AppCard variant="hero" corners style={{ borderColor: `${c.accent}66` }}>
        <AppText variant="micro" tone="accent">
          {"> XP_ACUMULADO"}
        </AppText>
        <AppText
          variant="display"
          tone="accent"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {totalXP(state)}
        </AppText>
        <View style={{ gap: 6 }}>
          <AppText variant="label">
            {state.badges.length} de {badgeDefinitions.length} conquistas
            desbloqueadas
          </AppText>
          <ProgressBar
            value={state.badges.length}
            total={badgeDefinitions.length}
            segments={badgeDefinitions.length}
            height={8}
            color={c.accent}
          />
        </View>
        <AppText variant="small" tone="subtle">
          XP é histórico: desfazer uma missão não o retira; concluir novamente
          não o duplica.
        </AppText>
      </AppCard>
      <SectionHeader eyebrow="BADGES" title="Sua coleção" />
      {badgeDefinitions.map((b, index) => {
        const unlock = state.badges.find((u) => u.badgeId === b.id);
        return (
          <AppCard
            key={b.id}
            corners={!!unlock}
            style={
              unlock ? { borderColor: `${c.accent}55` } : { opacity: 0.75 }
            }
          >
            <RetroBadge title={b.title} unlocked={!!unlock} />
            <AppText variant="small" tone="muted">
              {b.description}
            </AppText>
            {unlock && (
              <>
                <Character index={b.character} />
                <AppText variant="micro" tone="green">
                  REAÇÃO {String(index + 1).padStart(2, "0")} ·{" "}
                  {new Date(unlock.unlockedAt).toLocaleDateString("pt-BR")}
                </AppText>
                <Button
                  title="Rever conquista"
                  secondary
                  size="sm"
                  icon="play"
                  onPress={() => celebrate(b.id)}
                />
              </>
            )}
          </AppCard>
        );
      })}
      <SectionHeader eyebrow="ELENCO" title="Quatro aliados originais" />
      {["O Campeão", "O Comando", "O Veterano", "O Rival"].map((name, i) => (
        <AppCard key={name}>
          <Character index={i} />
          <AppText variant="heading" style={{ textAlign: "center" }}>
            {name}
          </AppText>
          <AppText tone="muted" style={{ textAlign: "center" }}>
            {
              [
                "Cada pequeno passo merece ser visto.",
                "Ajuste a rota. A campanha continua.",
                "Descansar também é parte do plano.",
                "Precisão primeiro. Velocidade depois.",
              ][i]
            }
          </AppText>
        </AppCard>
      ))}
    </Screen>
  );
}
