import "server-only";
import { prisma } from "./prisma";
import { LEERER_INHALT, inhaltSchreiben } from "./dokument-inhalt";
import { vorbefuellungErzeugen, type Quellen, type Weggelassen } from "./vorbefuellung";

const LEERE_QUELLEN: Quellen = {
  anwendungsbereich: [],
  gefahren: [],
  schutzmassnahmen: [],
  verhaltenImGefahrfall: [],
  ersteHilfe: [],
  entsorgung: [],
};

/**
 * Returns the document of the given type, creating it on first use.
 *
 * A newly created document is pre-filled from the latest safety data sheet and
 * the company context, so the user starts from a checkable draft instead of six
 * empty fields. It stays a draft either way - publishing needs the explicit
 * confirmation in the editor.
 */
export async function dokumentSicherstellen(
  betriebId: string,
  gefahrstoffId: string,
  typ: "BETRIEBSANWEISUNG" | "GEFAEHRDUNGSBEURTEILUNG",
) {
  const gefahrstoff = await prisma.gefahrstoff.findFirst({
    where: { id: gefahrstoffId, betriebId },
    include: {
      kontext: true,
      sdbDokumente: { orderBy: { versionNummer: "desc" }, take: 1 },
    },
  });
  if (!gefahrstoff) return null;

  const vorbefuellung = vorbefuellungErzeugen(
    gefahrstoff,
    gefahrstoff.kontext,
    gefahrstoff.sdbDokumente[0] ?? null,
  );

  const vorhanden = await prisma.dokument.findUnique({
    where: { gefahrstoffId_typ: { gefahrstoffId, typ } },
  });
  if (vorhanden) {
    return {
      dokument: vorhanden,
      quellen: vorbefuellung.quellen,
      weggelassen: vorbefuellung.weggelassen,
      neuVorbefuellt: false,
    };
  }

  const dokument = await prisma.dokument.create({
    data: {
      betriebId,
      gefahrstoffId,
      typ,
      inhalt: inhaltSchreiben(vorbefuellung.hatInhalt ? vorbefuellung.inhalt : LEERER_INHALT),
    },
  });

  return {
    dokument,
    quellen: vorbefuellung.quellen,
    weggelassen: vorbefuellung.weggelassen,
    neuVorbefuellt: vorbefuellung.hatInhalt,
  };
}

export { LEERE_QUELLEN };
export type { Weggelassen };
