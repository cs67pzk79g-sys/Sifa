import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aktuellerNutzer } from "@/lib/auth";

/**
 * Serves stored files.
 *
 * Company logos are public because the login free reader view displays them.
 * Safety data sheets are only served to an admin of the owning company.
 */
export async function GET(_anfrage: Request, kontext: { params: Promise<{ id: string }> }) {
  const { id } = await kontext.params;

  const datei = await prisma.datei.findUnique({
    where: { id },
    include: {
      betriebLogo: { select: { id: true } },
      sdbDokument: { select: { gefahrstoff: { select: { betriebId: true } } } },
    },
  });

  if (!datei) return new NextResponse("Nicht gefunden", { status: 404 });

  const istLogo = Boolean(datei.betriebLogo);
  if (!istLogo) {
    const betriebId = datei.sdbDokument?.gefahrstoff.betriebId;
    const nutzer = await aktuellerNutzer();
    if (!betriebId || !nutzer || nutzer.betriebId !== betriebId) {
      return new NextResponse("Nicht gefunden", { status: 404 });
    }
  }

  return new NextResponse(new Uint8Array(datei.inhalt), {
    headers: {
      "Content-Type": datei.mimeTyp,
      "Content-Length": String(datei.inhalt.length),
      "Content-Disposition": `inline; filename="${encodeURIComponent(datei.dateiName)}"`,
      "Cache-Control": istLogo ? "private, max-age=300" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
