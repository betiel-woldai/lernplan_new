import { Language } from '@/contexts/LanguageContext';

export interface Lerntipp {
  kategorie: string;
  thema: string;
  tipp: string;
}

const lerntippsDE: Lerntipp[] = [
  {
    kategorie: 'Konzentration',
    thema: 'Blitzblock',
    tipp: 'Wenn Du Dich öfter dabei ertappst, dass Du Dich in Tagträumereien verlierst, probier doch mal den Gedankenblitz-Block aus. Schnapp Dir dafür einen Block. Damit kannst Du all Deine Gedanken ganz einfach aus deinem Kopf "rausschreiben" um Dich ganz Deiner aktuellen Aufgabe zu widmen!'
  },
  {
    kategorie: 'Konzentration',
    thema: 'Ablenkungen',
    tipp: 'Schalte doch Dein Handy oder andere Benachrichtigungsdienste einfach mal aus während der Lernzeit. Keine Sorge, Du wirst nichts verpassen! Falls Dir das schwerfällt, kannst Du es mit Produktivitätsapps wie Freedom oder Forest probieren!'
  },
  {
    kategorie: 'Konzentration',
    thema: 'Multitasking',
    tipp: 'Du checkst gerne während der Vorlesung Deine Nachrichten und Mails, weil Du ja mit einem Ohr zuhören kannst? Surprise: Multitasking funktioniert nicht! Dein Gehirn kann sich nur auf eine, maximal zwei Aufgaben gleichzeitig konzentrieren. Was vielen wie Multitasking vorkommt ist in Wahrheit einfach nur ein schneller Wechsel zwischen verschiedenen Tätigkeiten. Das kostet Dich letztendlich mehr Zeit und Energie, außerdem ist die Fehlerwahrscheinlichkeit höher. Fazit: lass es und konzentrier Dich lieber ganz auf eine Sache!'
  },
  {
    kategorie: 'Konzentration',
    thema: 'Ausgleich',
    tipp: 'Ausgleich ist wichtig für Deine Leistungs- und Konzentrationsfähigkeit! Also denk daran Dich regelmäßig zu belohnen, jeden Tag etwas zu tun was Dir Freude bereitet und Dich genug zu bewegen.'
  },
  {
    kategorie: 'Konzentration',
    thema: 'Pomodoro',
    tipp: 'Schonmal etwas von der Pomodoro Technik gehört? Nein, das hat nichts mit Tomatensauce zu tun! Mit der Technik lernst oder arbeitest Du 25 Minuten und machst anschließend 5 Minuten Pause. Nach vier Durchläufen machst Du dann eine längere Pause von ca. 15-20 Minuten. So bleibst du länger frisch im Kopf!'
  },
  {
    kategorie: 'Produktivität',
    thema: 'Ziele',
    tipp: '"Ein Ziel ist ein Traum mit einer Frist" sagte einst der Schriftsteller Napoleon Hill und wurde mit dieser Einstellung ziemlich erfolgreich. Deshalb auch mein Tipp an Dich: nimm Dir in regelmäßigen Abständen Zeit und formuliere (am besten schriftlich) Deine Ziele. Ein Ziel könnte zum Beispiel sein im kommenden Semester bis zum Tag X (terminiert) Kurse im Gesamtumfang von 20 ECTS (messbar) zu absolvieren. Viel Spaß beim Träumen!'
  },
  {
    kategorie: 'Produktivität',
    thema: 'Priorisierung',
    tipp: 'Hast Du auch manchmal so viel zu tun, dass Du gar nicht weißt wo Du anfangen sollst? Keine Sorge, so geht es vielen Menschen und es gibt eine Lösung: Priorisierung!\n\n1. Notiere zuerst alle Aufgaben.\n2. Streiche alles Unwichtige (z.B. weil nicht relevant für Deine Ziele) und Aufgaben die Du an andere abgeben könntest.\n3. Überlege Dir welche Aufgabe am dringendsten ist, weil sie zum Beispiel an einen fixen (Prüfungs-)Termin gebunden ist.\n\nAber Achtung: nimm Dir nicht zu viel für einen Tag vor, sonst verlierst Du schnell die Lust!'
  },
  {
    kategorie: 'Produktivität',
    thema: 'Lernplan',
    tipp: 'Bei größeren Projekten wie einer Hausarbeit oder zur Vorbereitung einer Prüfung, solltest Du Dir immer einen Zeitplan erstellen. Dazu definierst Du die nötigen Teilschritte bzw. Phasen und gibst ihnen einen konkreten Termin bis zu dem der Teilschritt erledigt sein sollte. Klingt einfach oder?'
  },
  {
    kategorie: 'Produktivität',
    thema: 'Pareto',
    tipp: 'Mehr Erfolg mit weniger Aufwand? Wie das geht beschreibt das sogenannte Pareto-Prinzip, auch 80/20 Regel genannt. Demnach kannst du mit nur 20% Leistung schon 80% des Ergebnisses erreichen. Letztlich können wir daraus schlussfolgern, dass Perfektion (100%) uns sehr viel mehr Energie und Zeit kostet als eine Aufgabe einfach "nur" gut zu machen. Fazit: Konzentriere Dich auf das Wesentliche! 🤟'
  },
  {
    kategorie: 'Produktivität',
    thema: '2-Minuten-Regel',
    tipp: 'Kurz und knapp: jede Tätigkeit die weniger als zwei Minuten dauert solltest Du sofort erledigen, anstatt sie zuerst auf eine Liste oder anderswo zu notieren! Wenn Du nicht weißt wie lange etwas dauern wird, versuche es in drei Minuten zu schaffen. Falls es nicht klappt, kannst Du Dir immer noch eine Notiz machen und Dich später darum kümmern.'
  },
  {
    kategorie: 'Produktivität',
    thema: 'Frosch',
    tipp: 'Iss doch mal einen Frosch zum Frühstück! Das schleimige Wesen steht metaphorisch für all jene Aufgaben, die Du ganz gerne aufschiebst oder wenn nicht überlebensnotwendig, am liebsten nie erledigen würdest. Überwinde Dich und mache zumindest einen Teil dieser Aufgaben heute als allererstes! Danach kannst Du Dich dann auf weniger eklige Themen freuen.'
  },
  {
    kategorie: 'Produktivität',
    thema: 'Zeittracking',
    tipp: 'Dir fällt es schwer eine Zeitplanung zum Beispiel für eine Klausur oder Hausarbeit zu erstellen? Erstelle Dir doch mal ein Zeitprotokoll. Darin trägst Du für verschiedene Tätigkeiten ein wie lange du gebraucht hast. Klingt trocken und langweilig? Ist es auch! Aber es wird Dir helfen den Zeitaufwand zukünftig besser einschätzen zu können, versprochen!'
  },
  {
    kategorie: 'Lerninhalte merken',
    thema: 'Recalling',
    tipp: 'Du liest einen Text durch und kannst Dich danach an nichts mehr erinnern? Dann solltest Du beim Lernen das sogenannte Active Recalling ausprobieren. Dabei schließt du für einen Moment Deine Unterlagen und gibst das Gelesene nur aus der Erinnerung, also "aktiv", wieder. Im Gegensatz zu reinem Durchlesen und Hervorheben von Texten, verknüpfen sich Gehirnzellen dadurch besser und Informationen bleiben länger abrufbar. 🤓'
  },
  {
    kategorie: 'Lerninhalte merken',
    thema: 'Primacy-Recency',
    tipp: 'Bei der Zusammenstellung Deiner Notizen oder in Zusammenfassungen solltest du darauf achten die wichtigsten Lerninhalte an Anfang und Schluss zu stellen. Die dort positionierten Informationen kann Dein Gedächtnis (meistens) besser behalten.'
  },
  {
    kategorie: 'Lerninhalte merken',
    thema: 'Loci',
    tipp: 'Mit der sogenannten Loci Methode (aus dem Lateinischen für "Orte") kannst Du Dir vor allem Reihenfolgen besser merken. Du stellst Dir einfach eine bekannte Route (z.B. von der letzten Kneipentour) vor und verknüpfst jedes Element der Reihenfolge mit einer Station auf dem Weg. Beispielsweise ist Deine Lieblingskneipe dann das erste Element des Periodensystems. Smart, oder?'
  },
  {
    kategorie: 'Lerninhalte merken',
    thema: 'Chunking',
    tipp: 'PCAIDSVWNATOIBM - Na, kannst Du Dir die Abfolge der Buchstaben aus dem Gedächtnis merken? Wahrscheinlich nicht. Probier es mal mit den folgenden Elementen: PC AIDS VW NATO IBM. Schon besser, oder? Diese Methode bei der Informationen in Teile zerlegt werden nennt sich Chunking. Unser Kurzzeitgedächtnis behält sinnvolle Informationen besser als Sinnlose. Wenn du die einzelnen Teile dann auch noch mit Bildern assoziierst bist Du schon ein richtiger Profi!'
  },
  {
    kategorie: 'Lerninhalte merken',
    thema: 'Eselsbrücken',
    tipp: 'Von Eselsbrücken hast Du bestimmt schon öfter gehört. Vielleicht wendest Du die Merkhilfe über Besonderheiten bzw. Gemeinsamkeiten auch schon regelmäßig beim Lernen an. Hier nochmal ein schönes Beispiel zur Zeitumstellung: Im Frühjahr werden die Terrassenstühle vor das Haus gestellt - genau wie die Uhr vorgestellt wird. Im Herbst packt man sie dann zurück in den Schuppen, und die Uhr wird zurückgestellt. Yeah!'
  },
  {
    kategorie: 'Lerninhalte merken',
    thema: 'Erklären',
    tipp: 'Hast du schonmal einem kleinen Kind etwas erklärt? Vielleicht ist Dir dabei aufgefallen, dass es gar nicht so einfach ist komplizierte Sachverhalte ohne Fachbegriffe und in wenigen Worten zusammenzufassen. Es ist aber auch eine super Methode um zu prüfen ob Du etwas wirklich verstanden hast und es Dir dadurch auch besser zu merken!'
  }
];

