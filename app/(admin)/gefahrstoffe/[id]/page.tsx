import Link from "next/link";
import { notFound } from "next/navigation";
import {
  gefahrstoffAktualisieren,
  gefahrstoffLoeschen,
  sdbHochladen,
} from "@/app/actions/gefahrstoff";
import { AktionsFormular, BestaetigenKnopf } from "@/components/formular";
import {
  Ampel,
  Beschriftet,
  Erfolg,
  Karte,
  Leer,
  StatusMarke,
  Zurueck,
  datumFormatieren,
  datumZeitFormatieren,
} from "@/components/ui";
import { nutzerErzwingen } from "@/lib/auth";
import { ampelBerechnen } from "@/lib/ampel";
import { DOKUMENT_TYP_LABEL } from "@/lib/dokument-inhalt";
import { prisma } from "@/lib/prisma";
import { abschnittDefinition } from "@/lib/sdb-abschnitte";
import { kontextSchritte } from "@/lib/validation";

const KONTEXT_LABEL: Record<(typeof kontextSchritte)[number], string> = {
  taetigkeit: "Tätigkeit",
  arbeitsbereich: "Arbeitsbereich",
  mengeHaeufigkeit: "Menge / Häufigkeit",
  vorhandeneSchutzmassnahmen: "Vorhandene Schutzmaßnahmen",
  raeumlicheGegebenheiten: "Räumliche Gegebenheiten",
};

const DOKUMENT_TYPEN = ["BETRIEBSANWEISUNG", "GEFAEHRDUNGSBEURTEILUNG"] as const;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gefahrstoff = await prisma.gefahrstoff.findUnique({ where: { id }, select: { name: true } });
  return { title: gefahrstoff?.name ?? "Gefahrstoff" };
}

