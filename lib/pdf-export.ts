/**
 * PDF export for published operating instructions and risk assessments.
 *
 * Uses pdf-lib with the standard Helvetica fonts (WinAnsi), which covers German
 * umlauts without shipping a font file. Characters outside WinAnsi are replaced
 * so that an export can never fail on a stray typographic character.
 */
import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage } from "pdf-lib";
import { BA_ABSCHNITTE, type DokumentInhalt } from "./dokument-inhalt";
import { HAFTUNGSHINWEIS } from "./rechtstexte";

export interface ExportDaten {
  betriebName: string;
  branche: string;
  gefahrstoffName: string;
  hersteller: string;
  typLabel: string;
  version: number;
  veroeffentlichtAm: Date | null;
  inhalt: DokumentInhalt;
  logo?: { daten: Buffer; mimeTyp: string } | null;
}

const A4 = { breite: 595.28, hoehe: 841.89 };
const RAND = 56;
const FUSS_HOEHE = 74;

// Typographic characters that the standard WinAnsi fonts do not carry.
const ERSATZ: Record<string, string> = {
  "„": '"',
  "“": '"',
  "”": '"',
  "‚": "'",
  "‘": "'",
  "’": "'",
  "–": "-",
  "—": "-",
  "…": "...",
  " ": " ",
  " ": " ",
  "•": "-",
  "→": "->",
};

const ERSATZ_MUSTER = /[„“”‚‘’–—…  •→]/g;

/** Replaces characters the standard WinAnsi fonts cannot encode. */
function winAnsiSicher(text: string): string {
  return text
    .replace(ERSATZ_MUSTER, (zeichen) => ERSATZ[zeichen] ?? " ")
    // Anything still outside Latin-1 becomes a question mark rather than an error.
    .replace(/[^\n -ÿ]/g, "?");
}

function zeilenUmbrechen(text: string, font: PDFFont, groesse: number, breite: number): string[] {
  const zeilen: string[] = [];
  for (const absatz of winAnsiSicher(text).split(/\n/)) {
    if (absatz.trim() === "") {
      zeilen.push("");
      continue;
    }
    let aktuell = "";
    for (const wort of absatz.trim().split(/\s+/)) {
      const kandidat = aktuell ? `${aktuell} ${wort}` : wort;
      if (font.widthOfTextAtSize(kandidat, groesse) <= breite) {
        aktuell = kandidat;
        continue;
      }
      if (aktuell) zeilen.push(aktuell);
      // A single word longer than one line is broken by character.
      let rest = wort;
      while (font.widthOfTextAtSize(rest, groesse) > breite && rest.length > 1) {
        let schnitt = rest.length;
        while (schnitt > 1 && font.widthOfTextAtSize(rest.slice(0, schnitt), groesse) > breite) {
          schnitt--;
        }
        zeilen.push(rest.slice(0, schnitt));
        rest = rest.slice(schnitt);
      }
      aktuell = rest;
    }
    if (aktuell) zeilen.push(aktuell);
  }
  return zeilen;
}

function datumFormatieren(datum: Date | null): string {
  if (!datum) return "-";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(datum);
}

