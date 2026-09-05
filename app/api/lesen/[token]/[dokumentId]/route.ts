import { NextResponse } from "next/server";
import { veroeffentlichteExportDaten } from "@/lib/export-daten";
import { dokumentAlsPdf } from "@/lib/pdf-export";
import { prisma } from "@/lib/prisma";

/**
 * PDF export for the login free reader link. Serves the published version only
 * and just for documents belonging to the company the token points at.
 */
export async function GET(
  _anfrage: Request,
  kontext: { params: Promise<{ token: string; dokumentId: string }> },
) {
  const { token, dokumentId } = await kontext.params;

  const betrieb = await prisma.betrieb.findUnique({
    where: { leserToken: token },
    select: { id: true },
  });
  if (!betrieb) return new NextResponse("Nicht gefunden", { status: 404 });

  const dokument = await prisma.dokument.findFirst({
    where: {
      id: dokumentId,
      betriebId: betrieb.id,
      status: { in: ["ENTWURF", "VEROEFFENTLICHT"] },
      NOT: { veroeffentlichteVersion: null },
    },
    select: { id: true },
  });
  if (!dokument) return new NextResponse("Nicht gefunden", { status: 404 });

  const daten = await veroeffentlichteExportDaten(dokument.id);
  if (!daten) return new NextResponse("Nicht gefunden", { status: 404 });

  const pdf = await dokumentAlsPdf(daten);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${daten.dateiName}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
