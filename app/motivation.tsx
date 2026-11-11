import React, { useState } from "react";
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
import {
  Character,
  characterNames,
  characterRoles,
} from "../src/components/Character";
import { VideoClub } from "../src/components/VideoClub";
import { RetroTV } from "../src/components/RetroTV";
import { randomBrute, retroQuotes } from "../src/domain/quotes";
import { useApp } from "../src/features/AppProvider";
import { badgeDefinitions, totalXP } from "../src/domain/planner";
export default function Motivation() {
  const { state, celebrate, animate } = useApp();
  const [brute, setBrute] = useState(() => randomBrute());
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
      <SectionHeader
        eyebrow="VIDEOLOCADORA 70s · 80s"
        title={`${retroQuotes.length} fitas de filmes, séries e livros`}
      />
      <VideoClub />
      <SectionHeader
        eyebrow="SALA DOS BRUCUTUS"
        title="Dose de ação dos anos 80"
      />
      <RetroTV
        query={brute}
        channel="86"
        height={220}
        onShuffle={() => setBrute(randomBrute())}
      />
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
      <SectionHeader eyebrow="ELENCO" title="Quatro brucutus originais" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {characterNames.map((name, i) => {
          const accent = ["#00FF6A", "#FFB347", "#7FD4FF", "#FF3EA5"][i]!;
          return (
            <View
              key={name}
              style={{
                flexGrow: 1,
                flexBasis: 150,
                alignItems: "center",
                gap: 8,
                paddingVertical: 18,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: "#140A24",
                borderWidth: 1,
                borderColor: `${accent}55`,
              }}
            >
              <Character
                index={i}
                size={130}
                animated={animate}
                variant={i % 2}
              />
              <AppText variant="micro" style={{ color: accent }}>
                {`P${i + 1} // ${["CAMPEÃO", "COMANDO", "VETERANO", "RIVAL"][i]}`}
              </AppText>
              <AppText variant="heading" style={{ textAlign: "center" }}>
                {name}
              </AppText>
              <AppText
                variant="small"
                tone="subtle"
                style={{ textAlign: "center" }}
              >
                {characterRoles[i]}
              </AppText>
              <AppText
                variant="small"
                tone="muted"
                style={{ textAlign: "center", fontStyle: "italic" }}
              >
                “
                {
                  [
                    "Cada pequeno passo merece ser visto.",
                    "Ajuste a rota. A campanha continua.",
                    "Descansar também é parte do plano.",
                    "Precisão primeiro. Velocidade depois.",
                  ][i]
                }
                ”
              </AppText>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
