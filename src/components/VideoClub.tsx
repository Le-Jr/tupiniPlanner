import React, { useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  credit,
  quoteOfDay,
  randomQuote,
  retroQuotes,
  type QuoteKind,
  type RetroQuote,
} from "../domain/quotes";
import { useApp } from "../features/AppProvider";
import { AppText, Chip, PressableScale } from "./ui";
import { RetroTV, neon } from "./RetroTV";
import { fonts, radius } from "../theme/tokens";

const kinds: { id: QuoteKind | "all"; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "filme", label: "Filmes" },
  { id: "série", label: "Séries" },
  { id: "livro", label: "Livros" },
];

function QuoteBlock({ quote, big }: { quote: RetroQuote; big?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <AppText
        style={{
          fontFamily: fonts.bold,
          fontSize: big ? 20 : 16,
          lineHeight: big ? 27 : 22,
          color: "#FFFFFF",
        }}
      >
        “{quote.text}”
      </AppText>
      <AppText
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          lineHeight: 16,
          color: "#B9A6D8",
        }}
      >
        {quote.original}
      </AppText>
      <AppText style={{ fontSize: 12, color: neon.sun }}>
        — {credit(quote)}
      </AppText>
    </View>
  );
}

/** "Videolocadora": tape of the day on a CRT plus the full quote shelf. */
export function VideoClub() {
  const { today, haptic } = useApp();
  const [quote, setQuote] = useState(() => quoteOfDay(today));
  const [kind, setKind] = useState<QuoteKind | "all">("all");
  const [playing, setPlaying] = useState<string | null>(null);
  const shelf = retroQuotes.filter((q) => kind === "all" || q.kind === kind);
  return (
    <View style={{ gap: 14 }}>
      <LinearGradient
        colors={["#1B0738", "#3A0B4F", "#12062A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radius.lg,
          padding: 16,
          gap: 14,
          borderWidth: 1,
          borderColor: `${neon.pink}55`,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AppText
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: neon.cyan,
              letterSpacing: 2,
            }}
          >
            ▶ FITA DO DIA
          </AppText>
          <AppText
            style={{ fontFamily: fonts.mono, fontSize: 11, color: neon.pink }}
          >
            {quote.kind.toUpperCase()} · {quote.year}
          </AppText>
        </View>
        <RetroTV query={quote.gif} channel="80" height={190} />
        <QuoteBlock quote={quote} big />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Trocar fita"
          onPress={() => {
            haptic("select");
            setQuote(randomQuote(quote.id));
          }}
          style={{
            minHeight: 46,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: `${neon.cyan}88`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText
            style={{
              fontFamily: fonts.mono,
              fontSize: 12,
              color: neon.cyan,
              letterSpacing: 1,
            }}
          >
            ◀◀ TROCAR FITA
          </AppText>
        </PressableScale>
      </LinearGradient>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {kinds.map((k) => (
          <Chip
            key={k.id}
            label={k.label}
            color={neon.pink}
            selected={kind === k.id}
            onPress={() => setKind(k.id)}
          />
        ))}
      </View>
      {shelf.map((q) => (
        <PressableScale
          key={q.id}
          accessibilityRole="button"
          accessibilityLabel={`${q.text} — ${credit(q)}. Toque para ver o GIF.`}
          onPress={() => setPlaying(playing === q.id ? null : q.id)}
          style={{
            padding: 14,
            gap: 10,
            borderRadius: radius.lg,
            backgroundColor: "#140A24",
            borderWidth: 1,
            borderColor: playing === q.id ? neon.pink : "#2E2142",
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View
              style={{
                width: 4,
                borderRadius: 2,
                backgroundColor:
                  q.kind === "filme"
                    ? neon.pink
                    : q.kind === "série"
                      ? neon.cyan
                      : neon.sun,
              }}
            />
            <View style={{ flex: 1 }}>
              <QuoteBlock quote={q} />
            </View>
          </View>
          {playing === q.id && (
            <RetroTV query={q.gif} channel={q.year.slice(2, 4)} height={170} />
          )}
        </PressableScale>
      ))}
    </View>
  );
}