export default async function GefahrstoffDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const nutzer = await nutzerErzwingen();
  const { id } = await params;
  const anfrage = await searchParams;

  const gefahrstoff = await prisma.gefahrstoff.findFirst({
    where: { id, betriebId: nutzer.betriebId },
    include: {
      kontext: true,
      sdbDokumente: { orderBy: { versionNummer: "desc" } },
      dokumente: true,
      vorschlaege: {
        orderBy: [{ status: "asc" }, { abschnittsNummer: "asc" }],
        include: { neueSdb: true, alteSdb: true },
      },
    },
  });
  if (!gefahrstoff) notFound();

  const offene = gefahrstoff.vorschlaege.filter((v) => v.status === "OFFEN");
  const geprueft = gefahrstoff.vorschlaege.filter((v) => v.status !== "OFFEN");
  const betriebsanweisung = gefahrstoff.dokumente.find((d) => d.typ === "BETRIEBSANWEISUNG");

  const ampel = ampelBerechnen({
    offeneAbschnitte: offene.map((v) => v.abschnittsNummer),
    hatVeroeffentlichtesDokument: Boolean(betriebsanweisung?.veroeffentlichteVersion),
    hatUnveroeffentlichteAenderung: gefahrstoff.dokumente.some(
      (d) => d.status === "ENTWURF" && d.veroeffentlichteVersion !== null,
    ),
  });

  const kontextFelder = kontextSchritte.map((feld) => ({
    feld,
    label: KONTEXT_LABEL[feld],
    wert: String(gefahrstoff.kontext?.[feld] ?? "").trim(),
  }));
  const kontextOffen = kontextFelder.filter((f) => f.wert === "").length;

  return (
    <div className="space-y-6">
      <Zurueck href="/gefahrstoffe">Alle Gefahrstoffe</Zurueck>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{gefahrstoff.name}</h1>
          <p className="mt-1 text-sm text-slate-600">{gefahrstoff.hersteller}</p>
        </div>
        <div className="text-right">
          <Ampel farbe={ampel.farbe} />
          <p className="mt-1 max-w-xs text-xs text-slate-500">{ampel.begruendung}</p>
        </div>
      </div>

      {anfrage.kontext === "fertig" ? (
        <Erfolg>Betrieblicher Kontext gespeichert. Er fließt jetzt in jeden Änderungshinweis ein.</Erfolg>
      ) : null}
      {anfrage.vorschlag === "geprueft" ? <Erfolg>Der Vorschlag wurde als geprüft markiert.</Erfolg> : null}
      {anfrage.dokument === "veroeffentlicht" ? (
        <Erfolg>Dokument veröffentlicht. Es ist jetzt über den Leser-Link sichtbar.</Erfolg>
      ) : null}

      <Karte
        titel="Offene Änderungsvorschläge"
        beschreibung="Automatisch aus dem Versionsvergleich abgeleitet – jeder Punkt muss von Ihnen geprüft werden."
      >
        {offene.length === 0 ? (
          <Leer>Keine offenen Vorschläge.</Leer>
        ) : (
          <ul className="divide-y divide-slate-200">
            {offene.map((vorschlag) => {
              const definition = abschnittDefinition(vorschlag.abschnittsNummer);
              return (
                <li key={vorschlag.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <Link
                      href={`/gefahrstoffe/${gefahrstoff.id}/vorschlag/${vorschlag.id}`}
                      className="text-sm font-semibold text-marine-700 hover:underline"
                    >
                      Abschnitt {vorschlag.abschnittsNummer}: {definition.kurz}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Version {vorschlag.alteSdb.versionNummer} → {vorschlag.neueSdb.versionNummer},
                      erkannt am {datumFormatieren(vorschlag.erstelltAm)}
                    </p>
                  </div>
                  <StatusMarke ton={definition.relevanz === "HOCH" ? "rot" : "gelb"}>
                    {definition.relevanz === "HOCH" ? "Sicherheitsrelevant" : "Prüfenswert"}
                  </StatusMarke>
                </li>
              );
            })}
          </ul>
        )}

        {geprueft.length > 0 ? (
          <details className="mt-4 border-t border-slate-200 pt-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">
              Bereits geprüft ({geprueft.length})
            </summary>
            <ul className="mt-2 divide-y divide-slate-200">
              {geprueft.map((vorschlag) => (
                <li key={vorschlag.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                  <Link
                    href={`/gefahrstoffe/${gefahrstoff.id}/vorschlag/${vorschlag.id}`}
                    className="text-sm text-marine-700 hover:underline"
                  >
                    Abschnitt {vorschlag.abschnittsNummer}: {abschnittDefinition(vorschlag.abschnittsNummer).kurz}
                  </Link>
                  <StatusMarke ton={vorschlag.status === "GEPRUEFT_UEBERNOMMEN" ? "gruen" : "neutral"}>
                    {vorschlag.status === "GEPRUEFT_UEBERNOMMEN" ? "übernommen" : "verworfen"}
                  </StatusMarke>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </Karte>

      <div className="grid gap-6 lg:grid-cols-2">
        <Karte
          titel="Betrieblicher Kontext"
          beschreibung="Diese Angaben machen aus einer allgemeinen SDB-Änderung einen Hinweis für Ihren Betrieb."
          aktion={
            <Link className="knopf-sekundaer" href={`/gefahrstoffe/${gefahrstoff.id}/kontext`}>
              {gefahrstoff.kontext ? "Kontext bearbeiten" : "Kontext erfassen"}
            </Link>
          }
        >
          {kontextOffen === kontextSchritte.length ? (
            <Leer>
              Noch nichts erfasst. Ohne Kontext bleiben Änderungshinweise allgemein und ohne Bezug zu
              Ihren Tätigkeiten.
            </Leer>
          ) : (
            <>
              {kontextOffen > 0 ? (
                <p className="hinweis-box mb-3 border-amber-200 bg-amber-50 text-amber-900">
                  {kontextOffen} von {kontextSchritte.length} Angaben fehlen noch.
                </p>
              ) : null}
              <dl className="space-y-3">
                {kontextFelder.map((feld) => (
                  <Beschriftet
                    key={feld.feld}
                    label={feld.label}
                    wert={feld.wert || <span className="text-slate-400">– nicht erfasst –</span>}
                  />
                ))}
              </dl>
            </>
          )}
        </Karte>

        <Karte
          titel="Sicherheitsdatenblätter"
          beschreibung="Bei jeder neuen Lieferung das aktuelle SDB hochladen – der Vergleich startet automatisch."
        >
          <AktionsFormular
            aktion={sdbHochladen}
            absendenText={gefahrstoff.sdbDokumente.length === 0 ? "SDB hochladen" : "Neue Version hochladen"}
            ladeText="PDF wird ausgewertet …"
          >
            <input type="hidden" name="gefahrstoffId" value={gefahrstoff.id} />
            <div>
              <label className="etikett" htmlFor="sdb">
                Sicherheitsdatenblatt (PDF, textbasiert, max. 10 MB)
              </label>
              <input
                className="feld file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm"
                id="sdb"
                name="sdb"
                type="file"
                accept="application/pdf"
                required
              />
            </div>
          </AktionsFormular>

          <ul className="mt-5 divide-y divide-slate-200 border-t border-slate-200">
            {gefahrstoff.sdbDokumente.length === 0 ? (
              <Leer>Noch kein Sicherheitsdatenblatt hochgeladen.</Leer>
            ) : (
              gefahrstoff.sdbDokumente.map((sdb, index) => {
                const vorgaenger = gefahrstoff.sdbDokumente[index + 1];
                return (
                  <li key={sdb.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Version {sdb.versionNummer}
                        {index === 0 ? <span className="ml-2 text-xs text-emerald-700">aktuell</span> : null}
                      </p>
                      <p className="text-xs text-slate-500">
                        {datumZeitFormatieren(sdb.hochgeladenAm)} · {sdb.erkannteAbschnitte} von 16
                        Abschnitten erkannt
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <a className="text-marine-700 hover:underline" href={sdb.dateiUrl} target="_blank" rel="noreferrer">
                        PDF
                      </a>
                      {vorgaenger ? (
                        <Link
                          className="text-marine-700 hover:underline"
                          href={`/gefahrstoffe/${gefahrstoff.id}/vergleich?alt=${vorgaenger.id}&neu=${sdb.id}`}
                        >
                          Vergleich
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </Karte>
      </div>

      <Karte titel="Dokumente" beschreibung="Nach TRGS 555 gegliedert. Veröffentlichen erfolgt immer manuell.">
        <ul className="grid gap-4 sm:grid-cols-2">
          {DOKUMENT_TYPEN.map((typ) => {
            const dokument = gefahrstoff.dokumente.find((d) => d.typ === typ);
            const veroeffentlicht = Boolean(dokument?.veroeffentlichteVersion);
            return (
              <li key={typ} className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{DOKUMENT_TYP_LABEL[typ]}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {!dokument ? (
                    <StatusMarke ton="neutral">noch nicht angelegt</StatusMarke>
                  ) : veroeffentlicht ? (
                    <StatusMarke ton="gruen">
                      veröffentlicht (Version {dokument.veroeffentlichteVersion})
                    </StatusMarke>
                  ) : (
                    <StatusMarke ton="gelb">Entwurf</StatusMarke>
                  )}
                  {dokument && veroeffentlicht && dokument.status === "ENTWURF" ? (
                    <StatusMarke ton="gelb">unveröffentlichte Änderungen</StatusMarke>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {dokument?.veroeffentlichtAm
                    ? `Zuletzt veröffentlicht am ${datumFormatieren(dokument.veroeffentlichtAm)}`
                    : "Noch nie veröffentlicht"}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <Link
                    className="font-medium text-marine-700 hover:underline"
                    href={`/gefahrstoffe/${gefahrstoff.id}/dokument/${typ.toLowerCase()}`}
                  >
                    Bearbeiten
                  </Link>
                  {dokument && veroeffentlicht ? (
                    <a
                      className="font-medium text-marine-700 hover:underline"
                      href={`/api/export/${dokument.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      PDF-Export
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Karte>

      <details className="karte px-5 py-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          Stammdaten des Gefahrstoffs bearbeiten
        </summary>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <AktionsFormular aktion={gefahrstoffAktualisieren} absendenText="Speichern">
            <input type="hidden" name="gefahrstoffId" value={gefahrstoff.id} />
            <div>
              <label className="etikett" htmlFor="stamm-name">
                Name
              </label>
              <input className="feld" id="stamm-name" name="name" defaultValue={gefahrstoff.name} required />
            </div>
            <div>
              <label className="etikett" htmlFor="stamm-hersteller">
                Hersteller
              </label>
              <input
                className="feld"
                id="stamm-hersteller"
                name="hersteller"
                defaultValue={gefahrstoff.hersteller}
                required
              />
            </div>
          </AktionsFormular>

          <form action={gefahrstoffLoeschen} className="self-end">
            <input type="hidden" name="gefahrstoffId" value={gefahrstoff.id} />
            <BestaetigenKnopf
              text="Gefahrstoff löschen"
              frage="Gefahrstoff wirklich löschen? Sicherheitsdatenblätter, Kontext, Vorschläge und Dokumente werden mitgelöscht."
            />
            <p className="mt-2 text-xs text-slate-500">
              Löscht auch alle hochgeladenen Sicherheitsdatenblätter und Dokumente dieses Stoffs.
            </p>
          </form>
        </div>
      </details>
    </div>
  );
}
