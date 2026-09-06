import Link from "next/link";
import { notFound } from "next/navigation";
import { dokumentAbsenden, vorbefuellungUebernehmen } from "@/app/actions/dokument";
import { DokumentEditor } from "@/components/dokument-editor";
import { Karte, StatusMarke, Zurueck, datumFormatieren } from "@/components/ui";
import { nutzerErzwingen } from "@/lib/auth";
import { DOKUMENT_TYP_LABEL, inhaltLesen } from "@/lib/dokument-inhalt";
import { dokumentSicherstellen } from "@/lib/dokumente";
import { hinweisBilden } from "@/lib/hinweis";
import { prisma } from "@/lib/prisma";
import { offeneVorschlaege } from "@/lib/text";

const TYP_AUS_PFAD: Record<string, "BETRIEBSANWEISUNG" | "GEFAEHRDUNGSBEURTEILUNG"> = {
  betriebsanweisung: "BETRIEBSANWEISUNG",
  gefaehrdungsbeurteilung: "GEFAEHRDUNGSBEURTEILUNG",
};

export async function generateMetadata({ params }: { params: Promise<{ typ: string }> }) {
  const { typ } = await params;
  const erkannt = TYP_AUS_PFAD[typ];
  return { title: erkannt ? DOKUMENT_TYP_LABEL[erkannt] : "Dokument" };
}

export default async function DokumentSeite({
  params,
}: {
  params: Promise<{ id: string; typ: string }>;
}) {
  const nutzer = await nutzerErzwingen();
  const { id, typ } = await params;

  const dokumentTyp = TYP_AUS_PFAD[typ];
  if (!dokumentTyp) notFound();

  const gefahrstoff = await prisma.gefahrstoff.findFirst({
    where: { id, betriebId: nutzer.betriebId },
    include: {
      kontext: true,
      vorschlaege: { where: { status: "OFFEN" }, orderBy: { abschnittsNummer: "asc" } },
    },
  });
  if (!gefahrstoff) notFound();

  const ergebnis = await dokumentSicherstellen(nutzer.betriebId, gefahrstoff.id, dokumentTyp);
  if (!ergebnis) notFound();
  const { dokument, quellen, weggelassen, neuVorbefuellt } = ergebnis;

  const veroeffentlicht = Boolean(dokument.veroeffentlichteVersion);

  return (
    <div className="space-y-6">
      <Zurueck href={`/gefahrstoffe/${gefahrstoff.id}`}>Zurück zu {gefahrstoff.name}</Zurueck>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {DOKUMENT_TYP_LABEL[dokumentTyp]}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {gefahrstoff.name} · {gefahrstoff.hersteller}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {veroeffentlicht ? (
            <StatusMarke ton="gruen">
              veröffentlicht: Version {dokument.veroeffentlichteVersion} vom{" "}
              {datumFormatieren(dokument.veroeffentlichtAm)}
            </StatusMarke>
          ) : (
            <StatusMarke ton="gelb">noch nicht veröffentlicht</StatusMarke>
          )}
          {dokument.status === "ENTWURF" && veroeffentlicht ? (
            <StatusMarke ton="gelb">Entwurf mit unveröffentlichten Änderungen</StatusMarke>
          ) : null}
          {veroeffentlicht ? (
            <a
              className="text-sm font-medium text-marine-700 hover:underline"
              href={`/api/export/${dokument.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Veröffentlichte Fassung als PDF
            </a>
          ) : null}
        </div>
      </div>

      {gefahrstoff.vorschlaege.length > 0 ? (
        <Karte
          titel={offeneVorschlaege(gefahrstoff.vorschlaege.length)}
          beschreibung="Zum Einarbeiten – die Software überträgt bewusst keinen Text automatisch."
        >
          <ul className="space-y-3">
            {gefahrstoff.vorschlaege.map((vorschlag) => {
              const hinweis = hinweisBilden(vorschlag.abschnittsNummer, gefahrstoff.kontext);
              return (
                <li key={vorschlag.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-900">{hinweis.ueberschrift}</p>
                  {hinweis.betroffeneDokumentAbschnitte.length > 0 ? (
                    <p className="mt-1 text-xs text-amber-900/80">
                      Betroffene Abschnitte: {hinweis.betroffeneDokumentAbschnitte.join(", ")}
                    </p>
                  ) : null}
                  <Link
                    className="mt-1.5 inline-block text-xs font-medium text-marine-700 hover:underline"
                    href={`/gefahrstoffe/${gefahrstoff.id}/vorschlag/${vorschlag.id}`}
                  >
                    Hinweis und Diff ansehen →
                  </Link>
                </li>
              );
            })}
          </ul>
        </Karte>
      ) : null}

      <DokumentEditor
        aktion={dokumentAbsenden}
        uebernehmenAktion={vorbefuellungUebernehmen}
        dokumentId={dokument.id}
        inhalt={inhaltLesen(dokument.inhalt)}
        quellen={quellen}
        weggelassen={weggelassen}
        bereitsVeroeffentlicht={veroeffentlicht}
        vorbefuelltHinweis={neuVorbefuellt}
      />
    </div>
  );
}
