import Link from "next/link";
import { Ampel, Karte, Leer, StatusMarke, datumFormatieren } from "@/components/ui";
import { AMPEL_STIL, type AmpelFarbe } from "@/lib/ampel";
import { nutzerErzwingen } from "@/lib/auth";
import { offeneVorschlaege, plural, sdbVersionen } from "@/lib/text";
import { gefahrstoffeMitStatus } from "@/lib/uebersicht";

export const metadata = { title: "Übersicht" };

const REIHENFOLGE: AmpelFarbe[] = ["ROT", "GELB", "GRUEN"];

export default async function Dashboard() {
  const nutzer = await nutzerErzwingen();
  const gefahrstoffe = await gefahrstoffeMitStatus(nutzer.betriebId);

  const zaehler = REIHENFOLGE.map((farbe) => ({
    farbe,
    anzahl: gefahrstoffe.filter((g) => g.ampel.farbe === farbe).length,
  }));

  const sortiert = [...gefahrstoffe].sort(
    (a, b) => REIHENFOLGE.indexOf(a.ampel.farbe) - REIHENFOLGE.indexOf(b.ampel.farbe),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Übersicht</h1>
          <p className="mt-1 text-sm text-slate-600">
            Wo besteht Handlungsbedarf? Rot und Gelb zuerst.
          </p>
        </div>
        <Link className="knopf-primaer" href="/gefahrstoffe">
          Gefahrstoff anlegen
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {zaehler.map(({ farbe, anzahl }) => {
          const stil = AMPEL_STIL[farbe];
          return (
            <div key={farbe} className={`rounded-xl border p-4 ${stil.hintergrund}`}>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${stil.punkt}`} aria-hidden="true" />
                <span className={`text-sm font-semibold ${stil.text}`}>{stil.label}</span>
              </div>
              <p className={`mt-2 text-3xl font-semibold ${stil.text}`}>{anzahl}</p>
              <p className="mt-1 text-xs text-slate-600">
                {farbe === "ROT"
                  ? "Sicherheitsrelevante Änderung offen oder keine Betriebsanweisung veröffentlicht"
                  : farbe === "GELB"
                    ? "Offene Vorschläge oder unveröffentlichte Entwürfe"
                    : "Alles geprüft und veröffentlicht"}
              </p>
            </div>
          );
        })}
      </div>

      <Karte titel="Gefahrstoffe">
        {sortiert.length === 0 ? (
          <Leer>
            Noch kein Gefahrstoff angelegt.{" "}
            <Link className="font-medium text-marine-700 underline" href="/gefahrstoffe">
              Jetzt den ersten anlegen
            </Link>
            .
          </Leer>
        ) : (
          <ul className="divide-y divide-slate-200">
            {sortiert.map((gefahrstoff) => (
              <li key={gefahrstoff.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/gefahrstoffe/${gefahrstoff.id}`}
                      className="text-sm font-semibold text-marine-700 hover:underline"
                    >
                      {gefahrstoff.name}
                    </Link>
                    <p className="text-sm text-slate-600">{gefahrstoff.hersteller}</p>
                    <p className="mt-1 text-xs text-slate-500">{gefahrstoff.ampel.begruendung}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusMarke ton="neutral">{sdbVersionen(gefahrstoff.sdbVersionen)}</StatusMarke>
                      <StatusMarke ton={gefahrstoff.kontextVollstaendig ? "gruen" : "gelb"}>
                        Kontext {gefahrstoff.kontextAusgefuellteFelder}/5
                      </StatusMarke>
                      {gefahrstoff.letzterUpload ? (
                        <StatusMarke ton="neutral">
                          letztes SDB {datumFormatieren(gefahrstoff.letzterUpload)}
                        </StatusMarke>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Ampel farbe={gefahrstoff.ampel.farbe} klein />
                    {gefahrstoff.offeneVorschlaege > 0 ? (
                      <Link
                        href={`/gefahrstoffe/${gefahrstoff.id}`}
                        className="text-xs font-medium text-marine-700 hover:underline"
                      >
                        {offeneVorschlaege(gefahrstoff.offeneVorschlaege)} prüfen →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Karte>
    </div>
  );
}
