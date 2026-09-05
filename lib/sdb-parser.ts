/**
 * Extracts text from a safety data sheet PDF and splits it into the 16
 * sections prescribed by REACH Annex II.
 *
 * Only text based PDFs are supported - scanned sheets would need OCR, which is
 * out of scope. When too few sections are recognised the caller warns the user
 * instead of silently producing a useless comparison.
 */

export interface SdbParseErgebnis {
  text: string;
  abschnitte: Record<string, string>;
  erkannteAbschnitte: number;
}

/** Reads the text layer of a PDF. Returns "" when the PDF carries no text. */
export async function pdfTextExtrahieren(daten: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(daten) });
  try {
    const ergebnis = await parser.getText();
    return ergebnis.text ?? "";
  } finally {
    await parser.destroy();
  }
}

/**
 * Normalises the extracted text: unifies line breaks, drops soft hyphens and
 * collapses runs of spaces, while keeping the line structure that the section
 * headings rely on.
 */
/**
 * Lines that only mark a page boundary. They carry no content, but they move
 * when a manufacturer re-formats the document - without removing them, every
 * section after a shifted page break would look changed.
 */
const SEITEN_MARKIERUNG =
  /^(?:-{1,4}\s*)?(?:seite|page)?\s*\d{1,3}\s*(?:of|von|\/)\s*\d{1,3}\s*(?:-{1,4})?$/i;

/**
 * Normalises the extracted text: unifies line breaks, drops soft hyphens and
 * page markers and collapses runs of spaces, while keeping the line structure
 * that the section headings rely on.
 */
export function textNormalisieren(roh: string): string {
  return roh
    .replace(/\r\n?/g, "\n")
    .replace(/\u00ad/g, "")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((zeile) => zeile.replace(/[ \t]+/g, " ").trim())
    .filter((zeile) => !SEITEN_MARKIERUNG.test(zeile))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

interface Treffer {
  nummer: number;
  start: number;
  ende: number;
}

// "ABSCHNITT 3:", "Abschnitt 3 -", "SECTION 3:" - the form used by virtually
// every German or bilingual safety data sheet.
const EXPLIZIT = /^(?:abschnitt|section)\s*(\d{1,2})\s*[:.–—-]?\s*(.*)$/i;

// Fallback for sheets that only number their headings: "3. Zusammensetzung".
// Requires a following word starting with a capital letter so that neither
// sub-sections ("3.1 ...") nor ordinary sentences are matched.
const NUMMERIERT = /^(\d{1,2})\s*[.):]\s*([A-Za-zÄÖÜ][^\n]{3,})$/;

/**
 * Collects heading candidates. Headings must appear in ascending order, which
 * filters out cross references such as "siehe Abschnitt 8" inside body text.
 */
function ueberschriftenFinden(text: string): Treffer[] {
  const zeilen = text.split("\n");
  const treffer: Treffer[] = [];
  let offset = 0;
  let zuletzt = 0;

  for (const zeile of zeilen) {
    const zeilenStart = offset;
    offset += zeile.length + 1;

    const roh = zeile.trim();
    if (!roh || roh.length > 160) continue;

    let nummer: number | null = null;
    let explizit = false;

    const explizitTreffer = roh.match(EXPLIZIT);
    if (explizitTreffer) {
      nummer = Number(explizitTreffer[1]);
      explizit = true;
    } else {
      const nummerierterTreffer = roh.match(NUMMERIERT);
      if (nummerierterTreffer) nummer = Number(nummerierterTreffer[1]);
    }

    if (nummer === null || nummer < 1 || nummer > 16) continue;
    // Sections must follow each other; a repeated or lower number is a
    // cross reference or a page header, not a new section.
    if (nummer <= zuletzt) continue;
    // Numbered headings are only trusted directly after the previous section.
    if (!explizit && nummer !== zuletzt + 1) continue;

    treffer.push({ nummer, start: zeilenStart, ende: zeilenStart + zeile.length });
    zuletzt = nummer;
  }

  return treffer;
}

/** Splits normalised SDB text into its 16 sections. */
export function abschnitteZerlegen(text: string): {
  abschnitte: Record<string, string>;
  erkannteAbschnitte: number;
} {
  const treffer = ueberschriftenFinden(text);
  const abschnitte: Record<string, string> = {};

  for (let i = 0; i < treffer.length; i++) {
    const aktuell = treffer[i];
    const naechster = treffer[i + 1];
    const inhalt = text
      .slice(aktuell.start, naechster ? naechster.start : text.length)
      .trim();
    abschnitte[String(aktuell.nummer)] = inhalt;
  }

  // Always expose all 16 keys so the UI can render a stable table.
  for (let nummer = 1; nummer <= 16; nummer++) {
    if (!(String(nummer) in abschnitte)) abschnitte[String(nummer)] = "";
  }

  return { abschnitte, erkannteAbschnitte: treffer.length };
}

export async function sdbVerarbeiten(daten: Buffer): Promise<SdbParseErgebnis> {
  const roh = await pdfTextExtrahieren(daten);
  const text = textNormalisieren(roh);
  const { abschnitte, erkannteAbschnitte } = abschnitteZerlegen(text);
  return { text, abschnitte, erkannteAbschnitte };
}

export function abschnitteLesen(json: string): Record<string, string> {
  try {
    const geparst = JSON.parse(json) as Record<string, string>;
    if (geparst && typeof geparst === "object") return geparst;
  } catch {
    // fall through
  }
  return {};
}
