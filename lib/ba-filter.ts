/**
 * Decides, line by line, which information from a safety data sheet belongs in
 * an operating instruction (TRGS 555) - and which does not.
 *
 * This is not a judgement call the user should have to make: what belongs in an
 * operating instruction is largely prescribed. Occupational exposure limits
 * (AGW), storage class codes and classification shorthand are needed for the
 * risk assessment, but they are useless on a sheet posted next to the
 * workbench. Encoding that as rules removes the one step a layperson cannot do.
 *
 * Nothing is discarded silently: every removed line is returned so the editor
 * can show it and offer to put it back.
 */

/**
 * A labelled line such as "Handschutz: Nitrilhandschuhe ...".
 *
 * Deliberately narrow: real SDB labels are short and carry no sentence
 * punctuation. A loose pattern would treat an ordinary sentence containing a
 * colon ("H229 Behälter steht unter Druck: kann bersten") as a heading and
 * silently switch the filter into the wrong mode.
 */
const LABEL = /^[A-Za-zÄÖÜäöüß][^:.!?]{2,30}:(?:\s|$)/;

interface AbschnittsRegel {
  /** Labels whose whole block does NOT belong in an operating instruction. */
  weglassen?: RegExp;
  /** Labels whose block does belong - they end a preceding "weglassen" block. */
  behalten?: RegExp;
  /** Single lines to drop regardless of the block they sit in. */
  zeileWeglassen?: RegExp;
}

const REGELN: Record<number, AbschnittsRegel> = {
  // Section 2 - hazards. The H- and P-phrases belong in; the regulation
  // heading is pure boilerplate.
  // Every H- and P-phrase matters here, so only the pure boilerplate heading
  // goes - no block mode, which could swallow a hazard statement below it.
  2: {
    zeileWeglassen: /^(einstufung gem|einstufung nach|klassifizierung gem)[^:]*:?\s*$/i,
  },
  // Section 7 - handling and storage. Storage class codes are inventory
  // bookkeeping, not a working instruction.
  7: {
    weglassen: /^(lagerklasse|lgk|spezifische endanwendung|wgk)/i,
    behalten: /^(handhabung|lagerung|hinweise|schutzma|zusammenlagerung|anforderungen an lagerr)/i,
  },
  // Section 8 - the biggest win. Exposure limits belong in the risk
  // assessment; the protective equipment belongs in the operating instruction.
  8: {
    weglassen:
      /^(arbeitsplatzgrenzwert|grenzwert|expositionsgrenzwert|biologische grenzwert|bgw|dnel|pnec|abgeleitete|vorhergesagte|zu überwachende|kontrollparameter)/i,
    behalten:
      /^(handschutz|augenschutz|gesichtsschutz|atemschutz|k[oö]rperschutz|hautschutz|schutzhandschuh|pers[oö]nliche schutz|technische ma|schutz- und hygiene|allgemeine schutz|begrenzung und )/i,
    // AGW values often continue on their own line without a label.
    zeileWeglassen: /\b(agw|twa|stel|überschreitungsfaktor|dnel|pnec|cas[- ]?nr)\b/i,
  },
};

export interface FilterErgebnis {
  behalten: string[];
  weggelassen: string[];
}

/**
 * Splits one SDB section into the lines that belong in an operating
 * instruction and the ones that do not. Without a rule for the section,
 * everything is kept - the safe default.
 */
export function abschnittFiltern(text: string, abschnittsNummer: number): FilterErgebnis {
  const regel = REGELN[abschnittsNummer];
  const zeilen = text.split("\n");
  if (!regel) return { behalten: zeilen, weggelassen: [] };

  const behalten: string[] = [];
  const weggelassen: string[] = [];
  // Start in "keep" mode: a section never opens in a block we drop.
  let imWeglassBlock = false;

  for (const zeile of zeilen) {
    const roh = zeile.trim();
    if (roh === "") {
      behalten.push(zeile);
      continue;
    }

    const hatLabel = LABEL.test(roh);
    if (hatLabel) {
      // A labelled line decides the mode for itself and the lines below it.
      imWeglassBlock = regel.weglassen?.test(roh) ?? false;
    }

    const einzelnWeglassen = regel.zeileWeglassen?.test(roh) ?? false;
    if (imWeglassBlock || einzelnWeglassen) weggelassen.push(roh);
    else behalten.push(zeile);
  }

  // Never hand back an empty field: if a rule would remove everything, the
  // rule does not fit this manufacturer's layout - keep the original.
  if (behalten.join("").trim() === "" && weggelassen.length > 0) {
    return { behalten: zeilen, weggelassen: [] };
  }

  return {
    behalten: behalten.join("\n").trim().split("\n").filter((z, i, a) => !(z === "" && a[i - 1] === "")),
    weggelassen,
  };
}
