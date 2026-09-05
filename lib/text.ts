/** Small German pluralisation helpers - "1 offener Vorschlag" reads better than "1 Vorschlag/Vorschläge". */

export function plural(anzahl: number, einzahl: string, mehrzahl: string): string {
  return `${anzahl} ${anzahl === 1 ? einzahl : mehrzahl}`;
}

export function offeneVorschlaege(anzahl: number): string {
  return plural(anzahl, "offener Vorschlag", "offene Vorschläge");
}

export function sdbVersionen(anzahl: number): string {
  return plural(anzahl, "SDB-Version", "SDB-Versionen");
}
