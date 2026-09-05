import { notFound } from "next/navigation";
import { Karte, Zurueck, datumFormatieren } from "@/components/ui";
import { BA_ABSCHNITTE, DOKUMENT_TYP_LABEL, inhaltLesen } from "@/lib/dokument-inhalt";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ dokumentId: string }> }) {
  const { dokumentId } = await params;
  const dokument = await prisma.dokument.findUnique({
    where: { id: dokumentId },
    include: { gefahrstoff: { select: { name: true } } },
  });
  return {
    title: dokument ? `${DOKUMENT_TYP_LABEL[dokument.typ]} ${dokument.gefahrstoff.name}` : "Dokument",
  };
}

export default async function LeserDokument({
  params,
}: {
  params: Promise<{ token: string; dokumentId: string }>;
}) {
  const { token, dokumentId } = await params;

  const betrieb = await prisma.betrieb.findUnique({
    where: { leserToken: token },
    select: { id: true, name: true, logoUrl: true },
  });
  if (!betrieb) notFound();

  const dokument = await prisma.dokument.findFirst({
    where: { id: dokumentId, betriebId: betrieb.id, NOT: { veroeffentlichteVersion: null } },
    include: { gefahrstoff: true },
  });
  if (!dokument) notFound();

  // Deliberately the published snapshot, never the working copy.
  const inhalt = inhaltLesen(dokument.veroeffentlichterInhalt);

  return (
    <div className="space-y-6">
      <Zurueck href={`/lesen/${token}`}>Alle Dokumente von {betrieb.name}</Zurueck>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {DOKUMENT_TYP_LABEL[dokument.typ]}
          </h1>
          <p className="mt-1 text-sm text-slate-700">
            {dokument.gefahrstoff.name} · {dokument.gefahrstoff.hersteller}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Version {dokument.veroeffentlichteVersion} · veröffentlicht am{" "}
            {datumFormatieren(dokument.veroeffentlichtAm)}
          </p>
        </div>
        <a
          className="knopf-sekundaer"
          href={`/api/lesen/${token}/${dokument.id}`}
          target="_blank"
          rel="noreferrer"
        >
          Als PDF öffnen
        </a>
      </div>

      {BA_ABSCHNITTE.map((abschnitt) => (
        <Karte key={abschnitt.key} titel={abschnitt.titel}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {inhalt[abschnitt.key].trim() || "– keine Angabe –"}
          </p>
        </Karte>
      ))}
    </div>
  );
}
