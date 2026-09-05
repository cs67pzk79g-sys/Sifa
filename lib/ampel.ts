/**
 * Traffic light logic for the dashboard.
 *
 * ROT   - open change suggestion in a safety critical SDB section, or no
 *         published operating instruction at all.
 * GELB  - other open suggestions, or unpublished changes in a document.
 * GRUEN - everything checked and published.
 */
import { abschnittDefinition } from "./sdb-abschnitte";
import { offeneVorschlaege, plural } from "./text";

export type AmpelFarbe = "ROT" | "GELB" | "GRUEN";

export interface AmpelEingabe {
  offeneAbschnitte: number[];
  hatVeroeffentlichtesDokument: boolean;
  hatUnveroeffentlichteAenderung: boolean;
}

export interface AmpelErgebnis {
  farbe: AmpelFarbe;
  begruendung: string;
}

export function ampelBerechnen(eingabe: AmpelEingabe): AmpelErgebnis {
  const kritische = eingabe.offeneAbschnitte.filter(
    (nummer) => abschnittDefinition(nummer).relevanz === "HOCH",
  );
  const anzahlOffen = eingabe.offeneAbschnitte.length;

  if (kritische.length > 0) {
    const abschnitte = kritische.map((n) => `Abschnitt ${n}`).join(", ");
    const rest = anzahlOffen - kritische.length;
    return {
      farbe: "ROT",
      begruendung:
        `${plural(kritische.length, "offener Vorschlag", "offene Vorschläge")} in sicherheitsrelevanten Abschnitten (${abschnitte})` +
        (rest > 0 ? `, dazu ${plural(rest, "weiterer Vorschlag", "weitere Vorschläge")}.` : "."),
    };
  }

  if (!eingabe.hatVeroeffentlichtesDokument) {
    return {
      farbe: "ROT",
      begruendung: "Es ist noch keine Betriebsanweisung veröffentlicht.",
    };
  }

  if (anzahlOffen > 0) {
    return { farbe: "GELB", begruendung: `${offeneVorschlaege(anzahlOffen)} zur Prüfung.` };
  }

  if (eingabe.hatUnveroeffentlichteAenderung) {
    return {
      farbe: "GELB",
      begruendung: "Ein Dokument enthält Änderungen im Entwurf, die noch nicht veröffentlicht sind.",
    };
  }

  return { farbe: "GRUEN", begruendung: "Alle Vorschläge geprüft, Dokumente veröffentlicht." };
}

export const AMPEL_STIL: Record<AmpelFarbe, { punkt: string; text: string; hintergrund: string; label: string }> = {
  ROT: {
    punkt: "bg-red-500",
    text: "text-red-800",
    hintergrund: "bg-red-50 border-red-200",
    label: "Handlungsbedarf",
  },
  GELB: {
    punkt: "bg-amber-400",
    text: "text-amber-900",
    hintergrund: "bg-amber-50 border-amber-200",
    label: "Prüfen",
  },
  GRUEN: {
    punkt: "bg-emerald-500",
    text: "text-emerald-800",
    hintergrund: "bg-emerald-50 border-emerald-200",
    label: "Aktuell",
  },
};
