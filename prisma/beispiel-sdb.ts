/**
 * Two versions of a fictional safety data sheet for the demo seed.
 *
 * The text follows the structure of a real German SDB (REACH Annex II) but the
 * product, the manufacturer and all values are invented. The second version
 * differs in sections 1, 2, 8, 13 and 16 - among them two safety critical ones,
 * so the demo shows a red traffic light right away.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const ABSCHNITTS_TITEL: Record<number, string> = {
  1: "Bezeichnung des Stoffs beziehungsweise des Gemischs und des Unternehmens",
  2: "Mögliche Gefahren",
  3: "Zusammensetzung / Angaben zu Bestandteilen",
  4: "Erste-Hilfe-Maßnahmen",
  5: "Maßnahmen zur Brandbekämpfung",
  6: "Maßnahmen bei unbeabsichtigter Freisetzung",
  7: "Handhabung und Lagerung",
  8: "Begrenzung und Überwachung der Exposition / Persönliche Schutzausrüstung",
  9: "Physikalische und chemische Eigenschaften",
  10: "Stabilität und Reaktivitat",
  11: "Toxikologische Angaben",
  12: "Umweltbezogene Angaben",
  13: "Hinweise zur Entsorgung",
  14: "Angaben zum Transport",
  15: "Rechtsvorschriften",
  16: "Sonstige Angaben",
};

const GEMEINSAM: Record<number, string> = {
  3: [
    "Chemische Charakterisierung: Gemisch aus Kohlenwasserstoffen und Aceton.",
    "Gefährliche Inhaltsstoffe:",
    "Aceton (CAS 67-64-1), 30-40 %, H225, H319, H336, EUH066",
    "Kohlenwasserstoffe, C6-C7, n-Alkane, Isoalkane (CAS 921-024-6), 40-50 %, H225, H304, H315, H336",
    "Kohlendioxid (CAS 124-38-9), 5-10 %, Treibmittel",
  ].join("\n"),
  4: [
    "Nach Einatmen: Für Frischluft sorgen. Bei Beschwerden ärztlichen Rat einholen.",
    "Nach Hautkontakt: Mit Wasser und Seife abwaschen. Verunreinigte Kleidung wechseln.",
    "Nach Augenkontakt: 10 Minuten bei geöffnetem Lidspalt mit Wasser spülen. Augenarzt aufsuchen.",
    "Nach Verschlucken: Kein Erbrechen herbeiführen, Aspirationsgefahr. Sofort Arzt hinzuziehen.",
  ].join("\n"),
  5: [
    "Geeignete Löschmittel: Schaum, Löschpulver, Kohlendioxid, Sprühwasser.",
    "Ungeeignete Löschmittel: Wasser-Vollstrahl.",
    "Besondere Gefahren: Bei Erhitzung Berstgefahr der Druckgaspackung.",
    "Schutzausrüstung: Umgebungsluftunabhängiges Atemschutzgerät.",
  ].join("\n"),
  6: [
    "Personenbezogene Vorsichtsmaßnahmen: Zündquellen entfernen, fur ausreichende Lüftung sorgen.",
    "Umweltschutzmaßnahmen: Nicht in die Kanalisation oder in Gewässer gelangen lassen.",
    "Verfahren zur Reinigung: Mit flüssigkeitsbindendem Material (Chemikalienbinder, Sand) aufnehmen",
    "und in verschließbaren Behältern der Entsorgung zuführen.",
  ].join("\n"),
  7: [
    "Handhabung: Nur in gut gelüfteten Bereichen verwenden. Von Zündquellen fernhalten.",
    "Nicht rauchen. Aerosol nicht einatmen.",
    "Lagerung: Behälter dicht geschlossen an einem gut gelüfteten Ort aufbewahren.",
    "Vor Sonnenbestrahlung schützen und nicht Temperaturen über 50 °C aussetzen.",
    "Lagerklasse: 2B (Druckgaspackungen).",
  ].join("\n"),
  9: [
    "Form: Aerosol. Farbe: farblos. Geruch: lösemittelartig.",
    "Flammpunkt: unter -20 °C.",
    "Zündtemperatur: 240 °C.",
    "Dichte bei 20 °C: 0,72 g/cm³.",
    "Wasserlöslichkeit: teilweise mischbar.",
  ].join("\n"),
  10: [
    "Zu vermeidende Bedingungen: Erhitzung über 50 °C, offene Flammen, Funkenbildung.",
    "Unverträgliche Materialien: starke Oxidationsmittel, starke Säuren und Laugen.",
    "Gefährliche Zersetzungsprodukte: Kohlenmonoxid, Kohlendioxid.",
  ].join("\n"),
  11: [
    "Akute Toxizität: auf Basis der verfügbaren Daten sind die Einstufungskriterien nicht erfüllt.",
    "Reizwirkung: reizt die Haut. Wiederholter Kontakt kann zu spröder und rissiger Haut führen.",
    "Spezifische Zielorgan-Toxizität: kann Schläfrigkeit und Benommenheit verursachen.",
  ].join("\n"),
  12: [
    "Toxizität: schädlich fur Wasserorganismen mit langfristiger Wirkung.",
    "Wassergefährdungsklasse: WGK 2 (deutlich wassergefährdend).",
    "Nicht in Gewässer, Abwasser oder Erdreich gelangen lassen.",
  ].join("\n"),
  14: [
    "UN-Nummer: 1950. Versandbezeichnung: DRUCKGASPACKUNGEN, entzündbar.",
    "Klasse: 2.1. Begrenzte Menge: 1 L. Tunnelbeschränkungscode: D.",
  ].join("\n"),
  15: [
    "Beschäftigungsbeschränkungen nach Jugendarbeitsschutzgesetz und Mutterschutzgesetz beachten.",
    "Störfall-Verordnung: nicht anwendbar.",
    "Eine Stoffsicherheitsbeurteilung wurde fur dieses Gemisch nicht durchgeführt.",
  ].join("\n"),
};

export const SDB_VERSION_1: Record<number, string> = {
  ...GEMEINSAM,
  1: [
    "Produktidentifikator: Bremsenreiniger BR-40 Spray",
    "Relevante Verwendungen: Reinigung von Bremsen und Metallteilen im gewerblichen Bereich.",
    "Lieferant: Muster Chemie GmbH, Industriestraße 12, 12345 Musterstadt",
    "Telefon: 01234 567-0, E-Mail: sicherheit@muster-chemie.example",
    "Notrufnummer: 01234 567-99 (Mo-Fr 8-17 Uhr)",
    "Überarbeitet am: 14.03.2023, Version 3.1",
  ].join("\n"),
  2: [
    "Einstufung gemäß Verordnung (EG) Nr. 1272/2008:",
    "Aerosol 1, H222 Extrem entzündbares Aerosol.",
    "Aerosol 1, H229 Behälter steht unter Druck: kann bei Erwärmung bersten.",
    "Skin Irrit. 2, H315 Verursacht Hautreizungen.",
    "STOT SE 3, H336 Kann Schläfrigkeit und Benommenheit verursachen.",
    "EUH066 Wiederholter Kontakt kann zu spröder oder rissiger Haut führen.",
    "Signalwort: Gefahr. Piktogramme: GHS02, GHS07.",
    "Sicherheitshinweise: P210, P211, P251, P261, P271, P410+P412.",
  ].join("\n"),
  8: [
    "Arbeitsplatzgrenzwerte:",
    "Aceton: AGW 1200 mg/m³ (500 ml/m³), Überschreitungsfaktor 2(II).",
    "Handschutz: Schutzhandschuhe aus Nitrilkautschuk, Schichtdicke 0,4 mm,",
    "Durchbruchzeit mindestens 30 Minuten (Schutzindex 2).",
    "Augenschutz: dicht schließende Schutzbrille.",
    "Atemschutz: bei ausreichender Lüftung nicht erforderlich.",
    "Technische Maßnahmen: fur gute Raumlüftung sorgen.",
  ].join("\n"),
  13: [
    "Abfallschlüssel Produkt: 07 06 04 - andere organische Lösemittel, Waschflüssigkeiten.",
    "Abfallschlüssel Verpackung: 15 01 04 - Verpackungen aus Metall.",
    "Restentleerte Druckgaspackungen können der Wertstoffsammlung zugeführt werden.",
  ].join("\n"),
  16: [
    "Wortlaut der H-Sätze aus Abschnitt 3: H225, H304, H315, H319, H336, EUH066.",
    "Änderungen gegenüber der Vorversion: redaktionelle Überarbeitung.",
    "Diese Angaben beschreiben das Produkt hinsichtlich der Sicherheitserfordernisse.",
    "Erstellt am 14.03.2023.",
  ].join("\n"),
};

export const SDB_VERSION_2: Record<number, string> = {
  ...GEMEINSAM,
  1: [
    "Produktidentifikator: Bremsenreiniger BR-40 Spray",
    "Relevante Verwendungen: Reinigung von Bremsen und Metallteilen im gewerblichen Bereich.",
    "Lieferant: Muster Chemie GmbH, Industriestraße 12, 12345 Musterstadt",
    "Telefon: 01234 567-0, E-Mail: sicherheit@muster-chemie.example",
    "Notrufnummer: 01234 567-99 (Mo-Fr 8-17 Uhr)",
    "Überarbeitet am: 02.02.2026, Version 4.0",
  ].join("\n"),
  2: [
    "Einstufung gemäß Verordnung (EG) Nr. 1272/2008:",
    "Aerosol 1, H222 Extrem entzündbares Aerosol.",
    "Aerosol 1, H229 Behälter steht unter Druck: kann bei Erwärmung bersten.",
    "Skin Irrit. 2, H315 Verursacht Hautreizungen.",
    "Eye Irrit. 2, H319 Verursacht schwere Augenreizung.",
    "STOT SE 3, H336 Kann Schläfrigkeit und Benommenheit verursachen.",
    "EUH066 Wiederholter Kontakt kann zu spröder oder rissiger Haut führen.",
    "Signalwort: Gefahr. Piktogramme: GHS02, GHS07.",
    "Sicherheitshinweise: P210, P211, P251, P261, P271, P280, P305+P351+P338, P410+P412.",
  ].join("\n"),
  8: [
    "Arbeitsplatzgrenzwerte:",
    "Aceton: AGW 600 mg/m³ (250 ml/m³), Überschreitungsfaktor 2(II).",
    "Handschutz: Schutzhandschuhe aus Nitrilkautschuk, Schichtdicke 0,7 mm,",
    "Durchbruchzeit mindestens 60 Minuten (Schutzindex 4).",
    "Augenschutz: dicht schließende Schutzbrille nach EN 166 ist zwingend zu tragen.",
    "Atemschutz: bei Sprühnebelbildung oder unzureichender Lüftung Halbmaske mit Filter A2.",
    "Technische Maßnahmen: Absaugung an der Arbeitsstelle vorsehen.",
  ].join("\n"),
  13: [
    "Abfallschlüssel Produkt: 14 06 03 - andere Lösemittel und Lösemittelgemische.",
    "Abfallschlüssel Verpackung: 15 01 10 - Verpackungen, die Rückstände gefährlicher Stoffe enthalten.",
    "Druckgaspackungen sind vollständig zu entleeren und über einen zugelassenen Entsorger",
    "als gefahrlicher Abfall zu entsorgen.",
  ].join("\n"),
  16: [
    "Wortlaut der H-Sätze aus Abschnitt 3: H225, H304, H315, H319, H336, EUH066.",
    "Änderungen gegenüber der Vorversion: Abschnitte 2, 8 und 13 wurden überarbeitet.",
    "Diese Angaben beschreiben das Produkt hinsichtlich der Sicherheitserfordernisse.",
    "Erstellt am 02.02.2026.",
  ].join("\n"),
};

/**
 * Renders the sections into a text based PDF, laid out the way a real SDB is,
 * so the seed data goes through exactly the same parser as a real upload.
 */
