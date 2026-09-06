/**
 * Pre-fills an operating instruction / risk assessment from the data that is
 * already there: the safety data sheet and the company specific context.
 *
 * This is a transfer, not a generation. Every sentence comes verbatim from the
 * uploaded SDB or from what the user typed into the context wizard - nothing is
 * invented, summarised or rephrased. The result is always a draft the user has
 * to check and confirm; publishing still requires the explicit confirmation.
 */
import type { Gefahrstoff, GefahrstoffKontext, SdbDokument } from "@prisma/client";
import type { DokumentInhalt } from "./dokument-inhalt";
import type { BaAbschnittKey } from "./sdb-abschnitte";
import { abschnitteLesen } from "./sdb-parser";

/** Where the user can verify a given block - shown in the editor, not in the document. */
export type Quellen = Record<BaAbschnittKey, string[]>;

export interface Vorbefuellung {
  inhalt: DokumentInhalt;
  quellen: Quellen;
  /** True when at least one field could be filled. */
  hatInhalt: boolean;
}

/** Returns one SDB section without its heading line. */
function abschnittsText(abschnitte: Record<string, string>, nummer: number): string {
  const roh = abschnitte[String(nummer)] ?? "";
  const zeilen = roh.split("\n");
  if (zeilen.length > 0 && /^(?:abschnitt|section)\s*\d{1,2}\b/i.test(zeilen[0].trim())) {
    zeilen.shift();
  }
  return zeilen.join("\n").trim();
}

/** Joins labelled blocks, skipping the ones that have no content. */
function bloecke(...teile: [string | null, string][]): string {
  return teile
    .filter(([, text]) => text.trim().length > 0)
    .map(([titel, text]) => (titel ? `${titel}\n${text.trim()}` : text.trim()))
    .join("\n\n");
}

export function vorbefuellungErzeugen(
  gefahrstoff: Pick<Gefahrstoff, "name" | "hersteller">,
  kontext: GefahrstoffKontext | null,
  sdb: SdbDokument | null,
): Vorbefuellung {
  const abschnitte = sdb ? abschnitteLesen(sdb.abschnitte) : {};
  const ausSdb = (nummer: number) => (sdb ? abschnittsText(abschnitte, nummer) : "");

  const taetigkeit = kontext?.taetigkeit?.trim() ?? "";
  const arbeitsbereich = kontext?.arbeitsbereich?.trim() ?? "";
  const menge = kontext?.mengeHaeufigkeit?.trim() ?? "";
  const schutz = kontext?.vorhandeneSchutzmassnahmen?.trim() ?? "";

  const inhalt: DokumentInhalt = {
    anwendungsbereich: bloecke(
      [null, `${gefahrstoff.name} (Hersteller: ${gefahrstoff.hersteller})`],
      ["Tätigkeit:", taetigkeit],
      ["Arbeitsbereich:", arbeitsbereich],
      ["Menge und Häufigkeit:", menge],
    ),
    gefahren: ausSdb(2),
    schutzmassnahmen: bloecke(
      ["Handhabung und Lagerung:", ausSdb(7)],
      ["Begrenzung der Exposition und persönliche Schutzausrüstung:", ausSdb(8)],
      ["Im Betrieb bereits vorhandene Maßnahmen:", schutz],
    ),
    verhaltenImGefahrfall: bloecke(
      ["Bei Brand:", ausSdb(5)],
      ["Bei unbeabsichtigter Freisetzung:", ausSdb(6)],
    ),
    ersteHilfe: ausSdb(4),
    entsorgung: ausSdb(13),
  };

  const sdbHinweis = (...nummern: number[]) =>
    sdb
      ? nummern
          .filter((n) => abschnittsText(abschnitte, n).length > 0)
          .map((n) => `SDB Abschnitt ${n}`)
      : [];

  const quellen: Quellen = {
    anwendungsbereich: kontext ? ["Betrieblicher Kontext"] : [],
    gefahren: sdbHinweis(2),
    schutzmassnahmen: [...sdbHinweis(7, 8), ...(schutz ? ["Betrieblicher Kontext"] : [])],
    verhaltenImGefahrfall: sdbHinweis(5, 6),
    ersteHilfe: sdbHinweis(4),
    entsorgung: sdbHinweis(13),
  };

  return {
    inhalt,
    quellen,
    hatInhalt: Object.values(inhalt).some((wert) => wert.trim().length > 0),
  };
}

/** Fills only the fields the user has left empty - never overwrites their text. */
export function leereFelderFuellen(
  vorhanden: DokumentInhalt,
  vorschlag: DokumentInhalt,
): { inhalt: DokumentInhalt; gefuellteFelder: BaAbschnittKey[] } {
  const inhalt = { ...vorhanden };
  const gefuellteFelder: BaAbschnittKey[] = [];

  for (const schluessel of Object.keys(vorhanden) as BaAbschnittKey[]) {
    if (vorhanden[schluessel].trim() === "" && vorschlag[schluessel].trim() !== "") {
      inhalt[schluessel] = vorschlag[schluessel];
      gefuellteFelder.push(schluessel);
    }
  }

  return { inhalt, gefuellteFelder };
}
