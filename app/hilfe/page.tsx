import Link from "next/link";

export const metadata = { title: "Hilfe" };

/**
 * Plain-language explanation of the whole workflow plus a glossary.
 *
 * Written for someone who took a one-day basic course and has never used
 * software like this: no abbreviation is used before it is explained, and each
 * step says what the software does and what the user has to do.
 */

const ABLAUF = [
  {
    nummer: 1,
    titel: "Betrieb anlegen",
    software: "Speichert Name, Branche und Ihr Logo.",
    sie: "Einmalig ausfüllen. Das Logo erscheint später auf jedem PDF.",
  },
  {
    nummer: 2,
    titel: "Gefahrstoff anlegen",
    software: "Legt eine Akte für dieses Produkt an.",
    sie: "Handelsname und Hersteller eintragen – so, wie es auf dem Gebinde steht.",
  },
  {
    nummer: 3,
    titel: "Sicherheitsdatenblatt hochladen",
    software:
      "Liest das PDF aus und zerlegt es in die 16 Abschnitte. Sie sehen sofort, wie viele erkannt wurden.",
    sie: "Das PDF vom Hersteller auswählen. Es muss ein Text-PDF sein, kein eingescanntes Blatt.",
  },
  {
    nummer: 4,
    titel: "Fünf Fragen zu Ihrem Betrieb beantworten",
    software:
      "Merkt sich Ihre Antworten und benutzt sie später, um Ihnen zu sagen, ob eine Änderung Sie überhaupt betrifft.",
    sie: "In Alltagssprache antworten: Wofür, wo, wie viel, womit geschützt, wie sind die Räume.",
  },
  {
    nummer: 5,
    titel: "Betriebsanweisung erstellen",
    software:
      "Füllt die sechs Felder aus dem Sicherheitsdatenblatt vor und lässt weg, was nicht hineingehört (etwa Grenzwerte).",
    sie: "Text auf Ihren Betrieb konkret machen, Häkchen setzen, veröffentlichen.",
  },
  {
    nummer: 6,
    titel: "Neue Lieferung, neues Sicherheitsdatenblatt",
    software:
      "Vergleicht die neue mit der alten Fassung, Abschnitt für Abschnitt, und zeigt genau, was sich geändert hat.",
    sie: "Nur die neue Version hochladen. Der Vergleich startet von selbst.",
  },
  {
    nummer: 7,
    titel: "Vorschläge prüfen",
    software:
      "Sagt Ihnen zu jeder Änderung, welchen Teil Ihrer Dokumente sie betrifft, und stellt Prüffragen.",
    sie: "Entscheiden, ob es Sie betrifft. Wenn ja: Dokument anpassen. Danach abhaken.",
  },
];

const GLOSSAR = [
  {
    begriff: "Sicherheitsdatenblatt (SDB)",
    erklaerung:
      "Das Datenblatt, das der Hersteller zu jedem Gefahrstoff mitliefern muss. Es ist gesetzlich in 16 nummerierte Abschnitte gegliedert – bei jedem Hersteller gleich. Genau darauf baut diese Software auf.",
  },
  {
    begriff: "Betriebsanweisung",
    erklaerung:
      "Das Blatt für Ihre Beschäftigten: Womit wird gearbeitet, welche Gefahren gibt es, was ist zu tun, was tun im Notfall. Es hängt dort aus, wo gearbeitet wird, und muss kurz und verständlich sein.",
  },
  {
    begriff: "Gefährdungsbeurteilung (GBU)",
    erklaerung:
      "Ihre eigene Bewertung: Welche Gefährdungen gibt es bei dieser Tätigkeit, und reichen Ihre Schutzmaßnahmen aus? Sie ist für die Dokumentation, nicht für den Aushang – hier dürfen auch Fachangaben wie Grenzwerte stehen.",
  },
  {
    begriff: "H-Sätze und P-Sätze",
    erklaerung:
      "Standardisierte Kurztexte auf jedem Gefahrstoff. H steht für Gefahr („H315 Verursacht Hautreizungen“), P für Schutzmaßnahme („P280 Schutzhandschuhe tragen“). Die Nummern sind weltweit gleich.",
  },
  {
    begriff: "Arbeitsplatzgrenzwert (AGW)",
    erklaerung:
      "Wie viel von einem Stoff höchstens in der Luft sein darf. Eine Fachangabe für die Gefährdungsbeurteilung – auf der Betriebsanweisung an der Wand hilft sie niemandem. Deshalb lässt die Software sie dort weg.",
  },
  {
    begriff: "TRGS 555",
    erklaerung:
      "Die Technische Regel, die vorgibt, wie eine Betriebsanweisung aufgebaut sein muss. Daher kommen die sechs Felder im Editor.",
  },
  {
    begriff: "Unternehmermodell",
    erklaerung:
      "Das Modell, bei dem der Unternehmer den Arbeitsschutz nach einem Basisseminar selbst betreut, statt dauerhaft eine Fachkraft für Arbeitssicherheit zu beauftragen. Für diesen Fall ist die Software gebaut.",
  },
  {
    begriff: "Ampel im Dashboard",
    erklaerung:
      "Rot: ein offener Vorschlag in einem sicherheitsrelevanten Abschnitt, oder es ist noch keine Betriebsanweisung veröffentlicht. Gelb: sonstige offene Punkte. Grün: alles geprüft und veröffentlicht.",
  },
  {
    begriff: "Entwurf und veröffentlicht",
    erklaerung:
      "Ein Entwurf ist Ihr Arbeitsstand – nur Sie sehen ihn. Veröffentlicht heißt: über den Leser-Link für Ihre Beschäftigten sichtbar. Der Schritt dazwischen passiert nur durch Ihr Häkchen.",
  },
  {
    begriff: "Leser-Link",
    erklaerung:
      "Eine Adresse mit einer langen Zufallsfolge, die Sie an Beschäftigte weitergeben können. Wer sie hat, sieht die veröffentlichten Dokumente – ohne Anmeldung, und nie Entwürfe. Sie können den Link jederzeit erneuern.",
  },
];

