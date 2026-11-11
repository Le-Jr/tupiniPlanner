// Short, real, correctly attributed lines from 70s/80s pop culture.
// Rule: never invent a line and attribute it to a work. Add only verified quotes.
export type QuoteKind = "filme" | "série" | "livro";
export interface RetroQuote {
  id: string;
  /** Portuguese rendering shown first. */
  text: string;
  /** Original line, shown in small type. */
  original: string;
  who: string;
  work: string;
  year: string;
  kind: QuoteKind;
  /** GIPHY search used to illustrate this quote. */
  gif: string;
}

export const retroQuotes: RetroQuote[] = [
  {
    id: "yoda-try",
    text: "Faça. Ou não faça. Tentativa não há.",
    original: "Do. Or do not. There is no try.",
    who: "Yoda",
    work: "Star Wars: O Império Contra-Ataca",
    year: "1980",
    kind: "filme",
    gif: "yoda empire strikes back",
  },
  {
    id: "rocky-change",
    text: "Se eu posso mudar, e vocês podem mudar, todo mundo pode mudar!",
    original: "If I can change, and you can change, everybody can change!",
    who: "Rocky Balboa",
    work: "Rocky IV",
    year: "1985",
    kind: "filme",
    gif: "rocky balboa training",
  },
  {
    id: "terminator-back",
    text: "Eu voltarei.",
    original: "I'll be back.",
    who: "T-800",
    work: "O Exterminador do Futuro",
    year: "1984",
    kind: "filme",
    gif: "terminator arnold",
  },
  {
    id: "predator-bleeds",
    text: "Se sangra, nós podemos matá-lo.",
    original: "If it bleeds, we can kill it.",
    who: "Dutch",
    work: "O Predador",
    year: "1987",
    kind: "filme",
    gif: "predator arnold schwarzenegger",
  },
  {
    id: "conan-stronger",
    text: "Aquilo que não nos mata nos torna mais fortes.",
    original: "That which does not kill us makes us stronger.",
    who: "Nietzsche (epígrafe)",
    work: "Conan, o Bárbaro",
    year: "1982",
    kind: "filme",
    gif: "conan the barbarian",
  },
  {
    id: "bttf-mind",
    text: "Se você se dedicar de verdade, pode conseguir qualquer coisa.",
    original: "If you put your mind to it, you can accomplish anything.",
    who: "Marty McFly",
    work: "De Volta para o Futuro",
    year: "1985",
    kind: "filme",
    gif: "back to the future",
  },
  {
    id: "bttf-roads",
    text: "Estradas? Para onde vamos, não precisamos de estradas.",
    original: "Roads? Where we're going, we don't need roads.",
    who: "Doc Brown",
    work: "De Volta para o Futuro",
    year: "1985",
    kind: "filme",
    gif: "doc brown back to the future",
  },
  {
    id: "karate-wax",
    text: "Passa cera, tira cera.",
    original: "Wax on, wax off.",
    who: "Sr. Miyagi",
    work: "Karatê Kid",
    year: "1984",
    kind: "filme",
    gif: "karate kid wax on",
  },
  {
    id: "ferris-life",
    text: "A vida passa rápido. Se você não parar e olhar em volta de vez em quando, pode perdê-la.",
    original:
      "Life moves pretty fast. If you don't stop and look around once in a while, you could miss it.",
    who: "Ferris Bueller",
    work: "Curtindo a Vida Adoidado",
    year: "1986",
    kind: "filme",
    gif: "ferris bueller",
  },
  {
    id: "poets-carpe",
    text: "Carpe diem. Aproveitem o dia, garotos. Tornem suas vidas extraordinárias.",
    original: "Carpe diem. Seize the day, boys. Make your lives extraordinary.",
    who: "John Keating",
    work: "Sociedade dos Poetas Mortos",
    year: "1989",
    kind: "filme",
    gif: "dead poets society",
  },
  {
    id: "field-build",
    text: "Se você construir, ele virá.",
    original: "If you build it, he will come.",
    who: "A Voz",
    work: "Campo dos Sonhos",
    year: "1989",
    kind: "filme",
    gif: "field of dreams",
  },
  {
    id: "goonies-die",
    text: "Goonies nunca dizem morrer!",
    original: "Goonies never say die!",
    who: "Mikey",
    work: "Os Goonies",
    year: "1985",
    kind: "filme",
    gif: "goonies",
  },
  {
    id: "topgun-speed",
    text: "Eu sinto a necessidade… a necessidade de velocidade!",
    original: "I feel the need… the need for speed!",
    who: "Maverick e Goose",
    work: "Top Gun",
    year: "1986",
    kind: "filme",
    gif: "top gun 1986",
  },
  {
    id: "starwars-force",
    text: "Que a Força esteja com você.",
    original: "May the Force be with you.",
    who: "Han Solo",
    work: "Star Wars",
    year: "1977",
    kind: "filme",
    gif: "star wars 1977",
  },
  {
    id: "ateam-plan",
    text: "Adoro quando um plano dá certo.",
    original: "I love it when a plan comes together.",
    who: "Hannibal Smith",
    work: "Esquadrão Classe A",
    year: "1983–1987",
    kind: "série",
    gif: "a-team",
  },
  {
    id: "hulk-angry",
    text: "Não me deixe com raiva. Você não vai gostar de me ver com raiva.",
    original: "Don't make me angry. You wouldn't like me when I'm angry.",
    who: "David Banner",
    work: "O Incrível Hulk",
    year: "1977–1982",
    kind: "série",
    gif: "incredible hulk lou ferrigno",
  },
  {
    id: "hitchhiker-panic",
    text: "Não entre em pânico.",
    original: "Don't Panic.",
    who: "Douglas Adams",
    work: "O Guia do Mochileiro das Galáxias",
    year: "1979",
    kind: "livro",
    gif: "dont panic",
  },
  {
    id: "illusions-limits",
    text: "Defenda suas limitações e, com certeza, elas serão suas.",
    original: "Argue for your limitations, and sure enough, they're yours.",
    who: "Richard Bach",
    work: "Ilusões",
    year: "1977",
    kind: "livro",
    gif: "80s motivation",
  },
  {
    id: "dune-fear",
    text: "Não devo ter medo. O medo é o assassino da mente.",
    original: "I must not fear. Fear is the mind-killer.",
    who: "Frank Herbert",
    work: "Duna (livro de 1965, filme de 1984)",
    year: "1965",
    kind: "livro",
    gif: "dune 1984",
  },
];

/** GIPHY searches for the muscle-bound 80s action heroes ("brucutus"). */
export const bruteQueries = [
  "arnold schwarzenegger 80s",
  "sylvester stallone rocky",
  "rambo first blood",
  "chuck norris",
  "jean claude van damme",
  "dolph lundgren",
  "mr t a-team",
  "commando arnold",
  "rocky training montage",
  "80s action hero",
  "predator handshake",
  "terminator thumbs up",
  "80s workout",
];

const hash = (s: string) =>
  [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

/** Stable quote for a given day. */
export function quoteOfDay(date: string): RetroQuote {
  return retroQuotes[hash(date) % retroQuotes.length]!;
}

export function randomQuote(except?: string): RetroQuote {
  const pool = retroQuotes.filter((q) => q.id !== except);
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function randomBrute(): string {
  return bruteQueries[Math.floor(Math.random() * bruteQueries.length)]!;
}

export function credit(q: RetroQuote): string {
  return `${q.who} · ${q.work} (${q.year})`;
}