const lerntippsEN: Lerntipp[] = [
  {
    kategorie: 'Concentration',
    thema: 'Thought Block',
    tipp: "If you often catch yourself drifting into daydreams, try the thought-flash block. Grab a notepad for this. With it, you can simply \"write out\" all your thoughts from your head to fully focus on your current task!"
  },
  {
    kategorie: 'Concentration',
    thema: 'Distractions',
    tipp: "Turn off your phone or other notification services during study time. Don't worry, you won't miss anything! If that's hard for you, try productivity apps like Freedom or Forest!"
  },
  {
    kategorie: 'Concentration',
    thema: 'Multitasking',
    tipp: "Do you like checking your messages and emails during lectures because you can listen with one ear? Surprise: Multitasking doesn't work! Your brain can only focus on one, at most two tasks at once. What many perceive as multitasking is actually just rapid switching between different activities. This ultimately costs you more time and energy, and the probability of errors is higher. Bottom line: don't do it and focus on one thing instead!"
  },
  {
    kategorie: 'Concentration',
    thema: 'Balance',
    tipp: 'Balance is important for your performance and concentration! So remember to reward yourself regularly, do something every day that brings you joy, and get enough exercise.'
  },
  {
    kategorie: 'Concentration',
    thema: 'Pomodoro',
    tipp: "Ever heard of the Pomodoro Technique? No, it has nothing to do with tomato sauce! With this technique, you study or work for 25 minutes and then take a 5-minute break. After four rounds, you take a longer break of about 15-20 minutes. This keeps your mind fresh longer!"
  },
  {
    kategorie: 'Productivity',
    thema: 'Goals',
    tipp: '"A goal is a dream with a deadline" said writer Napoleon Hill, and he became quite successful with this attitude. So here\'s my tip for you: take time regularly and formulate (preferably in writing) your goals. A goal could be, for example, to complete courses totaling 20 ECTS by day X (scheduled) in the coming semester (measurable). Have fun dreaming!'
  },
  {
    kategorie: 'Productivity',
    thema: 'Prioritization',
    tipp: "Do you sometimes have so much to do that you don't know where to start? Don't worry, many people feel this way and there's a solution: Prioritization!\n\n1. First, write down all tasks.\n2. Cross out everything unimportant (e.g., not relevant to your goals) and tasks you could delegate to others.\n3. Consider which task is most urgent because it's tied to a fixed (exam) deadline.\n\nBut be careful: don't plan too much for one day, or you'll quickly lose motivation!"
  },
  {
    kategorie: 'Productivity',
    thema: 'Study Plan',
    tipp: "For larger projects like a term paper or exam preparation, you should always create a schedule. To do this, define the necessary sub-steps or phases and give them a specific deadline by which the sub-step should be completed. Sounds simple, right?"
  },
  {
    kategorie: 'Productivity',
    thema: 'Pareto',
    tipp: 'More success with less effort? The so-called Pareto Principle, also known as the 80/20 rule, describes how this works. According to it, you can achieve 80% of the result with only 20% effort. Ultimately, we can conclude that perfection (100%) costs us much more energy and time than simply doing a task "just" well. Bottom line: Focus on what matters! 🤟'
  },
  {
    kategorie: 'Productivity',
    thema: '2-Minute-Rule',
    tipp: "Short and sweet: any task that takes less than two minutes should be done immediately, rather than writing it on a list first! If you don't know how long something will take, try to do it in three minutes. If it doesn't work out, you can still make a note and take care of it later."
  },
  {
    kategorie: 'Productivity',
    thema: 'Eat the Frog',
    tipp: "Try eating a frog for breakfast! The slimy creature metaphorically represents all those tasks you like to postpone or, if not essential for survival, would prefer never to do. Push yourself and do at least some of these tasks first thing today! Afterward, you can look forward to less unpleasant topics."
  },
  {
    kategorie: 'Productivity',
    thema: 'Time Tracking',
    tipp: "Do you find it hard to create a schedule for an exam or term paper? Try creating a time log. In it, you record how long you took for various activities. Sounds dry and boring? It is! But it will help you estimate time requirements better in the future, I promise!"
  },
  {
    kategorie: 'Memorization',
    thema: 'Recalling',
    tipp: "Do you read through a text and can't remember anything afterward? Then you should try Active Recalling while studying. You close your materials for a moment and reproduce what you read only from memory, i.e., \"actively.\" Unlike just reading through and highlighting texts, this helps brain cells connect better and information stays retrievable longer. 🤓"
  },
  {
    kategorie: 'Memorization',
    thema: 'Primacy-Recency',
    tipp: 'When compiling your notes or summaries, make sure to place the most important learning content at the beginning and end. Your memory can (usually) retain information positioned there better.'
  },
  {
    kategorie: 'Memorization',
    thema: 'Loci Method',
    tipp: 'With the so-called Loci Method (from the Latin for "places") you can remember sequences better. You simply imagine a familiar route (e.g., from your last pub crawl) and link each element of the sequence with a station along the way. For example, your favorite pub is then the first element of the periodic table. Smart, right?'
  },
  {
    kategorie: 'Memorization',
    thema: 'Chunking',
    tipp: "PCAIDSVWNATOIBM - Can you remember this sequence of letters from memory? Probably not. Try it with the following elements: PC AIDS VW NATO IBM. Better, right? This method of breaking information into parts is called Chunking. Our short-term memory retains meaningful information better than meaningless. If you also associate the individual parts with images, you're already a real pro!"
  },
  {
    kategorie: 'Memorization',
    thema: 'Mnemonics',
    tipp: "You've probably heard of mnemonics before. Maybe you already use these memory aids based on peculiarities or similarities regularly when studying. Here's another nice example for daylight saving time: In spring, the terrace chairs are put in front of the house - just like the clock is set forward. In autumn, they're put back in the shed, and the clock is set back. Yeah!"
  },
  {
    kategorie: 'Memorization',
    thema: 'Explaining',
    tipp: "Have you ever explained something to a small child? Maybe you noticed that it's not easy to summarize complicated matters without technical terms and in few words. But it's also a great method to check if you really understood something and to remember it better!"
  }
];

const lerntipps: Record<Language, Lerntipp[]> = {
  de: lerntippsDE,
  en: lerntippsEN
};

/**
 * Get the tip of the day based on the current date.
 * Uses calendar-based cycling - same tip for all users on a given day.
 */
export function getTipOfTheDay(language: Language): Lerntipp {
  const tips = lerntipps[language];
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const tipIndex = dayOfYear % tips.length;
  return tips[tipIndex];
}

/**
 * Get all tips for a specific language.
 */
export function getAllTips(language: Language): Lerntipp[] {
  return lerntipps[language];
}

/**
 * Get the total number of tips available.
 */
export function getTotalTipsCount(): number {
  return lerntippsDE.length;
}
