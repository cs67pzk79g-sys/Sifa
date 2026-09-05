/**
 * The 16 mandatory sections of a safety data sheet (REACH Art. 31, Annex II).
 *
 * Every section carries the information the rest of the app needs to turn a
 * plain text change into a statement a non-expert can act on:
 * - which parts of the operating instruction it typically affects,
 * - how safety critical it is (drives the dashboard traffic light),
 * - which questions the user should ask themselves.
 */

export type Relevanz = "HOCH" | "MITTEL" | "GERING";

/** Sections of the operating instruction as required by TRGS 555. */
export type BaAbschnittKey =
  | "anwendungsbereich"
  | "gefahren"
  | "schutzmassnahmen"
  | "verhaltenImGefahrfall"
  | "ersteHilfe"
  | "entsorgung";

export interface SdbAbschnittDefinition {
  nummer: number;
  titel: string;
  kurz: string;
  relevanz: Relevanz;
  /** Parts of the operating instruction / risk assessment to re-check. */
  betrifft: BaAbschnittKey[];
  /** Checklist questions, shown verbatim - no generated prose. */
  prueffragen: string[];
}

export const SDB_ABSCHNITTE: SdbAbschnittDefinition[] = [
  {
    nummer: 1,
    titel: "Bezeichnung des Stoffs bzw. des Gemischs und des Unternehmens",
    kurz: "Bezeichnung & Hersteller",
    relevanz: "GERING",
    betrifft: ["anwendungsbereich"],
    prueffragen: [
      "Hat sich der Produktname oder die Rezepturbezeichnung geändert?",
      "Stimmen Hersteller und Notfallnummer in der Betriebsanweisung noch?",
    ],
  },
  {
    nummer: 2,
    titel: "Mögliche Gefahren",
    kurz: "Einstufung & Kennzeichnung",
    relevanz: "HOCH",
    betrifft: ["gefahren", "schutzmassnahmen"],
    prueffragen: [
      "Haben sich H-Sätze, P-Sätze oder Gefahrenpiktogramme geändert?",
      "Muss die Kennzeichnung auf Standgefäßen und in der Betriebsanweisung angepasst werden?",
      "Ändert sich dadurch die Einstufung der Gefährdung in der Gefährdungsbeurteilung?",
    ],
  },
  {
    nummer: 3,
    titel: "Zusammensetzung / Angaben zu Bestandteilen",
    kurz: "Inhaltsstoffe",
    relevanz: "HOCH",
    betrifft: ["gefahren", "anwendungsbereich"],
    prueffragen: [
      "Sind neue gefährliche Bestandteile hinzugekommen oder Anteile gestiegen?",
      "Gibt es dadurch neue Anforderungen an Substitutionsprüfung oder Schutzmaßnahmen?",
    ],
  },
  {
    nummer: 4,
    titel: "Erste-Hilfe-Maßnahmen",
    kurz: "Erste Hilfe",
    relevanz: "HOCH",
    betrifft: ["ersteHilfe"],
    prueffragen: [
      "Weichen die neuen Erste-Hilfe-Hinweise von der Betriebsanweisung ab?",
      "Müssen Ersthelfer oder Aushänge im Arbeitsbereich informiert werden?",
    ],
  },
  {
    nummer: 5,
    titel: "Maßnahmen zur Brandbekämpfung",
    kurz: "Brandbekämpfung",
    relevanz: "HOCH",
    betrifft: ["verhaltenImGefahrfall"],
    prueffragen: [
      "Sind andere Löschmittel vorgeschrieben als bisher hinterlegt?",
      "Passen die vorhandenen Feuerlöscher im Arbeitsbereich noch dazu?",
    ],
  },
  {
    nummer: 6,
    titel: "Maßnahmen bei unbeabsichtigter Freisetzung",
    kurz: "Freisetzung",
    relevanz: "HOCH",
    betrifft: ["verhaltenImGefahrfall", "schutzmassnahmen"],
    prueffragen: [
      "Ändert sich das Vorgehen bei Verschütten oder Leckage?",
      "Ist geeignetes Bindemittel im Arbeitsbereich vorhanden?",
    ],
  },
  {
    nummer: 7,
    titel: "Handhabung und Lagerung",
    kurz: "Handhabung & Lagerung",
    relevanz: "HOCH",
    betrifft: ["schutzmassnahmen", "anwendungsbereich"],
    prueffragen: [
      "Gelten neue Vorgaben zu Lagerbedingungen, Lagerklassen oder Zusammenlagerung?",
      "Sind die Lagerbedingungen in eurem Arbeitsbereich noch zulässig?",
      "Ändert sich etwas an Belüftung oder zulässiger Gebindegröße?",
    ],
  },
  {
    nummer: 8,
    titel: "Begrenzung und Überwachung der Exposition / Persönliche Schutzausrüstung",
    kurz: "Grenzwerte & PSA",
    relevanz: "HOCH",
    betrifft: ["schutzmassnahmen"],
    prueffragen: [
      "Haben sich Arbeitsplatzgrenzwerte (AGW) oder biologische Grenzwerte geändert?",
      "Wird eine andere persönliche Schutzausrüstung gefordert (Handschuhmaterial, Durchbruchzeit, Atemschutzfilter)?",
      "Deckt die im Betrieb vorhandene Schutzausrüstung die neuen Vorgaben ab?",
    ],
  },
  {
    nummer: 9,
    titel: "Physikalische und chemische Eigenschaften",
    kurz: "Physik & Chemie",
    relevanz: "MITTEL",
    betrifft: ["gefahren", "schutzmassnahmen"],
    prueffragen: [
      "Hat sich der Flammpunkt oder ein anderer sicherheitsrelevanter Kennwert geändert?",
      "Ergibt sich daraus eine andere Bewertung der Brand- oder Explosionsgefahr?",
    ],
  },
  {
    nummer: 10,
    titel: "Stabilität und Reaktivität",
    kurz: "Stabilität",
    relevanz: "MITTEL",
    betrifft: ["schutzmassnahmen", "verhaltenImGefahrfall"],
    prueffragen: [
      "Sind neue unverträgliche Stoffe genannt, die bei euch in der Nähe gelagert werden?",
      "Ändern sich zu vermeidende Bedingungen (Temperatur, Feuchtigkeit)?",
    ],
  },
  {
    nummer: 11,
    titel: "Toxikologische Angaben",
    kurz: "Toxikologie",
    relevanz: "MITTEL",
    betrifft: ["gefahren"],
    prueffragen: [
      "Werden neue Gesundheitsgefahren beschrieben (z. B. Sensibilisierung)?",
      "Muss die arbeitsmedizinische Vorsorge neu bewertet werden?",
    ],
  },
  {
    nummer: 12,
    titel: "Umweltbezogene Angaben",
    kurz: "Umwelt",
    relevanz: "MITTEL",
    betrifft: ["gefahren", "entsorgung"],
    prueffragen: [
      "Ändert sich die Wassergefährdungsklasse oder die Umwelteinstufung?",
      "Sind zusätzliche Maßnahmen gegen Eintrag in die Kanalisation nötig?",
    ],
  },
  {
    nummer: 13,
    titel: "Hinweise zur Entsorgung",
    kurz: "Entsorgung",
    relevanz: "MITTEL",
    betrifft: ["entsorgung"],
    prueffragen: [
      "Gilt ein anderer Abfallschlüssel oder ein anderer Entsorgungsweg?",
      "Sind die Sammelbehälter im Betrieb entsprechend gekennzeichnet?",
    ],
  },
  {
    nummer: 14,
    titel: "Angaben zum Transport",
    kurz: "Transport",
    relevanz: "GERING",
    betrifft: [],
    prueffragen: [
      "Wird der Stoff im Betrieb selbst transportiert (z. B. Werkverkehr)?",
      "Falls ja: Ändert sich die Transporteinstufung (UN-Nummer, Verpackungsgruppe)?",
    ],
  },
  {
    nummer: 15,
    titel: "Rechtsvorschriften",
    kurz: "Rechtsvorschriften",
    relevanz: "GERING",
    betrifft: ["schutzmassnahmen"],
    prueffragen: [
      "Gelten neue Beschäftigungsbeschränkungen (z. B. für Jugendliche oder Schwangere)?",
      "Ist der Stoff neu in einer Verbots- oder Zulassungsliste erfasst?",
    ],
  },
  {
    nummer: 16,
    titel: "Sonstige Angaben",
    kurz: "Sonstiges",
    relevanz: "GERING",
    betrifft: [],
    prueffragen: [
      "Wird im Änderungshinweis des Herstellers eine wesentliche Überarbeitung genannt?",
      "Ist der Volltext neuer H-Sätze hier aufgeführt?",
    ],
  },
];

const NACH_NUMMER = new Map(SDB_ABSCHNITTE.map((a) => [a.nummer, a]));

export function abschnittDefinition(nummer: number): SdbAbschnittDefinition {
  const definition = NACH_NUMMER.get(nummer);
  if (definition) return definition;
  return {
    nummer,
    titel: `Abschnitt ${nummer}`,
    kurz: `Abschnitt ${nummer}`,
    relevanz: "GERING",
    betrifft: [],
    prueffragen: [],
  };
}

export const RELEVANZ_LABEL: Record<Relevanz, string> = {
  HOCH: "Sicherheitsrelevant",
  MITTEL: "Prüfenswert",
  GERING: "Formal",
};
