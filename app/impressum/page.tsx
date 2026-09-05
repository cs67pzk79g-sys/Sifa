import Link from "next/link";

export const metadata = { title: "Impressum" };

/**
 * Placeholder imprint. The real operator data must be filled in before the app
 * is made available to anyone outside the development team (§ 5 DDG).
 */
export default function Impressum() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link className="text-sm font-medium text-marine-700 hover:underline" href="/">
        ← Zur Anwendung
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Impressum</h1>

      <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Achtung – Platzhalter.</strong> Diese Seite enthält noch keine echten Angaben. Die
        Anwendung darf mit diesen Platzhaltern nicht öffentlich betrieben werden. Angaben nach § 5
        DDG (früher § 5 TMG) sind vom Betreiber der Anwendung zu ergänzen.
      </p>

      <section className="mt-6 space-y-4 text-sm leading-relaxed text-slate-800">
        <div>
          <h2 className="font-semibold text-slate-900">Diensteanbieter</h2>
          <p>[BITTE ERGÄNZEN: vollständiger Firmenname bzw. Name des Betreibers]</p>
          <p>[BITTE ERGÄNZEN: Straße und Hausnummer]</p>
          <p>[BITTE ERGÄNZEN: PLZ und Ort]</p>
          <p>[BITTE ERGÄNZEN: Land]</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">Kontakt</h2>
          <p>E-Mail: [BITTE ERGÄNZEN: E-Mail-Adresse]</p>
          <p>Telefon: [BITTE ERGÄNZEN: Telefonnummer]</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">Vertretungsberechtigte Person</h2>
          <p>[BITTE ERGÄNZEN: Geschäftsführung / Inhaber]</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">Registereintrag und Umsatzsteuer</h2>
          <p>[BITTE ERGÄNZEN: Registergericht und Registernummer, falls vorhanden]</p>
          <p>[BITTE ERGÄNZEN: Umsatzsteuer-Identifikationsnummer, falls vorhanden]</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p>[BITTE ERGÄNZEN: Name und Anschrift]</p>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">Haftung für Inhalte der Dokumente</h2>
          <p>
            Diese Software unterstützt bei der Dokumentation des betrieblichen Arbeitsschutzes. Die
            rechtliche Verantwortung für Inhalt und Aktualität von Gefährdungsbeurteilungen und
            Betriebsanweisungen liegt beim Arbeitgeber (§ 3 GefStoffV, § 5 ArbSchG). Die Software
            erstellt ausschließlich Vorschläge und ersetzt keine fachliche Prüfung und keine
            Rechtsberatung.
          </p>
        </div>
      </section>
    </main>
  );
}