export async function sdbPdfErzeugen(
  abschnitte: Record<number, string>,
  kopfzeile: string,
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const fett = await pdf.embedFont(StandardFonts.HelveticaBold);

  const breite = 595.28;
  const hoehe = 841.89;
  const rand = 50;
  let seite = pdf.addPage([breite, hoehe]);
  let y = hoehe - rand;

  const zeile = (text: string, gross = false) => {
    if (y < rand + 30) {
      seite = pdf.addPage([breite, hoehe]);
      y = hoehe - rand;
    }
    seite.drawText(text, {
      x: rand,
      y,
      size: gross ? 11 : 9,
      font: gross ? fett : normal,
      color: rgb(0, 0, 0),
    });
    y -= gross ? 18 : 12.5;
  };

  zeile("Sicherheitsdatenblatt gemäß Verordnung (EG) Nr. 1907/2006 (REACH)", true);
  zeile(kopfzeile);
  y -= 8;

  for (let nummer = 1; nummer <= 16; nummer++) {
    zeile(`ABSCHNITT ${nummer}: ${ABSCHNITTS_TITEL[nummer]}`, true);
    for (const textZeile of (abschnitte[nummer] ?? "keine Angaben").split("\n")) {
      zeile(textZeile);
    }
    y -= 6;
  }

  return Buffer.from(await pdf.save());
}
