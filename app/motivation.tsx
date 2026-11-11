import React from "react";
import {
  AppCard,
  AppText,
  Button,
  RetroBadge,
  Screen,
  SectionHeader,
} from "../src/components/ui";
import { Character } from "../src/components/ReactionModal";
import { useApp } from "../src/features/AppProvider";
import { badgeDefinitions, totalXP } from "../src/domain/planner";
export default function Motivation() {
  const { state, celebrate } = useApp();
  return (
    <Screen>
      <AppText variant="micro" tone="accent">
        MOTIVATION CENTER
      </AppText>
      <AppText variant="title">Você está no jogo.</AppText>
      <AppText tone="muted">
        Seu esforço fica registrado. Dias difíceis não apagam suas conquistas.
      </AppText>
      <AppCard>
        <AppText variant="big" tone="accent">
          {totalXP(state)} XP
        </AppText>
        <AppText>
          {state.badges.length} de {badgeDefinitions.length} conquistas
          desbloqueadas
        </AppText>
        <AppText tone="muted">
          XP é histórico: desfazer uma missão não o retira; concluir novamente
          não o duplica.
        </AppText>
      </AppCard>
      <SectionHeader title="Sua coleção de conquistas" />
      {badgeDefinitions.map((b, index) => {
        const unlock = state.badges.find((u) => u.badgeId === b.id);
        return (
          <AppCard key={b.id}>
            <RetroBadge title={b.title} unlocked={!!unlock} />
            <AppText tone="muted">{b.description}</AppText>
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
                  onPress={() => celebrate(b.id)}
                />
              </>
            )}
          </AppCard>
        );
      })}
      <SectionHeader title="Quatro aliados originais" />
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
