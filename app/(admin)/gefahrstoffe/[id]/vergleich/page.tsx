import Link from "next/link";
import { notFound } from "next/navigation";
import { DiffAnsicht } from "@/components/diff-ansicht";
import { Karte, StatusMarke, VorschlagBanner, Zurueck, datumZeitFormatieren } from "@/components/ui";
import { nutzerErzwingen } from "@/lib/auth";
import { sdbVergleichen } from "@/lib/diff-service";
import { prisma } from "@/lib/prisma";
import { abschnittDefinition } from "@/lib/sdb-abschnitte";

export const metadata = { title: "Versionsvergleich" };

export default async function VergleichsSeite({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ alt?: string; neu?: string }>;
}) {
  const nutzer = await nutzerErzwingen();
  const { id } = await params;
  const { alt: altId, neu: neuId } = await searchParams;

  const gefahrstoff = await prisma.gefahrstoff.findFirst({
    where: { id, betriebId: nutzer.betriebId },
    include: { sdbDokumente: { orderBy: { versionNummer: "desc" } } },
  });
  if (!gefahrstoff) notFound();

  const neu =
    gefahrstoff.sdbDokumente.find((s) => s.id === neuId) ?? gefahrstoff.sdbDokumente[0];
  const alt =
    gefahrstoff.sdbDokumente.find((s) => s.id === altId) ?? gefahrstoff.sdbDokumente[1];

  if (!alt || !neu || alt.id === neu.id) {
    return (
      <div className="space-y-5">
        <Zurueck href={`/gefahrstoffe/${gefahrstoff.id}`}>Zurück zu {gefahrstoff.name}</Zurueck>
        <Karte titel="Versionsvergleich">
          <p className="text-sm text-slate-600">
            Für einen Vergleich werden zwei Versionen des Sicherheitsdatenblatts benötigt. Laden Sie
            eine weitere Version hoch, sobald der Hersteller ein aktualisiertes SDB mitliefert.
          </p>
        </Karte>
      </div>
    );
  }

  const vergleiche = sdbVergleichen(alt.abschnitte, neu.abschnitte);
  const geaendert = vergleiche.filter((v) => v.geaendert);

  const vorschlaege = await prisma.aenderungsvorschlag.findMany({
    where: { alteSdbId: alt.id, neueSdbId: neu.id },
  });
  const vorschlagJeAbschnitt = new Map(vorschlaege.map((v) => [v.abschnittsNummer, v]));

  return (
    <div className="space-y-6">
      <Zurueck href={`/gefahrstoffe/${gefahrstoff.id}`}>Zurück zu {gefahrstoff.name}</Zurueck>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Versionsvergleich: {gefahrstoff.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Version {alt.versionNummer} ({datumZeitFormatieren(alt.hochgeladenAm)}) → Version{" "}
          {neu.versionNummer} ({datumZeitFormatieren(neu.hochgeladenAm)})
        </p>
      </div>

      <VorschlagBanner />

      <Karte titel={`Übersicht über alle 16 Abschnitte – ${geaendert.length} geändert`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Abschnitt
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Titel
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Status
                </th>
                <th scope="col" className="py-2 font-medium">
                  Einstufung
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vergleiche.map((vergleich) => {
                const definition = abschnittDefinition(vergleich.nummer);
                const vorschlag = vorschlagJeAbschnitt.get(vergleich.nummer);
                return (
                  <tr key={vergleich.nummer} className={vergleich.geaendert ? "bg-amber-50/60" : ""}>
                    <td className="py-2.5 pr-3 font-medium text-slate-900">{vergleich.nummer}</td>
                    <td className="py-2.5 pr-3 text-slate-700">
                      {vorschlag ? (
                        <Link
                          className="text-marine-700 hover:underline"
                          href={`/gefahrstoffe/${gefahrstoff.id}/vorschlag/${vorschlag.id}`}
                        >
                          {definition.kurz}
                        </Link>
                      ) : (
                        definition.kurz
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      {vergleich.geaendert ? (
                        <StatusMarke ton="gelb">geändert</StatusMarke>
                      ) : (
                        <span className="text-xs text-slate-400">unverändert</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs text-slate-500">
                        {definition.relevanz === "HOCH"
                          ? "sicherheitsrelevant"
                          : definition.relevanz === "MITTEL"
                            ? "prüfenswert"
                            : "formal"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Karte>

      {geaendert.length === 0 ? (
        <Karte titel="Keine inhaltlichen Unterschiede">
          <p className="text-sm text-slate-600">
            Zwischen den beiden Versionen wurde in keinem der 16 Abschnitte eine Textänderung
            gefunden. Reine Layout- oder Datumsänderungen erkennt der Vergleich bewusst nicht.
          </p>
        </Karte>
      ) : (
        geaendert.map((vergleich) => {
          const definition = abschnittDefinition(vergleich.nummer);
          const vorschlag = vorschlagJeAbschnitt.get(vergleich.nummer);
          return (
            <Karte
              key={vergleich.nummer}
              titel={`Abschnitt ${vergleich.nummer}: ${definition.titel}`}
              aktion={
                vorschlag ? (
                  <Link
                    className="knopf-sekundaer"
                    href={`/gefahrstoffe/${gefahrstoff.id}/vorschlag/${vorschlag.id}`}
                  >
                    Hinweis und Prüfung öffnen
                  </Link>
                ) : null
              }
            >
              <DiffAnsicht teile={vergleich.teile} />
            </Karte>
          );
        })
      )}
    </div>
  );
}
