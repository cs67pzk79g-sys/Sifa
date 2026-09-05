import "server-only";
import { prisma } from "./prisma";
import { LEERER_INHALT, inhaltSchreiben } from "./dokument-inhalt";

/**
 * Returns the document of the given type, creating an empty one on first use so
 * that the editor always has a row to work on.
 */
export async function dokumentSicherstellen(
  betriebId: string,
  gefahrstoffId: string,
  typ: "BETRIEBSANWEISUNG" | "GEFAEHRDUNGSBEURTEILUNG",
) {
  const gefahrstoff = await prisma.gefahrstoff.findFirst({
    where: { id: gefahrstoffId, betriebId },
  });
  if (!gefahrstoff) return null;

  const vorhanden = await prisma.dokument.findUnique({
    where: { gefahrstoffId_typ: { gefahrstoffId, typ } },
  });
  if (vorhanden) return vorhanden;

  return prisma.dokument.create({
    data: {
      betriebId,
      gefahrstoffId,
      typ,
      inhalt: inhaltSchreiben(LEERER_INHALT),
    },
  });
}
