import Link from "next/link";
import { redirect } from "next/navigation";
import { registrieren } from "@/app/actions/auth";
import { AktionsFormular } from "@/components/formular";
import { aktuellerNutzer } from "@/lib/auth";

export const metadata = { title: "Betrieb anlegen" };

export default async function RegistrierungsSeite() {
  if (await aktuellerNutzer()) redirect("/dashboard");

  return (
    <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Betrieb anlegen</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sie legen damit Ihren Betrieb und Ihren Administrator-Zugang an. Das Logo können Sie
        anschließend in den Betriebsdaten hochladen.
      </p>

      <div className="karte mt-6 p-5">
        <AktionsFormular
          aktion={registrieren}
          absendenText="Betrieb anlegen"
          ladeText="Wird angelegt …"
        >
          <div>
            <label className="etikett" htmlFor="betriebName">
              Name des Betriebs
            </label>
            <input className="feld" id="betriebName" name="betriebName" required maxLength={200} />
          </div>
          <div>
            <label className="etikett" htmlFor="branche">
              Branche
            </label>
            <input
              className="feld"
              id="branche"
              name="branche"
              required
              maxLength={200}
              placeholder="z. B. Kfz-Werkstatt, Malerbetrieb, Metallverarbeitung"
            />
          </div>
          <div>
            <label className="etikett" htmlFor="email">
              E-Mail-Adresse (Administrator)
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
              Passwort (mindestens 10 Zeichen)
            </label>
            <input
              className="feld"
              id="passwort"
              name="passwort"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </div>
          <div>
            <label className="etikett" htmlFor="passwortWiederholung">
              Passwort wiederholen
            </label>
            <input
              className="feld"
              id="passwortWiederholung"
              name="passwortWiederholung"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </div>
        </AktionsFormular>
      </div>

      <p className="mt-5 text-sm text-slate-600">
        Bereits registriert?{" "}
        <Link className="font-medium text-marine-700 underline" href="/anmelden">
          Zur Anmeldung
        </Link>
      </p>
    </main>
  );
}
