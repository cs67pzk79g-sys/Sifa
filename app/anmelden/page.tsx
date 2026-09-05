import Link from "next/link";
import { redirect } from "next/navigation";
import { anmelden } from "@/app/actions/auth";
import { AktionsFormular } from "@/components/formular";
import { aktuellerNutzer } from "@/lib/auth";

export const metadata = { title: "Anmelden" };

export default async function AnmeldeSeite() {
  if (await aktuellerNutzer()) redirect("/dashboard");

  return (
    <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:py-20">
      <h1 className="text-2xl font-semibold text-slate-900">Arbeitsschutz-Dokumentation</h1>
      <p className="mt-2 text-sm text-slate-600">
        Gefährdungsbeurteilungen und Betriebsanweisungen an einer Stelle – für Betriebe im
        Unternehmermodell.
      </p>

      <div className="karte mt-6 p-5">
        <h2 className="text-base font-semibold text-slate-900">Anmelden</h2>
        <AktionsFormular aktion={anmelden} absendenText="Anmelden" ladeText="Anmeldung läuft …" className="mt-4 space-y-4">
          <div>
            <label className="etikett" htmlFor="email">
              E-Mail-Adresse
            </label>
            <input
              className="feld"
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="etikett" htmlFor="passwort">
              Passwort
            </label>
            <input
              className="feld"
              id="passwort"
              name="passwort"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
        </AktionsFormular>
      </div>

      <p className="mt-5 text-sm text-slate-600">
        Noch kein Zugang?{" "}
        <Link className="font-medium text-marine-700 underline" href="/registrieren">
          Betrieb anlegen
        </Link>
      </p>
    </main>
  );
}
