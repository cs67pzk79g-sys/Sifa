import Link from "next/link";

export const metadata = { title: "Datenschutz" };

/**
 * Draft privacy policy describing what this prototype actually processes.
 * Operator specific data (controller, hosting provider, retention) must be
 * filled in before going live.
 */
export default function Datenschutz() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link className="text-sm font-medium text-marine-700 hover:underline" href="/">
        ← Zur Anwendung
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Datenschutzerklärung</h1>

      <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Achtung – ungeprüfter Entwurf mit Platzhaltern.</strong> Der Text beschreibt die
        Verarbeitungen dieses Prototyps. Verantwortlicher, Hosting-Dienstleister, Löschfristen und
        gegebenenfalls ein Auftragsverarbeitungsvertrag sind vor dem Produktivbetrieb zu ergänzen und
        anwaltlich bzw. datenschutzrechtlich zu prüfen.
      </p>

      <section className="mt-6 space-y-5 text-sm leading-relaxed text-slate-800">
        <div>
          <h2 className="font-semibold text-slate-900">1. Verantwortlicher</h2>
          <p>[BITTE ERGÄNZEN: Name, Anschrift und Kontakt des Verantwortlichen]</p>
          <p>[BITTE ERGÄNZEN: Datenschutzbeauftragter, falls benannt]</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">2. Verarbeitete Daten</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              <strong>Zugangsdaten der Administratoren:</strong> E-Mail-Adresse und Passwort. Das
              Passwort wird ausschließlich als bcrypt-Hash gespeichert, niemals im Klartext.
            </li>
            <li>
              <strong>Betriebsdaten:</strong> Name des Betriebs, Branche, optional ein Firmenlogo.
            </li>
            <li>
              <strong>Inhaltsdaten:</strong> Gefahrstoffe, hochgeladene Sicherheitsdatenblätter
              (PDF), betrieblicher Kontext, Betriebsanweisungen und Gefährdungsbeurteilungen. Diese
              Angaben sollten keine personenbezogenen Daten einzelner Beschäftigter enthalten.
            </li>
            <li>
              <strong>Sitzungs-Cookie:</strong> ein technisch notwendiges Cookie
              (<code>as_session</code>), das die Anmeldung aufrechterhält. Es enthält eine signierte
              Kennung des Nutzerkontos, läuft nach sieben Tagen ab und dient nicht der Analyse.
            </li>
            <li>
              <strong>Server-Logs:</strong> beim Aufruf können technisch bedingt IP-Adresse,
              Zeitpunkt und aufgerufene Adresse protokolliert werden. [BITTE ERGÄNZEN:
              Speicherdauer beim Hosting-Dienstleister]
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">3. Zwecke und Rechtsgrundlagen</h2>
          <p>
            Die Verarbeitung erfolgt zur Bereitstellung der Anwendung und zur Erfüllung des
            Nutzungsverhältnisses (Art. 6 Abs. 1 lit. b DSGVO) sowie auf Grundlage des berechtigten
            Interesses am sicheren und funktionsfähigen Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Das
            Sitzungs-Cookie ist für den vom Nutzer ausdrücklich gewünschten Dienst unbedingt
            erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG); eine Einwilligung ist dafür nicht erforderlich.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">4. Kein Tracking, keine Drittdienste</h2>
          <p>
            Die Anwendung bindet keine Analyse- oder Werbedienste ein. Es werden keine Schriftarten,
            Skripte oder sonstigen Inhalte von externen Servern nachgeladen; alle Bestandteile werden
            vom eigenen Server ausgeliefert. Es findet keine Profilbildung und keine automatisierte
            Entscheidungsfindung statt.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">5. Leser-Link</h2>
          <p>
            Veröffentlichte Dokumente können über einen Link mit zufälligem Token ohne Anmeldung
            eingesehen werden. Wer diesen Link erhält, entscheidet der jeweilige Betrieb. Beim Aufruf
            werden keine personenbezogenen Daten der Leser erhoben, die über die Server-Logs
            hinausgehen. Der Betrieb kann den Link jederzeit erneuern und damit den alten ungültig
            machen.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">6. Hosting und Speicherort</h2>
          <p>
            [BITTE ERGÄNZEN: Hosting-Dienstleister, Serverstandort, Auftragsverarbeitungsvertrag nach
            Art. 28 DSGVO]. Die Anwendung ist für einen Betrieb in der Europäischen Union vorgesehen;
            Datenbank und Dateiablage sollten in einer EU-Region betrieben werden.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">7. Speicherdauer</h2>
          <p>
            Inhalts- und Zugangsdaten werden gespeichert, solange das Nutzerkonto besteht. [BITTE
            ERGÄNZEN: konkrete Löschfristen und Verfahren zur Kontolöschung]
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">8. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art.
            17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und
            Widerspruch (Art. 21). Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde
            beschweren (Art. 77 DSGVO).
          </p>
        </div>
      </section>
    </main>
  );
}
