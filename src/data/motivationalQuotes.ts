import { Language } from '@/contexts/LanguageContext';

export interface MotivationalQuote {
  kategorie: string;
  quote: string;
}

const quotesDE: MotivationalQuote[] = [
  {
    kategorie: 'Anfang',
    quote: 'Motivation ist das, was dich starten lässt. Gewohnheit ist das, was dich weitermachen lässt.'
  },
  {
    kategorie: 'Anfang',
    quote: 'Du musst nicht großartig sein, um anzufangen. Aber du musst anfangen, um großartig zu werden.'
  },
  {
    kategorie: 'Anfang',
    quote: 'Eine geschriebene Seite ist besser als zehn gedachte. Fang einfach an.'
  },
  {
    kategorie: 'Anfang',
    quote: 'Mach es heute, damit du dir morgen danken kannst.'
  },
  {
    kategorie: 'Anfang',
    quote: 'Das Geheimnis des Vorwärtskommens besteht darin, den ersten Schritt zu tun.'
  },
  {
    kategorie: 'Ausdauer',
    quote: 'Erfolg hat drei Buchstaben: TUN.'
  },
  {
    kategorie: 'Ausdauer',
    quote: 'Es spielt keine Rolle, wie langsam du gehst, solange du nicht stehen bleibst.'
  },
  {
    kategorie: 'Ausdauer',
    quote: 'Diamanten entstehen unter Druck. Du bereitest dich gerade auf deinen Glanzmoment vor.'
  },
  {
    kategorie: 'Mindset',
    quote: 'Zweifel töten mehr Träume als Versagen es je könnte. Trau dich!'
  },
  {
    kategorie: 'Mindset',
    quote: 'Sei stärker als deine stärkste Ausrede.'
  },
  {
    kategorie: 'Anti-Stress',
    quote: 'Schau nicht auf den ganzen Berg, schau nur auf den Weg vor deinen Füßen.'
  },
  {
    kategorie: 'Anti-Stress',
    quote: 'Kopf hoch, Brust raus. Angst ist nur ein Gefühl, keine Tatsache.'
  },
  {
    kategorie: 'Endspurt',
    quote: 'Jetzt Zähne zusammenbeißen, später feiern. Die Ziellinie ist in Sicht!'
  },
  {
    kategorie: 'Selbstvertrauen',
    quote: 'Du kannst mehr, als du denkst. Vertrau auf dich.'
  },
  {
    kategorie: 'Selbstvertrauen',
    quote: 'Du hast schon ganz andere Dinge geschafft. Diese Klausur packst du auch.'
  },
  {
    kategorie: 'Prüfungstipps',
    quote: 'Wiederholung ist die Mutter des Erfolgs. Geh die Basics noch einmal durch.'
  },
  {
    kategorie: 'Prüfungstipps',
    quote: 'Wasser trinken nicht vergessen. Ein hydriertes Gehirn denkt schneller.'
  }
];

const quotesEN: MotivationalQuote[] = [
  {
    kategorie: 'Getting Started',
    quote: 'Motivation is what gets you started. Habit is what keeps you going.'
  },
  {
    kategorie: 'Getting Started',
    quote: "You don't have to be great to start. But you have to start to be great."
  },
  {
    kategorie: 'Getting Started',
    quote: 'One written page is better than ten imagined ones. Just start.'
  },
  {
    kategorie: 'Getting Started',
    quote: 'Do it today so you can thank yourself tomorrow.'
  },
  {
    kategorie: 'Getting Started',
    quote: 'The secret of getting ahead is getting started.'
  },
  {
    kategorie: 'Perseverance',
    quote: 'Success has three letters: D-O.'
  },
  {
    kategorie: 'Perseverance',
    quote: "It doesn't matter how slowly you go, as long as you don't stop."
  },
  {
    kategorie: 'Perseverance',
    quote: "Diamonds are made under pressure. You're preparing for your shining moment."
  },
  {
    kategorie: 'Mindset',
    quote: 'Doubt kills more dreams than failure ever could. Dare to try!'
  },
  {
    kategorie: 'Mindset',
    quote: 'Be stronger than your strongest excuse.'
  },
  {
    kategorie: 'Anti-Stress',
    quote: "Don't look at the whole mountain, just look at the path in front of your feet."
  },
  {
    kategorie: 'Anti-Stress',
    quote: 'Head up, chest out. Fear is just a feeling, not a fact.'
  },
  {
    kategorie: 'Final Sprint',
    quote: 'Grit your teeth now, celebrate later. The finish line is in sight!'
  },
  {
    kategorie: 'Self-Confidence',
    quote: 'You can do more than you think. Trust yourself.'
  },
  {
    kategorie: 'Self-Confidence',
    quote: "You've already accomplished so many things. You'll ace this exam too."
  },
  {
    kategorie: 'Exam Tips',
    quote: 'Repetition is the mother of success. Go through the basics one more time.'
  },
  {
    kategorie: 'Exam Tips',
    quote: "Don't forget to drink water. A hydrated brain thinks faster."
  }
];

const quotes: Record<Language, MotivationalQuote[]> = {
  de: quotesDE,
  en: quotesEN
};

/**
 * Get the quote of the day based on the current date.
 * Uses calendar-based cycling - same quote for all users on a given day.
 */
export function getQuoteOfTheDay(language: Language): MotivationalQuote {
  const quoteList = quotes[language];
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const quoteIndex = dayOfYear % quoteList.length;
  return quoteList[quoteIndex];
}

/**
 * Get all quotes for a specific language.
 */
export function getAllQuotes(language: Language): MotivationalQuote[] {
  return quotes[language];
}

/**
 * Get the total number of quotes available.
 */
export function getTotalQuotesCount(): number {
  return quotesDE.length;
}
