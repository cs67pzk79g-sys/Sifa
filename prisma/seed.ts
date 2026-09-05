/**
 * Demo data: one company, one hazardous substance, two SDB versions and a
 * published operating instruction.
 *
 * The two safety data sheets are generated as real text based PDFs and pushed
 * through exactly the same parser and comparison the application uses for an
 * upload, so the seeded state is identical to a state a user could produce.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sdbVerarbeiten } from "../lib/sdb-parser";
import { vorschlaegeErzeugen } from "../lib/vorschlaege";
import { leserTokenErzeugen } from "../lib/token";
import { inhaltSchreiben } from "../lib/dokument-inhalt";
import { SDB_VERSION_1, SDB_VERSION_2, sdbPdfErzeugen } from "./beispiel-sdb";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@betrieb.example";
const DEMO_PASSWORT = "arbeitsschutz2026";

async function sdbAnlegen(
  gefahrstoffId: string,
  versionNummer: number,
  abschnitte: Record<number, string>,
  kopfzeile: string,
) {
  const pdf = await sdbPdfErzeugen(abschnitte, kopfzeile);
  const verarbeitet = await sdbVerarbeiten(pdf);

  const datei = await prisma.datei.create({
    data: {
      dateiName: `SDB-Bremsenreiniger-BR-40-v${versionNummer}.pdf`,
      mimeTyp: "application/pdf",
      groesse: pdf.length,
      inhalt: pdf,
    },
  });

  const sdb = await prisma.sdbDokument.create({
    data: {
      gefahrstoffId,
      dateiId: datei.id,
      dateiUrl: `/api/dateien/${datei.id}`,
      dateiName: datei.dateiName,
      versionNummer,
      extrahierterText: verarbeitet.text,
      abschnitte: JSON.stringify(verarbeitet.abschnitte),
      erkannteAbschnitte: verarbeitet.erkannteAbschnitte,
    },
  });

  console.log(
    `  SDB Version ${versionNummer}: ${verarbeitet.erkannteAbschnitte} von 16 Abschnitten erkannt`,
  );
  return sdb;
}

async function main() {
  console.log("Demo-Daten werden angelegt …");

  const vorhanden = await prisma.nutzer.findUnique({ where: { email: DEMO_EMAIL } });
  if (vorhanden) {
    await prisma.betrieb.delete({ where: { id: vorhanden.betriebId } });
    console.log("  Bestehende Demo-Daten entfernt.");
  }

  const betrieb = await prisma.betrieb.create({
    data: {
      name: "Kfz-Werkstatt Muster GmbH",
      branche: "Kfz-Handwerk",
      leserToken: leserTokenErzeugen(),
      nutzer: {
        create: {
          email: DEMO_EMAIL,
          passwortHash: await bcrypt.hash(DEMO_PASSWORT, 12),
        },
      },
    },
  });

  const gefahrstoff = await prisma.gefahrstoff.create({
    data: {
      betriebId: betrieb.id,
      name: "Bremsenreiniger BR-40 Spray",
      hersteller: "Muster Chemie GmbH",
      kontext: {
        create: {
          taetigkeit: "Bremsteile und Kupplungsteile vor der Montage mit der Sprühdose reinigen",
          arbeitsbereich: "Werkstatt, Hebebühne 2 und Montageplatz",
          mengeHaeufigkeit: "ca. 2 Dosen à 500 ml pro Woche, täglich kurzzeitiger Einsatz",
          vorhandeneSchutzmassnahmen:
            "Nitrilhandschuhe (0,4 mm), Schutzbrille, Absaugung an der Hebebühne, jährliche Unterweisung",
          raeumlicheGegebenheiten:
            "Werkstatthalle mit zwei Sektionaltoren, natürliche Lüftung, Gefahrstoffschrank an der Rückwand",
        },
      },
    },
  });

  const sdb1 = await sdbAnlegen(
    gefahrstoff.id,
    1,
    SDB_VERSION_1,
    "Bremsenreiniger BR-40 Spray – Version 3.1 vom 14.03.2023",
  );
  const sdb2 = await sdbAnlegen(
    gefahrstoff.id,
    2,
    SDB_VERSION_2,
    "Bremsenreiniger BR-40 Spray – Version 4.0 vom 02.02.2026",
  );

  const anzahl = await vorschlaegeErzeugen(gefahrstoff.id, sdb1.id, sdb2.id);
  console.log(`  ${anzahl} Änderungsvorschlag/-vorschläge aus dem Versionsvergleich erzeugt.`);

  // A published operating instruction that still reflects the *old* SDB - which
  // is exactly the situation the open suggestions are supposed to surface.
  const inhalt = inhaltSchreiben({
    anwendungsbereich:
      "Bremsenreiniger BR-40 Spray zum Reinigen von Brems- und Kupplungsteilen in der Werkstatt (Hebebühne 2 und Montageplatz).",
    gefahren:
      "Extrem entzündbares Aerosol (H222). Behälter steht unter Druck, kann bei Erwärmung bersten (H229). Verursacht Hautreizungen (H315). Kann Schläfrigkeit und Benommenheit verursachen (H336). Wiederholter Kontakt kann zu spröder oder rissiger Haut führen (EUH066).",
    schutzmassnahmen:
      "Nur bei geöffneten Toren oder bei laufender Absaugung an der Hebebühne arbeiten. Von Zündquellen fernhalten, nicht rauchen. Schutzhandschuhe aus Nitrilkautschuk (0,4 mm) und Schutzbrille tragen. Dosen im Gefahrstoffschrank lagern, vor Sonne schützen, nicht über 50 °C erwärmen.",
    verhaltenImGefahrfall:
      "Bei Brand mit Schaum, Pulver oder CO2 löschen, keinen Wasser-Vollstrahl einsetzen. Bei Verschütten Zündquellen entfernen, mit Chemikalienbinder aufnehmen. Notruf 112.",
    ersteHilfe:
      "Nach Einatmen: an die frische Luft bringen. Nach Hautkontakt: mit Wasser und Seife waschen. Nach Augenkontakt: 10 Minuten bei geöffnetem Lidspalt spülen, Augenarzt aufsuchen. Nach Verschlucken: kein Erbrechen herbeiführen, sofort Arzt hinzuziehen. Ersthelfer: siehe Aushang.",
    entsorgung:
      "Restentleerte Dosen in die Metallsammlung. Nicht restentleerte Dosen und Bindemittel als gefährlichen Abfall über den beauftragten Entsorger entsorgen. Nicht in die Kanalisation gelangen lassen.",
  });

  await prisma.dokument.create({
    data: {
      betriebId: betrieb.id,
      gefahrstoffId: gefahrstoff.id,
      typ: "BETRIEBSANWEISUNG",
      inhalt,
      veroeffentlichterInhalt: inhalt,
      veroeffentlichteVersion: 1,
      version: 1,
      status: "VEROEFFENTLICHT",
      veroeffentlichtAm: new Date("2023-04-03T09:00:00Z"),
    },
  });

  console.log("\nFertig. Demo-Zugang:");
  console.log(`  E-Mail:   ${DEMO_EMAIL}`);
  console.log(`  Passwort: ${DEMO_PASSWORT}`);
  console.log(`  Leser-Link: /lesen/${betrieb.leserToken}`);
}

main()
  .catch((fehler) => {
    console.error(fehler);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
