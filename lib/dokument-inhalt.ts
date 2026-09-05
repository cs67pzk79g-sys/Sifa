/**
 * Structure of an operating instruction according to TRGS 555. The same six
 * blocks are used for the risk assessment so that a change hint can point at
 * exactly one block in either document type.
 */
import type { BaAbschnittKey } from "./sdb-abschnitte";

export interface DokumentInhalt {
  anwendungsbereich: string;
  gefahren: string;
  schutzmassnahmen: string;
  verhaltenImGefahrfall: string;
  ersteHilfe: string;
  entsorgung: string;
}

export const BA_ABSCHNITTE: { key: BaAbschnittKey; titel: string; hilfe: string }[] = [
  {
    key: "anwendungsbereich",
    titel: "Anwendungsbereich",
    hilfe: "Welcher Stoff, welche Tätigkeit, welcher Arbeitsbereich?",
  },
  {
    key: "gefahren",
    titel: "Gefahren für Mensch und Umwelt",
    hilfe: "Einstufung, H-Sätze, Gesundheits- und Umweltgefahren.",
  },
  {
    key: "schutzmassnahmen",
    titel: "Schutzmaßnahmen und Verhaltensregeln",
    hilfe: "Technisch, organisatorisch, persönlich (PSA) - in dieser Reihenfolge.",
  },
  {
    key: "verhaltenImGefahrfall",
    titel: "Verhalten im Gefahrfall",
    hilfe: "Brand, Verschütten, Leckage, Notrufnummern.",
  },
  {
    key: "ersteHilfe",
    titel: "Erste Hilfe",
    hilfe: "Nach Einatmen, Hautkontakt, Augenkontakt, Verschlucken.",
  },
  {
    key: "entsorgung",
    titel: "Sachgerechte Entsorgung",
    hilfe: "Abfallbehälter, Abfallschlüssel, Entsorgungsweg.",
  },
];

export const LEERER_INHALT: DokumentInhalt = {
  anwendungsbereich: "",
  gefahren: "",
  schutzmassnahmen: "",
  verhaltenImGefahrfall: "",
  ersteHilfe: "",
  entsorgung: "",
};

export function inhaltLesen(json: string | null | undefined): DokumentInhalt {
  if (!json) return { ...LEERER_INHALT };
  try {
    const geparst = JSON.parse(json) as Partial<DokumentInhalt>;
    return { ...LEERER_INHALT, ...geparst };
  } catch {
    return { ...LEERER_INHALT };
  }
}

export function inhaltSchreiben(inhalt: DokumentInhalt): string {
  return JSON.stringify(inhalt);
}

export function inhaltIstLeer(inhalt: DokumentInhalt): boolean {
  return Object.values(inhalt).every((wert) => wert.trim() === "");
}

export const DOKUMENT_TYP_LABEL: Record<string, string> = {
  BETRIEBSANWEISUNG: "Betriebsanweisung",
  GEFAEHRDUNGSBEURTEILUNG: "Gefährdungsbeurteilung",
};
