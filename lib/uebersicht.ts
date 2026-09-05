import "server-only";
import { prisma } from "./prisma";
import { ampelBerechnen, type AmpelErgebnis } from "./ampel";

export interface GefahrstoffUebersicht {
  id: string;
  name: string;
  hersteller: string;
  sdbVersionen: number;
  letzterUpload: Date | null;
  offeneVorschlaege: number;
  offeneAbschnitte: number[];
  kontextVollstaendig: boolean;
  kontextAusgefuellteFelder: number;
  dokumente: {
    id: string;
    typ: "BETRIEBSANWEISUNG" | "GEFAEHRDUNGSBEURTEILUNG";
    status: "ENTWURF" | "VEROEFFENTLICHT";
    veroeffentlichteVersion: number | null;
  }[];
  ampel: AmpelErgebnis;
}

const KONTEXT_FELDER = [
  "taetigkeit",
  "arbeitsbereich",
  "mengeHaeufigkeit",
  "vorhandeneSchutzmassnahmen",
  "raeumlicheGegebenheiten",
] as const;

/** Loads all substances of a company together with their traffic light state. */
export async function gefahrstoffeMitStatus(betriebId: string): Promise<GefahrstoffUebersicht[]> {
  const gefahrstoffe = await prisma.gefahrstoff.findMany({
    where: { betriebId },
    orderBy: { name: "asc" },
    include: {
      kontext: true,
      sdbDokumente: { orderBy: { versionNummer: "desc" } },
      vorschlaege: { where: { status: "OFFEN" }, select: { abschnittsNummer: true } },
      dokumente: {
        select: {
          id: true,
          typ: true,
          status: true,
          veroeffentlichteVersion: true,
        },
      },
    },
  });

  return gefahrstoffe.map((gefahrstoff) => {
    const offeneAbschnitte = gefahrstoff.vorschlaege.map((v) => v.abschnittsNummer);
    const ausgefuellt = gefahrstoff.kontext
      ? KONTEXT_FELDER.filter((feld) => String(gefahrstoff.kontext?.[feld] ?? "").trim().length > 0)
          .length
      : 0;

    const betriebsanweisung = gefahrstoff.dokumente.find((d) => d.typ === "BETRIEBSANWEISUNG");
    const hatVeroeffentlichtesDokument = Boolean(betriebsanweisung?.veroeffentlichteVersion);
    const hatUnveroeffentlichteAenderung = gefahrstoff.dokumente.some(
      (d) => d.status === "ENTWURF" && d.veroeffentlichteVersion !== null,
    );

    return {
      id: gefahrstoff.id,
      name: gefahrstoff.name,
      hersteller: gefahrstoff.hersteller,
      sdbVersionen: gefahrstoff.sdbDokumente.length,
      letzterUpload: gefahrstoff.sdbDokumente[0]?.hochgeladenAm ?? null,
      offeneVorschlaege: offeneAbschnitte.length,
      offeneAbschnitte,
      kontextVollstaendig: ausgefuellt === KONTEXT_FELDER.length,
      kontextAusgefuellteFelder: ausgefuellt,
      dokumente: gefahrstoff.dokumente,
      ampel: ampelBerechnen({
        offeneAbschnitte,
        hatVeroeffentlichtesDokument,
        hatUnveroeffentlichteAenderung,
      }),
    };
  });
}
