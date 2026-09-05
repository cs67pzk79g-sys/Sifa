import Link from "next/link";
import { notFound } from "next/navigation";
import { Karte, Leer, datumFormatieren } from "@/components/ui";
import { DOKUMENT_TYP_LABEL } from "@/lib/dokument-inhalt";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Betriebsanweisungen" };

/**
 * Login free reader view. It only ever queries documents that carry a published
 * version - drafts and open change suggestions are not part of this query.
 */
export default async function LeserUebersicht({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const betrieb = await prisma.betrieb.findUnique({
    where: { leserToken: token },
    include: {
      dokumente: {
        where: { NOT: { veroeffentlichteVersion: null } },
        include: { gefahrstoff: true },
        orderBy: [{ gefahrstoff: { name: "asc" } }, { typ: "asc" }],
      },
    },
  });
  if (!betrieb) notFound();

  const nachGefahrstoff = new Map<string, typeof betrieb.dokumente>();
  for (const dokument of betrieb.dokumente) {
    const liste = nachGefahrstoff.get(dokument.gefahrstoffId) ?? [];
    liste.push(dokument);
    nachGefahrstoff.set(dokument.gefahrstoffId, liste);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {betrieb.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={betrieb.logoUrl}
            alt={`Logo von ${betrieb.name}`}
            className="h-12 w-auto max-w-[140px] object-contain"
          />
        ) : null}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{betrieb.name}</h1>
          <p className="text-sm text-slate-600">Betriebsanweisungen und Gefährdungsbeurteilungen</p>
        </div>
      </div>

      <p className="hinweis-box border-slate-200 bg-white text-slate-600">
        Diese Ansicht zeigt ausschließlich die jeweils zuletzt veröffentlichte Fassung. Entwürfe und
        noch nicht geprüfte Änderungen sind hier bewusst nicht sichtbar.
      </p>

      {nachGefahrstoff.size === 0 ? (
        <Karte titel="Noch keine veröffentlichten Dokumente">
          <Leer>
            Sobald der Betrieb eine Betriebsanweisung veröffentlicht, erscheint sie an dieser Stelle.
          </Leer>
        </Karte>
      ) : (
        [...nachGefahrstoff.values()].map((dokumente) => (
          <Karte
            key={dokumente[0].gefahrstoffId}
            titel={dokumente[0].gefahrstoff.name}
            beschreibung={dokumente[0].gefahrstoff.hersteller}
          >
            <ul className="divide-y divide-slate-200">
              {dokumente.map((dokument) => (
                <li key={dokument.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <Link
                      href={`/lesen/${token}/${dokument.id}`}
                      className="text-sm font-semibold text-marine-700 hover:underline"
                    >
                      {DOKUMENT_TYP_LABEL[dokument.typ]}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Version {dokument.veroeffentlichteVersion} · veröffentlicht am{" "}
                      {datumFormatieren(dokument.veroeffentlichtAm)}
                    </p>
                  </div>
                  <a
                    className="text-sm font-medium text-marine-700 hover:underline"
                    href={`/api/lesen/${token}/${dokument.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    PDF
                  </a>
                </li>
              ))}
            </ul>
          </Karte>
        ))
      )}
    </div>
  );
}
