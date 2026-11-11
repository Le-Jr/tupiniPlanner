import React, { useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  credit,
  quoteOfDay,
  randomQuote,
  retroQuotes,
  type RetroQuote,
} from "../domain/quotes";
import { useApp } from "../features/AppProvider";
import { AppText, PressableScale } from "./ui";
import { RetroTV, neon } from "./RetroTV";
import { fonts, radius } from "../theme/tokens";

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

/** "Videolocadora": one tape at a time; TROCAR FITA draws another at random. */
export function VideoClub() {
  const { today, haptic } = useApp();
  const [quote, setQuote] = useState(() => quoteOfDay(today));
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
            {quote.id === quoteOfDay(today).id
              ? "▶ FITA DO DIA"
              : `▶ FITA ${String(retroQuotes.indexOf(quote) + 1).padStart(2, "0")}/${retroQuotes.length}`}
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
    </View>
  );
}
