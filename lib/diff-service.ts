/**
 * Section wise comparison of two safety data sheet versions.
 *
 * The comparison is purely mechanical: word level diff per section, no
 * interpretation of the content. Interpretation happens in lib/hinweis.ts and
 * always stays a suggestion the user has to confirm.
 */
import { diffWordsWithSpace } from "diff";
import { abschnitteLesen } from "./sdb-parser";

export type DiffArt = "gleich" | "entfernt" | "neu";

export interface DiffTeil {
  art: DiffArt;
  text: string;
}

export interface AbschnittsVergleich {
  nummer: number;
  geaendert: boolean;
  teile: DiffTeil[];
  /** Rough size of the change, used to sort and to skip noise. */
  entfernteZeichen: number;
  neueZeichen: number;
}

/**
 * Whitespace and hyphenation differences are artefacts of PDF extraction, not
 * real content changes, so they are normalised away before comparing.
 */
function vergleichsText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

export function abschnittVergleichen(alt: string, neu: string, nummer: number): AbschnittsVergleich {
  const altNorm = vergleichsText(alt);
  const neuNorm = vergleichsText(neu);

  if (altNorm === neuNorm) {
    return { nummer, geaendert: false, teile: [], entfernteZeichen: 0, neueZeichen: 0 };
  }

  const teile: DiffTeil[] = diffWordsWithSpace(altNorm, neuNorm).map((teil) => ({
    art: teil.added ? "neu" : teil.removed ? "entfernt" : "gleich",
    text: teil.value,
  }));

  const entfernteZeichen = teile
    .filter((t) => t.art === "entfernt")
    .reduce((summe, t) => summe + t.text.trim().length, 0);
  const neueZeichen = teile
    .filter((t) => t.art === "neu")
    .reduce((summe, t) => summe + t.text.trim().length, 0);

  // Pure whitespace jitter can survive normalisation in rare cases.
  const geaendert = entfernteZeichen > 0 || neueZeichen > 0;

  return { nummer, geaendert, teile, entfernteZeichen, neueZeichen };
}

/** Compares all 16 sections of two SDB versions. */
export function sdbVergleichen(
  alteAbschnitteJson: string,
  neueAbschnitteJson: string,
): AbschnittsVergleich[] {
  const alt = abschnitteLesen(alteAbschnitteJson);
  const neu = abschnitteLesen(neueAbschnitteJson);
  const ergebnis: AbschnittsVergleich[] = [];

  for (let nummer = 1; nummer <= 16; nummer++) {
    const schluessel = String(nummer);
    ergebnis.push(abschnittVergleichen(alt[schluessel] ?? "", neu[schluessel] ?? "", nummer));
  }

  return ergebnis;
}

export function diffTeileLesen(json: string): DiffTeil[] {
  try {
    const geparst = JSON.parse(json);
    if (Array.isArray(geparst)) return geparst as DiffTeil[];
  } catch {
    // fall through
  }
  return [];
}

/** Shortens a diff for list previews without cutting words in half. */
export function diffZusammenfassen(teile: DiffTeil[], maxZeichen = 220): string {
  const relevant = teile.filter((t) => t.art !== "gleich" && t.text.trim().length > 0);
  const text = relevant
    .map((t) => (t.art === "neu" ? `+ ${t.text.trim()}` : `- ${t.text.trim()}`))
    .join("  ");
  if (text.length <= maxZeichen) return text;
  return `${text.slice(0, maxZeichen).replace(/\s\S*$/, "")} …`;
}
