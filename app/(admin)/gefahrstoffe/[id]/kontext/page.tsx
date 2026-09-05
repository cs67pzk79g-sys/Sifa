import Link from "next/link";
import { notFound } from "next/navigation";
import { kontextSpeichern } from "@/app/actions/gefahrstoff";
import { AktionsFormular } from "@/components/formular";
import { Karte, Zurueck } from "@/components/ui";
import { nutzerErzwingen } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kontextSchritte, type KontextSchritt } from "@/lib/validation";

export const metadata = { title: "Betrieblicher Kontext" };

interface SchrittDefinition {
  feld: KontextSchritt;
  titel: string;
  frage: string;
  hilfe: string;
  beispiel: string;
}

/**
 * The context is captured one question at a time on purpose: a single large
 * form is what makes people abandon this step.
 */
const SCHRITTE: SchrittDefinition[] = [
  {
    feld: "taetigkeit",
    titel: "Tätigkeit",
    frage: "Wofür wird der Stoff bei Ihnen verwendet?",
    hilfe: "Beschreiben Sie die Tätigkeit so, wie Ihre Beschäftigten sie kennen – nicht in Fachsprache.",
    beispiel: "z. B. „Bremsteile vor der Montage mit der Sprühdose reinigen“",
  },
  {
    feld: "arbeitsbereich",
    titel: "Arbeitsbereich",
    frage: "In welchem Bereich wird damit gearbeitet?",
    hilfe: "Nennen Sie den Ort, an dem der Stoff tatsächlich verwendet wird.",
    beispiel: "z. B. „Werkstatt, Hebebühne 2“ oder „Lager, Abfüllplatz“",
  },
  {
    feld: "mengeHaeufigkeit",
    titel: "Menge und Häufigkeit",
    frage: "Wie viel wird verwendet, und wie oft?",
    hilfe: "Eine grobe Schätzung genügt. Sie hilft später einzuschätzen, wie stark eine Änderung Sie betrifft.",
    beispiel: "z. B. „ca. 2 Dosen à 500 ml pro Woche, täglich kurzzeitig“",
  },
  {
    feld: "vorhandeneSchutzmassnahmen",
    titel: "Vorhandene Schutzmaßnahmen",
    frage: "Welche Schutzmaßnahmen gibt es heute schon?",
    hilfe: "Technisch (Absaugung), organisatorisch (Unterweisung) und persönlich (Handschuhe, Brille).",
    beispiel: "z. B. „Absaugung an der Hebebühne, Nitrilhandschuhe, Schutzbrille, jährliche Unterweisung“",
  },
  {
    feld: "raeumlicheGegebenheiten",
    titel: "Räumliche Gegebenheiten",
    frage: "Wie sind die räumlichen Bedingungen vor Ort?",
    hilfe: "Lüftung, Raumgröße, Nachbarbereiche, Lagerung in der Nähe.",
    beispiel: "z. B. „Halle mit Toren, natürliche Lüftung, Lagerung im Gefahrstoffschrank daneben“",
  },
];

export default async function KontextWizard({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ schritt?: string }>;
}) {
  const nutzer = await nutzerErzwingen();
  const { id } = await params;
  const { schritt } = await searchParams;

  const gefahrstoff = await prisma.gefahrstoff.findFirst({
    where: { id, betriebId: nutzer.betriebId },
    include: { kontext: true },
  });
  if (!gefahrstoff) notFound();

  const nummer = Math.min(Math.max(Number(schritt) || 1, 1), SCHRITTE.length);
  const aktuell = SCHRITTE[nummer - 1];
  const wert = String(gefahrstoff.kontext?.[aktuell.feld] ?? "");
  const letzter = nummer === SCHRITTE.length;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Zurueck href={`/gefahrstoffe/${gefahrstoff.id}`}>Zurück zu {gefahrstoff.name}</Zurueck>

      <div>
        <h1 className="text-xl font-semibold text-slate-900">Betrieblicher Kontext</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fünf kurze Fragen zu {gefahrstoff.name}. Jede Antwort wird sofort gespeichert – Sie können
          jederzeit abbrechen und später weitermachen.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <span>
            Schritt {nummer} von {SCHRITTE.length}
          </span>
          <span>{aktuell.titel}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-marine-700 transition-all"
            style={{ width: `${(nummer / SCHRITTE.length) * 100}%` }}
          />
        </div>
        <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {SCHRITTE.map((s, index) => {
            const erledigt = String(gefahrstoff.kontext?.[s.feld] ?? "").trim().length > 0;
            return (
              <li key={s.feld}>
                <Link
                  href={`/gefahrstoffe/${gefahrstoff.id}/kontext?schritt=${index + 1}`}
                  className={
                    index + 1 === nummer
                      ? "font-semibold text-marine-700 underline"
                      : erledigt
                        ? "text-emerald-700 hover:underline"
                        : "text-slate-500 hover:underline"
                  }
                >
                  {erledigt ? "✓ " : ""}
                  {s.titel}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      <Karte titel={aktuell.frage} beschreibung={aktuell.hilfe}>
        <AktionsFormular
          aktion={kontextSpeichern}
          absendenText={letzter ? "Speichern und abschließen" : "Speichern und weiter"}
        >
          <input type="hidden" name="gefahrstoffId" value={gefahrstoff.id} />
          <input type="hidden" name="feld" value={aktuell.feld} />
          <div>
            <label className="etikett" htmlFor="wert">
              {aktuell.titel}
            </label>
            <textarea
              className="feld min-h-[120px]"
              id="wert"
              name="wert"
              defaultValue={wert}
              maxLength={1000}
              placeholder={aktuell.beispiel}
            />
            <p className="mt-1.5 text-xs text-slate-500">{aktuell.beispiel}</p>
          </div>
        </AktionsFormular>
      </Karte>

      <div className="flex items-center justify-between text-sm">
        {nummer > 1 ? (
          <Link
            className="text-marine-700 hover:underline"
            href={`/gefahrstoffe/${gefahrstoff.id}/kontext?schritt=${nummer - 1}`}
          >
            ← Vorheriger Schritt
          </Link>
        ) : (
          <span />
        )}
        {!letzter ? (
          <Link
            className="text-slate-500 hover:underline"
            href={`/gefahrstoffe/${gefahrstoff.id}/kontext?schritt=${nummer + 1}`}
          >
            Überspringen →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