export async function dokumentAlsPdf(daten: ExportDaten): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${daten.typLabel} - ${daten.gefahrstoffName}`);
  pdf.setProducer("Arbeitsschutz-Software (Prototyp)");
  pdf.setCreator(daten.betriebName);

  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const fett = await pdf.embedFont(StandardFonts.HelveticaBold);

  let logo: PDFImage | null = null;
  if (daten.logo) {
    try {
      logo =
        daten.logo.mimeTyp === "image/png"
          ? await pdf.embedPng(daten.logo.daten)
          : await pdf.embedJpg(daten.logo.daten);
    } catch {
      logo = null; // A broken logo must never block the export.
    }
  }

  const inhaltsBreite = A4.breite - 2 * RAND;
  let seite = pdf.addPage([A4.breite, A4.hoehe]);
  let y = A4.hoehe - RAND;

  const platzPruefen = (benoetigt: number) => {
    if (y - benoetigt < FUSS_HOEHE) {
      seite = pdf.addPage([A4.breite, A4.hoehe]);
      y = A4.hoehe - RAND;
    }
  };

  const textSchreiben = (
    text: string,
    optionen: {
      font?: PDFFont;
      groesse?: number;
      abstand?: number;
      farbe?: [number, number, number];
    } = {},
  ) => {
    const font = optionen.font ?? normal;
    const groesse = optionen.groesse ?? 10.5;
    const zeilenHoehe = groesse * 1.45;
    const farbe = optionen.farbe ?? [0.1, 0.12, 0.16];

    for (const zeile of zeilenUmbrechen(text, font, groesse, inhaltsBreite)) {
      platzPruefen(zeilenHoehe);
      if (zeile !== "") {
        seite.drawText(zeile, {
          x: RAND,
          y: y - groesse,
          size: groesse,
          font,
          color: rgb(farbe[0], farbe[1], farbe[2]),
        });
      }
      y -= zeilenHoehe;
    }
    y -= optionen.abstand ?? 0;
  };

  // --- Header -------------------------------------------------------------
  if (logo) {
    const faktor = Math.min(120 / logo.width, 46 / logo.height, 1);
    const breite = logo.width * faktor;
    const hoehe = logo.height * faktor;
    seite.drawImage(logo, {
      x: A4.breite - RAND - breite,
      y: y - hoehe,
      width: breite,
      height: hoehe,
    });
  }

  textSchreiben(daten.betriebName, { font: fett, groesse: 15 });
  textSchreiben(`Branche: ${daten.branche}`, {
    groesse: 9.5,
    farbe: [0.42, 0.45, 0.5],
    abstand: 14,
  });

  seite.drawLine({
    start: { x: RAND, y },
    end: { x: A4.breite - RAND, y },
    thickness: 1,
    color: rgb(0.1, 0.29, 0.45),
  });
  y -= 22;

  textSchreiben(daten.typLabel, { font: fett, groesse: 18, abstand: 2 });
  textSchreiben(`${daten.gefahrstoffName} (${daten.hersteller})`, { groesse: 12, abstand: 10 });
  textSchreiben(
    `Version ${daten.version} | Veroeffentlicht am ${datumFormatieren(daten.veroeffentlichtAm)}`,
    { groesse: 9.5, farbe: [0.42, 0.45, 0.5], abstand: 16 },
  );

  // --- Content ------------------------------------------------------------
  for (const abschnitt of BA_ABSCHNITTE) {
    const inhalt = daten.inhalt[abschnitt.key]?.trim();
    platzPruefen(56);
    textSchreiben(abschnitt.titel, { font: fett, groesse: 12, abstand: 4 });
    textSchreiben(inhalt && inhalt.length > 0 ? inhalt : "- keine Angabe -", { abstand: 14 });
  }

  // --- Footer on every page ----------------------------------------------
  const seiten = pdf.getPages();
  const fussGroesse = 7.5;
  const fussZeilen = zeilenUmbrechen(HAFTUNGSHINWEIS, normal, fussGroesse, inhaltsBreite);

  seiten.forEach((s, index) => {
    s.drawLine({
      start: { x: RAND, y: FUSS_HOEHE },
      end: { x: A4.breite - RAND, y: FUSS_HOEHE },
      thickness: 0.5,
      color: rgb(0.8, 0.83, 0.86),
    });

    let fussY = FUSS_HOEHE - 12;
    for (const zeile of fussZeilen) {
      s.drawText(zeile, {
        x: RAND,
        y: fussY,
        size: fussGroesse,
        font: normal,
        color: rgb(0.35, 0.38, 0.43),
      });
      fussY -= fussGroesse * 1.4;
    }

    const seitenText = `Seite ${index + 1} von ${seiten.length}`;
    s.drawText(seitenText, {
      x: A4.breite - RAND - normal.widthOfTextAtSize(seitenText, fussGroesse),
      y: 24,
      size: fussGroesse,
      font: normal,
      color: rgb(0.55, 0.58, 0.63),
    });
  });

  return pdf.save();
}
