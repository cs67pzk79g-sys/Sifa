import { NextResponse } from "next/server";
import { aktuellerNutzer } from "@/lib/auth";
import { veroeffentlichteExportDaten } from "@/lib/export-daten";
import { dokumentAlsPdf } from "@/lib/pdf-export";
import { prisma } from "@/lib/prisma";

/** PDF export for admins. Only the published version is exported. */
export async function GET(
  _anfrage: Request,
  kontext: { params: Promise<{ dokumentId: string }> },
) {
  const nutzer = await aktuellerNutzer();
  if (!nutzer) return new NextResponse("Nicht angemeldet", { status: 401 });

  const { dokumentId } = await kontext.params;
  const dokument = await prisma.dokument.findFirst({
    where: { id: dokumentId, betriebId: nutzer.betriebId },
    select: { id: true },
  });
  if (!dokument) return new NextResponse("Nicht gefunden", { status: 404 });

  const daten = await veroeffentlichteExportDaten(dokument.id);
  if (!daten) {
    return new NextResponse(
      "Dieses Dokument wurde noch nicht veröffentlicht. Nur veröffentlichte Fassungen können exportiert werden.",
      { status: 409 },
    );
  }

  const pdf = await dokumentAlsPdf(daten);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${daten.dateiName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