export default function Hilfe() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link className="text-sm font-medium text-marine-700 hover:underline" href="/dashboard">
        ← Zurück zur Übersicht
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Hilfe</h1>

      <section className="karte mt-6 border-marine-200 bg-marine-50/50 px-5 py-4">
        <h2 className="text-base font-semibold text-marine-900">
          Das Wichtigste in einem Satz
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          <strong>Die Software schlägt vor – Sie entscheiden.</strong> Sie sammelt Ihre
          Sicherheitsdatenblätter, erkennt bei einer neuen Lieferung, was der Hersteller geändert
          hat, und sagt Ihnen, wo das in Ihren Dokumenten eine Rolle spielt. Ändern und
          veröffentlichen tun Sie selbst. Es wird nie etwas automatisch übernommen.
        </p>
      </section>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Der Ablauf</h2>
      <p className="mt-1 text-sm text-slate-600">
        Die Schritte 1 bis 5 machen Sie einmal je Gefahrstoff. Die Schritte 6 und 7 wiederholen
        sich, wenn ein Hersteller sein Datenblatt überarbeitet.
      </p>

      <ol className="mt-4 space-y-3">
        {ABLAUF.map((schritt) => (
          <li key={schritt.nummer} className="karte px-5 py-4">
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marine-700 text-xs font-semibold text-white"
              >
                {schritt.nummer}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{schritt.titel}</h3>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-slate-500">Software:</dt>
                    <dd className="text-slate-700">{schritt.software}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-slate-500">Sie:</dt>
                    <dd className="text-slate-700">{schritt.sie}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Was heißt das?</h2>
      <p className="mt-1 text-sm text-slate-600">
        Die Begriffe, die in der Software und auf den Datenblättern vorkommen.
      </p>

      <dl className="mt-4 space-y-3">
        {GLOSSAR.map((eintrag) => (
          <div key={eintrag.begriff} className="karte px-5 py-4">
            <dt className="text-sm font-semibold text-slate-900">{eintrag.begriff}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-700">{eintrag.erklaerung}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Häufige Fragen</h2>
      <div className="mt-4 space-y-3">
        {[
          {
            frage: "Ich habe den Text geändert, aber der Vorschlag bleibt stehen.",
            antwort:
              "Vorschläge verschwinden nicht durch Bearbeiten. Öffnen Sie den Vorschlag und klicken Sie unten auf „Geprüft und eingearbeitet“ – die Software kann nicht erkennen, ob Sie eine Änderung wirklich übernommen haben. Nur Sie wissen das.",
          },
          {
            frage: "Beim Upload wurden nur wenige der 16 Abschnitte erkannt.",
            antwort:
              "Dann ist das PDF vermutlich ein Scan oder das Layout weicht stark ab. Prüfen Sie, ob sich im PDF Text mit der Maus markieren lässt. Wenn nicht, fragen Sie beim Hersteller nach der Originaldatei – eingescannte Blätter kann die Software nicht lesen.",
          },
          {
            frage: "Muss ich alles kürzen, was im Feld steht?",
            antwort:
              "Was fachlich nicht hineingehört, hat die Software schon entfernt – sichtbar unter jedem Feld. Ihre Aufgabe ist nur noch, allgemeine Formulierungen konkret zu machen: aus „ausreichend belüftet“ wird „Tor und Fenster öffnen“.",
          },
          {
            frage: "Sehen meine Beschäftigten meine Entwürfe?",
            antwort:
              "Nein. Über den Leser-Link ist ausschließlich die zuletzt veröffentlichte Fassung sichtbar. Ein Entwurf bleibt unsichtbar, auch wenn Sie ihn speichern.",
          },
          {
            frage: "Wo liegen meine Daten?",
            antwort:
              "In einer Datei auf dem Rechner, auf dem die Software läuft. Es gibt keine Cloud und keine Übertragung an Dritte. Sichern Sie diese Datei regelmäßig – ein Backup macht die Software nicht von selbst.",
          },
        ].map((eintrag) => (
          <details key={eintrag.frage} className="karte px-5 py-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-900">
              {eintrag.frage}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{eintrag.antwort}</p>
          </details>
        ))}
      </div>

      <p className="mt-10 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Diese Hilfe erklärt die Bedienung der Software. Sie ist keine Rechtsberatung und ersetzt
        weder das Basisseminar noch die fachliche Prüfung Ihrer Dokumente.
      </p>
    </main>
  );
}
