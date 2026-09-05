import Link from "next/link";
import { gefahrstoffAnlegen } from "@/app/actions/gefahrstoff";
import { AktionsFormular } from "@/components/formular";
import { Ampel, Karte, Leer, StatusMarke, datumFormatieren } from "@/components/ui";
import { nutzerErzwingen } from "@/lib/auth";
import { offeneVorschlaege, sdbVersionen } from "@/lib/text";
import { gefahrstoffeMitStatus } from "@/lib/uebersicht";

export const metadata = { title: "Gefahrstoffe" };

export default async function GefahrstoffListe() {
  const nutzer = await nutzerErzwingen();
  const gefahrstoffe = await gefahrstoffeMitStatus(nutzer.betriebId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Gefahrstoffe</h1>
        <p className="mt-1 text-sm text-slate-600">
          Jeder Gefahrstoff trägt seine Sicherheitsdatenblätter, den betrieblichen Kontext und die
          zugehörigen Dokumente.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Karte titel={`Angelegte Gefahrstoffe (${gefahrstoffe.length})`}>
            {gefahrstoffe.length === 0 ? (
              <Leer>
                Noch kein Gefahrstoff angelegt. Legen Sie rechts den ersten an und laden Sie
                anschließend das Sicherheitsdatenblatt hoch.
              </Leer>
            ) : (
              <ul className="divide-y divide-slate-200">
                {gefahrstoffe.map((gefahrstoff) => (
                  <li key={gefahrstoff.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/gefahrstoffe/${gefahrstoff.id}`}
                          className="text-sm font-semibold text-marine-700 hover:underline"
                        >
                          {gefahrstoff.name}
                        </Link>
                        <p className="text-sm text-slate-600">{gefahrstoff.hersteller}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {gefahrstoff.sdbVersionen === 0
                            ? "Noch kein Sicherheitsdatenblatt"
                            : `${sdbVersionen(gefahrstoff.sdbVersionen)}, zuletzt ${datumFormatieren(
                                gefahrstoff.letzterUpload,
                              )}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Ampel farbe={gefahrstoff.ampel.farbe} klein />
                        {gefahrstoff.offeneVorschlaege > 0 ? (
                          <StatusMarke ton="gelb">
                            {offeneVorschlaege(gefahrstoff.offeneVorschlaege)}
                          </StatusMarke>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Karte>
        </div>

        <Karte titel="Neuen Gefahrstoff anlegen">
          <AktionsFormular aktion={gefahrstoffAnlegen} absendenText="Anlegen" ladeText="Wird angelegt …">
            <div>
              <label className="etikett" htmlFor="name">
                Name / Handelsname
              </label>
              <input
                className="feld"
                id="name"
                name="name"
                required
                maxLength={200}
                placeholder="z. B. Bremsenreiniger XY"
              />
            </div>
            <div>
              <label className="etikett" htmlFor="hersteller">
                Hersteller
              </label>
              <input className="feld" id="hersteller" name="hersteller" required maxLength={200} />
            </div>
          </AktionsFormular>
        </Karte>
      </div>
    </div>
  );
}
