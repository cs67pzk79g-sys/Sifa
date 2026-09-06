import Link from "next/link";
import { notFound } from "next/navigation";
import { vorschlagBewerten } from "@/app/actions/gefahrstoff";
import { DiffAnsicht } from "@/components/diff-ansicht";
import { VorschlagPruefung } from "@/components/vorschlag-pruefung";
import {
  Beschriftet,
  Karte,
  StatusMarke,
  VorschlagBanner,
  Zurueck,
  datumFormatieren,
} from "@/components/ui";
import { nutzerErzwingen } from "@/lib/auth";
import { diffTeileLesen } from "@/lib/diff-service";
import { DOKUMENT_TYP_LABEL } from "@/lib/dokument-inhalt";
import { hinweisBilden } from "@/lib/hinweis";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Änderungsvorschlag" };

export default async function VorschlagSeite({
  params,
}: {
  params: Promise<{ id: string; vorschlagId: string }>;
}) {
  const nutzer = await nutzerErzwingen();
  const { id, vorschlagId } = await params;

  const vorschlag = await prisma.aenderungsvorschlag.findFirst({
    where: { id: vorschlagId, gefahrstoffId: id, gefahrstoff: { betriebId: nutzer.betriebId } },
    include: {
      gefahrstoff: { include: { kontext: true, dokumente: true } },
      alteSdb: true,
      neueSdb: true,
    },
  });
  if (!vorschlag) notFound();

  const gefahrstoff = vorschlag.gefahrstoff;
  const hinweis = hinweisBilden(vorschlag.abschnittsNummer, gefahrstoff.kontext);
  const teile = diffTeileLesen(vorschlag.diffText);
  const bereitsGeprueft = vorschlag.status !== "OFFEN";

  return (
    <div className="space-y-6">
      <Zurueck href={`/gefahrstoffe/${gefahrstoff.id}`}>Zurück zu {gefahrstoff.name}</Zurueck>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Abschnitt {vorschlag.abschnittsNummer}: {hinweis.abschnittsTitel}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {gefahrstoff.name} · Version {vorschlag.alteSdb.versionNummer} →{" "}
            {vorschlag.neueSdb.versionNummer}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusMarke ton={hinweis.relevanz === "HOCH" ? "rot" : hinweis.relevanz === "MITTEL" ? "gelb" : "neutral"}>
            {hinweis.relevanzLabel}
          </StatusMarke>
          <StatusMarke
            ton={
              vorschlag.status === "OFFEN"
                ? "gelb"
                : vorschlag.status === "GEPRUEFT_UEBERNOMMEN"
                  ? "gruen"
                  : "neutral"
            }
          >
            {vorschlag.status === "OFFEN"
              ? "offen"
              : vorschlag.status === "GEPRUEFT_UEBERNOMMEN"
                ? `geprüft und eingearbeitet am ${datumFormatieren(vorschlag.geprueftAm)}`
                : `geprüft, nicht relevant (${datumFormatieren(vorschlag.geprueftAm)})`}
          </StatusMarke>
        </div>
      </div>

      <VorschlagBanner />

      <details className="karte px-5 py-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-900">
          Was heißt das jetzt für mich?
        </summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          <li>
            <strong>Lesen, was sich geändert hat.</strong> Weiter unten steht der Vergleich: Rot ist
            aus der alten Fassung verschwunden, Grün ist neu hinzugekommen.
          </li>
          <li>
            <strong>Entscheiden, ob es Sie betrifft.</strong> Dabei helfen die Prüffragen und Ihre
            eigenen Angaben zum Betrieb, die darüber stehen.
          </li>
          <li>
            <strong>Wenn ja: Dokument anpassen.</strong> Unten finden Sie die Links zur
            Betriebsanweisung und zur Gefährdungsbeurteilung. Den Text schreiben Sie selbst – die
            Software ändert dort nichts.
          </li>
          <li>
            <strong>Abhaken.</strong> „Geprüft und eingearbeitet“, wenn Sie etwas geändert haben.
            „Geprüft, nicht relevant“, wenn die Änderung Sie nicht betrifft – etwa eine Neuerung
            beim Transport, wenn Sie den Stoff nie außer Haus fahren.
          </li>
        </ol>
        <p className="mt-3 text-sm text-slate-600">
          Das Abhaken bedeutet: <em>Sie</em> haben es geprüft. Es heißt nicht, dass die Software
          etwas geändert hätte. Erst danach verschwindet der Punkt aus Ihrer Liste und die Ampel
          kann auf Grün springen.
        </p>
      </details>

      <Karte titel="Strukturierter Hinweis">
        <p className="text-[15px] font-medium text-slate-900">{hinweis.ueberschrift}</p>

        {hinweis.betroffeneDokumentAbschnitte.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Diese Abschnitte Ihrer Dokumente sind betroffen
            </h3>
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {hinweis.betroffeneDokumentAbschnitte.map((titel) => (
                <li key={titel}>
                  <StatusMarke ton="blau">{titel}</StatusMarke>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            Dieser Abschnitt betrifft die Betriebsanweisung in der Regel nicht direkt. Prüfen Sie
            trotzdem kurz, ob sich für Ihren Betrieb etwas ändert.
          </p>
        )}

        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Ihr betrieblicher Kontext
          </h3>
          {hinweis.kontextFehlt ? (
            <p className="hinweis-box mt-1.5 border-amber-200 bg-amber-50 text-amber-900">
              Es ist noch kein betrieblicher Kontext erfasst. Ohne ihn bleibt dieser Hinweis
              allgemein.{" "}
              <Link className="font-medium underline" href={`/gefahrstoffe/${gefahrstoff.id}/kontext`}>
                Kontext jetzt erfassen
              </Link>
            </p>
          ) : (
            <dl className="mt-2 grid gap-3 sm:grid-cols-2">
              {hinweis.kontextBezug.map((eintrag) => (
                <Beschriftet key={eintrag.label} label={eintrag.label} wert={eintrag.wert} />
              ))}
            </dl>
          )}
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Prüffragen
          </h3>
          <ul className="mt-1.5 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
            {hinweis.prueffragen.map((frage) => (
              <li key={frage}>{frage}</li>
            ))}
          </ul>
        </div>
      </Karte>

      <Karte
        titel="Was hat sich im Sicherheitsdatenblatt geändert?"
        aktion={
          <a className="knopf-sekundaer" href={vorschlag.neueSdb.dateiUrl} target="_blank" rel="noreferrer">
            Neues SDB als PDF
          </a>
        }
      >
        <DiffAnsicht teile={teile} />
      </Karte>

      <div className="grid gap-6 lg:grid-cols-2">
        <Karte titel="Dokumente anpassen" beschreibung="Sie formulieren den Text selbst – die Software ändert nichts automatisch.">
          <ul className="space-y-2">
            {(["BETRIEBSANWEISUNG", "GEFAEHRDUNGSBEURTEILUNG"] as const).map((typ) => (
              <li key={typ}>
                <Link
                  className="text-sm font-medium text-marine-700 hover:underline"
                  href={`/gefahrstoffe/${gefahrstoff.id}/dokument/${typ.toLowerCase()}`}
                >
                  {DOKUMENT_TYP_LABEL[typ]} bearbeiten →
                </Link>
              </li>
            ))}
          </ul>
        </Karte>

        <Karte titel="Prüfung abschließen">
          <VorschlagPruefung
            aktion={vorschlagBewerten}
            vorschlagId={vorschlag.id}
            notiz={vorschlag.notiz ?? ""}
            bereitsGeprueft={bereitsGeprueft}
          />
        </Karte>
      </div>
    </div>
  );
}
