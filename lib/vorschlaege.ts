// Also used by the seed script, therefore no "server-only" guard.
import { prisma } from "./prisma";
import { sdbVergleichen } from "./diff-service";

/**
 * Compares a newly uploaded SDB version with its predecessor and stores one
 * change suggestion per changed section.
 *
 * Nothing is applied anywhere - the rows are suggestions with status OFFEN that
 * a person has to review.
 */
export async function vorschlaegeErzeugen(
  gefahrstoffId: string,
  alteSdbId: string,
  neueSdbId: string,
): Promise<number> {
  const [alt, neu] = await Promise.all([
    prisma.sdbDokument.findUnique({ where: { id: alteSdbId } }),
    prisma.sdbDokument.findUnique({ where: { id: neueSdbId } }),
  ]);
  if (!alt || !neu) return 0;

  const vergleiche = sdbVergleichen(alt.abschnitte, neu.abschnitte).filter((v) => v.geaendert);
  if (vergleiche.length === 0) return 0;

  await prisma.aenderungsvorschlag.createMany({
    data: vergleiche.map((vergleich) => ({
      gefahrstoffId,
      alteSdbId,
      neueSdbId,
      abschnittsNummer: vergleich.nummer,
      diffText: JSON.stringify(vergleich.teile),
    })),
  });

  return vergleiche.length;
}
