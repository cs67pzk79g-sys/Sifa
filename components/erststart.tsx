import Link from "next/link";
import type { GefahrstoffUebersicht } from "@/lib/uebersicht";

/**
 * First-run guidance on the dashboard.
 *
 * An empty dashboard tells a first-time user nothing about where to begin, and
 * the target group has no prior experience with this kind of software. The list
 * shows the real state of their data, not a static tutorial, and disappears for
 * good once the first document is published.
 */
interface Schritt {
  titel: string;
  erklaerung: string;
  erledigt: boolean;
  href: string;
  aktionText: string;
}

export function erststartSchritte(gefahrstoffe: GefahrstoffUebersicht[]): Schritt[] {
  const ersterGefahrstoff = gefahrstoffe[0];
  const zumStoff = ersterGefahrstoff ? `/gefahrstoffe/${ersterGefahrstoff.id}` : "/gefahrstoffe";

  const hatSdb = gefahrstoffe.some((g) => g.sdbVersionen > 0);
  const hatKontext = gefahrstoffe.some((g) => g.kontextAusgefuellteFelder > 0);
  const hatVeroeffentlicht = gefahrstoffe.some((g) =>
    g.dokumente.some((d) => d.veroeffentlichteVersion !== null),
  );

  return [
    {
      titel: "Betrieb angelegt",
      erklaerung: "Name und Branche stehen. Ein Logo können Sie unter „Betrieb“ ergänzen.",
      erledigt: true,
      href: "/betrieb",
      aktionText: "Betriebsdaten ansehen",
    },
    {
      titel: "Ersten Gefahrstoff anlegen",
      erklaerung:
        "Jedes Produkt, für das Sie ein Sicherheitsdatenblatt haben – Reiniger, Lack, Kleber, Öl.",
      erledigt: gefahrstoffe.length > 0,
      href: "/gefahrstoffe",
      aktionText: "Gefahrstoff anlegen",
    },
    {
      titel: "Sicherheitsdatenblatt hochladen",
      erklaerung:
        "Das PDF vom Hersteller. Daraus liest die Software die 16 Abschnitte und füllt später Ihre Dokumente vor.",
      erledigt: hatSdb,
      href: zumStoff,
      aktionText: "SDB hochladen",
    },
    {
      titel: "Fünf Fragen zu Ihrem Betrieb beantworten",
      erklaerung:
        "Wo, wie oft und womit wird gearbeitet? Nur dadurch kann die Software Ihnen später sagen, ob eine Änderung Sie betrifft.",
      erledigt: hatKontext,
      href: `${zumStoff}/kontext`,
      aktionText: "Fragen beantworten",
    },
    {
      titel: "Betriebsanweisung prüfen und veröffentlichen",
      erklaerung:
        "Die Felder sind bereits aus dem SDB gefüllt. Sie machen sie auf Ihren Betrieb konkret und veröffentlichen.",
      erledigt: hatVeroeffentlicht,
      href: `${zumStoff}/dokument/betriebsanweisung`,
      aktionText: "Betriebsanweisung öffnen",
    },
  ];
}

export function Erststart({ schritte }: { schritte: Schritt[] }) {
  const naechster = schritte.find((s) => !s.erledigt);
  if (!naechster) return null;

  const erledigt = schritte.filter((s) => s.erledigt).length;

  return (
    <section className="karte border-marine-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          So kommen Sie zur ersten Betriebsanweisung
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Schritt {erledigt + 1} von {schritte.length}. Diese Anleitung verschwindet, sobald Ihr
          erstes Dokument veröffentlicht ist.
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-marine-700 transition-all"
            style={{ width: `${(erledigt / schritte.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="divide-y divide-slate-200">
        {schritte.map((schritt, index) => {
          const istNaechster = schritt === naechster;
          return (
            <li
              key={schritt.titel}
              className={`flex gap-4 px-5 py-4 ${istNaechster ? "bg-marine-50/60" : ""}`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  schritt.erledigt
                    ? "bg-emerald-600 text-white"
                    : istNaechster
                      ? "bg-marine-700 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {schritt.erledigt ? "✓" : index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    schritt.erledigt ? "text-slate-500 line-through" : "text-slate-900"
                  }`}
                >
                  {schritt.titel}
                  <span className="sr-only">{schritt.erledigt ? " – erledigt" : ""}</span>
                </p>
                {!schritt.erledigt ? (
                  <p className="mt-0.5 text-sm text-slate-600">{schritt.erklaerung}</p>
                ) : null}
                {istNaechster ? (
                  <Link className="knopf-primaer mt-3" href={schritt.href}>
                    {schritt.aktionText}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** The one sentence that decides whether someone understands this software. */
export function Grundsatz({ ausfuehrlich = false }: { ausfuehrlich?: boolean }) {
  if (!ausfuehrlich) {
    return (
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-800">Die Software schlägt vor – Sie entscheiden.</span>{" "}
        Sie ändert nie selbst etwas an Ihren Dokumenten.
      </p>
    );
  }

  return (
    <section className="karte border-marine-200 bg-marine-50/50 px-5 py-4">
      <h2 className="text-base font-semibold text-marine-900">
        Die Software schlägt vor – Sie entscheiden.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        Sie lädt Ihre Sicherheitsdatenblätter, erkennt bei einer neuen Version, was sich geändert
        hat, und sagt Ihnen, wo in Ihren Dokumenten das eine Rolle spielt. <strong>Ändern und
        veröffentlichen tun Sie selbst.</strong> Nichts wird automatisch übernommen, und nichts wird
        ohne Ihre Bestätigung sichtbar. Die Verantwortung für Inhalt und Aktualität bleibt beim
        Arbeitgeber (§ 3 GefStoffV).
      </p>
    </section>
  );
}
