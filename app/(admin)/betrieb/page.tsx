import { headers } from "next/headers";
import { betriebAktualisieren, leserLinkErneuern, logoEntfernen, logoHochladen } from "@/app/actions/betrieb";
import { AktionsFormular, KopierKnopf } from "@/components/formular";
import { Karte } from "@/components/ui";
import { nutzerErzwingen } from "@/lib/auth";

export const metadata = { title: "Betrieb" };

async function basisAdresse(): Promise<string> {
  const kopf = await headers();
  const host = kopf.get("x-forwarded-host") ?? kopf.get("host") ?? "localhost:3000";
  const protokoll = kopf.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protokoll}://${host}`;
}

export default async function BetriebsSeite() {
  const nutzer = await nutzerErzwingen();
  const betrieb = nutzer.betrieb;
  const leserLink = `${await basisAdresse()}/lesen/${betrieb.leserToken}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Betrieb</h1>
        <p className="mt-1 text-sm text-slate-600">
          Stammdaten, Logo für den PDF-Export und der Zugang für Leser.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Karte titel="Stammdaten">
          <AktionsFormular aktion={betriebAktualisieren} absendenText="Speichern">
            <div>
              <label className="etikett" htmlFor="name">
                Name des Betriebs
              </label>
              <input className="feld" id="name" name="name" defaultValue={betrieb.name} required />
            </div>
            <div>
              <label className="etikett" htmlFor="branche">
                Branche
              </label>
              <input
                className="feld"
                id="branche"
                name="branche"
                defaultValue={betrieb.branche}
                required
              />
            </div>
          </AktionsFormular>
        </Karte>

        <Karte titel="Logo" beschreibung="Erscheint in der Kopfzeile und auf jedem PDF-Export.">
          <div className="mb-4 flex items-center gap-4">
            {betrieb.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={betrieb.logoUrl}
                alt={`Logo von ${betrieb.name}`}
                className="h-16 w-auto max-w-[180px] rounded border border-slate-200 bg-white object-contain p-1"
              />
            ) : (
              <p className="text-sm text-slate-500">Noch kein Logo hinterlegt.</p>
            )}
          </div>

          <AktionsFormular
            aktion={logoHochladen}
            absendenText="Logo hochladen"
            ladeText="Wird hochgeladen …"
          >
            <div>
              <label className="etikett" htmlFor="logo">
                PNG oder JPEG, maximal 2 MB
              </label>
              <input
                className="feld file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm"
                id="logo"
                name="logo"
                type="file"
                accept="image/png,image/jpeg"
                required
              />
            </div>
          </AktionsFormular>

          {betrieb.logoUrl ? (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <AktionsFormular
                aktion={logoEntfernen}
                absendenText="Logo entfernen"
                variante="sekundaer"
                className=""
              />
            </div>
          ) : null}
        </Karte>
      </div>

      <Karte
        titel="Leser-Zugang"
        beschreibung="Dieser Link zeigt ausschließlich veröffentlichte Dokumente – keine Entwürfe, keine offenen Vorschläge."
      >
        <div className="rounded-lg bg-slate-50 p-3">
          <code className="block break-all text-sm text-slate-800">{leserLink}</code>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <KopierKnopf wert={leserLink} />
          <a className="knopf-sekundaer" href={`/lesen/${betrieb.leserToken}`} target="_blank" rel="noreferrer">
            Leser-Ansicht öffnen
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Wer den Link erhält, entscheiden Sie als Unternehmer. Die Software führt bewusst keine
          Nutzerverwaltung für Leser. Geben Sie den Link nur an Beschäftigte weiter, die die
          Dokumente einsehen sollen.
        </p>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <AktionsFormular
            aktion={leserLinkErneuern}
            absendenText="Neuen Link erzeugen"
            variante="sekundaer"
            className=""
          />
          <p className="mt-2 text-xs text-slate-500">
            Erzeugt einen neuen Link. Der bisherige Link ist danach ungültig.
          </p>
        </div>
      </Karte>
    </div>
  );
}
