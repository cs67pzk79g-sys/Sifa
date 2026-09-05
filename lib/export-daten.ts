import "server-only";
import { prisma } from "./prisma";
import { DOKUMENT_TYP_LABEL, inhaltLesen } from "./dokument-inhalt";
import type { ExportDaten } from "./pdf-export";

/**
 * Builds the export payload from the *published* version of a document.
 * Drafts are never exported - neither for admins nor for readers.
 */
export async function veroeffentlichteExportDaten(dokumentId: string): Promise<
  (ExportDaten & { dateiName: string }) | null
> {
  const dokument = await prisma.dokument.findUnique({
    where: { id: dokumentId },
    include: {
      gefahrstoff: true,
      betrieb: { include: { logo: true } },
    },
  });

  if (!dokument || !dokument.veroeffentlichterInhalt || !dokument.veroeffentlichteVersion) {
    return null;
  }

  const typLabel = DOKUMENT_TYP_LABEL[dokument.typ] ?? "Dokument";
  const dateiName = `${typLabel}-${dokument.gefahrstoff.name}-v${dokument.veroeffentlichteVersion}.pdf`
    .replace(/[^\w.\-]+/g, "_");

  return {
    betriebName: dokument.betrieb.name,
    branche: dokument.betrieb.branche,
    gefahrstoffName: dokument.gefahrstoff.name,
    hersteller: dokument.gefahrstoff.hersteller,
    typLabel,
    version: dokument.veroeffentlichteVersion,
    veroeffentlichtAm: dokument.veroeffentlichtAm,
    inhalt: inhaltLesen(dokument.veroeffentlichterInhalt),
    logo: dokument.betrieb.logo
      ? { daten: Buffer.from(dokument.betrieb.logo.inhalt), mimeTyp: dokument.betrieb.logo.mimeTyp }
      : null,
    dateiName,
  };
}
