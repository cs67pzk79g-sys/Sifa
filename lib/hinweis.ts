/**
 * Turns a detected SDB change plus the company specific context into a
 * structured hint.
 *
 * Deliberately rule based: the software never formulates the wording of an
 * operating instruction. It names the affected section, the affected work
 * situation and the questions to answer - the user writes the final text.
 */
import type { GefahrstoffKontext } from "@prisma/client";
import { BA_ABSCHNITTE } from "./dokument-inhalt";
import { abschnittDefinition, RELEVANZ_LABEL, type Relevanz } from "./sdb-abschnitte";

export interface KontextBezug {
  label: string;
  wert: string;
}

export interface StrukturierterHinweis {
  abschnittsNummer: number;
  abschnittsTitel: string;
  relevanz: Relevanz;
  relevanzLabel: string;
  /** Headline in the fixed form "Abschnitt X hat sich geändert …". */
  ueberschrift: string;
  /** Which parts of the operating instruction / risk assessment to re-check. */
  betroffeneDokumentAbschnitte: string[];
  /** The company facts that make this change relevant here. */
  kontextBezug: KontextBezug[];
  prueffragen: string[];
  /** True when no context has been captured yet. */
  kontextFehlt: boolean;
}

const KONTEXT_FELDER: { key: keyof GefahrstoffKontext; label: string }[] = [
  { key: "taetigkeit", label: "Tätigkeit" },
  { key: "arbeitsbereich", label: "Arbeitsbereich" },
  { key: "mengeHaeufigkeit", label: "Menge / Häufigkeit" },
  { key: "vorhandeneSchutzmassnahmen", label: "Vorhandene Schutzmaßnahmen" },
  { key: "raeumlicheGegebenheiten", label: "Räumliche Gegebenheiten" },
];

function kontextBezugBilden(kontext: GefahrstoffKontext | null): KontextBezug[] {
  if (!kontext) return [];
  return KONTEXT_FELDER.map(({ key, label }) => ({
    label,
    wert: String(kontext[key] ?? "").trim(),
  })).filter((eintrag) => eintrag.wert.length > 0);
}

function ueberschriftBilden(nummer: number, kontext: GefahrstoffKontext | null): string {
  const definition = abschnittDefinition(nummer);
  const taetigkeit = kontext?.taetigkeit?.trim();
  const bereich = kontext?.arbeitsbereich?.trim();

  const basis = `Abschnitt ${nummer} (${definition.kurz}) hat sich geändert`;

  if (taetigkeit && bereich) {
    return `${basis} – betrifft ggf. euren Einsatz bei „${taetigkeit}“ im Bereich „${bereich}“.`;
  }
  if (taetigkeit) return `${basis} – betrifft ggf. eure Tätigkeit „${taetigkeit}“.`;
  if (bereich) return `${basis} – betrifft ggf. euren Arbeitsbereich „${bereich}“.`;
  return `${basis} – betrifft ggf. euren Einsatz im Betrieb.`;
}

/**
 * Context aware extra questions. These only ever *quote* what the user entered;
 * they never invent facts about the substance.
 */
function zusaetzlichePrueffragen(
  nummer: number,
  kontext: GefahrstoffKontext | null,
): string[] {
  if (!kontext) return [];
  const fragen: string[] = [];
  const schutz = kontext.vorhandeneSchutzmassnahmen?.trim();
  const raeume = kontext.raeumlicheGegebenheiten?.trim();
  const menge = kontext.mengeHaeufigkeit?.trim();

  if (nummer === 8 && schutz) {
    fragen.push(`Reicht eure vorhandene Schutzausrüstung („${schutz}“) für die neuen Vorgaben aus?`);
  }
  if ((nummer === 7 || nummer === 8) && raeume) {
    fragen.push(`Passen die neuen Vorgaben zu euren räumlichen Gegebenheiten („${raeume}“)?`);
  }
  if ((nummer === 2 || nummer === 3 || nummer === 11) && menge) {
    fragen.push(`Ändert sich die Bewertung bei eurer Einsatzmenge („${menge}“)?`);
  }
  if (nummer === 6 && raeume) {
    fragen.push(`Ist bei „${raeume}“ eine unbeabsichtigte Freisetzung anders zu bewerten?`);
  }
  return fragen;
}

export function hinweisBilden(
  abschnittsNummer: number,
  kontext: GefahrstoffKontext | null,
): StrukturierterHinweis {
  const definition = abschnittDefinition(abschnittsNummer);
  const betroffene = definition.betrifft
    .map((key) => BA_ABSCHNITTE.find((a) => a.key === key)?.titel)
    .filter((titel): titel is string => Boolean(titel));

  return {
    abschnittsNummer,
    abschnittsTitel: definition.titel,
    relevanz: definition.relevanz,
    relevanzLabel: RELEVANZ_LABEL[definition.relevanz],
    ueberschrift: ueberschriftBilden(abschnittsNummer, kontext),
    betroffeneDokumentAbschnitte: betroffene,
    kontextBezug: kontextBezugBilden(kontext),
    prueffragen: [
      ...definition.prueffragen,
      ...zusaetzlichePrueffragen(abschnittsNummer, kontext),
    ],
    kontextFehlt: kontextBezugBilden(kontext).length === 0,
  };
}
