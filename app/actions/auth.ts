"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { passwortHashen, passwortPruefen, sessionLoeschen, sessionSetzen } from "@/lib/auth";
import { leserTokenErzeugen } from "@/lib/token";
import { anmeldungSchema, fehlerAusZod, registrierungSchema } from "@/lib/validation";
import type { FormZustand } from "@/lib/form-state";

export async function registrieren(_vorher: FormZustand, formular: FormData): Promise<FormZustand> {
  const geprueft = registrierungSchema.safeParse({
    betriebName: formular.get("betriebName"),
    branche: formular.get("branche"),
    email: formular.get("email"),
    passwort: formular.get("passwort"),
    passwortWiederholung: formular.get("passwortWiederholung"),
  });

  if (!geprueft.success) return { fehler: fehlerAusZod(geprueft.error) };
  const daten = geprueft.data;

  const vorhanden = await prisma.nutzer.findUnique({ where: { email: daten.email } });
  if (vorhanden) {
    return { fehler: "Für diese E-Mail-Adresse existiert bereits ein Zugang." };
  }

  const nutzer = await prisma.nutzer.create({
    data: {
      email: daten.email,
      passwortHash: await passwortHashen(daten.passwort),
      betrieb: {
        create: {
          name: daten.betriebName,
          branche: daten.branche,
          leserToken: leserTokenErzeugen(),
        },
      },
    },
  });

  await sessionSetzen(nutzer.id);
  redirect("/dashboard");
}

export async function anmelden(_vorher: FormZustand, formular: FormData): Promise<FormZustand> {
  const geprueft = anmeldungSchema.safeParse({
    email: formular.get("email"),
    passwort: formular.get("passwort"),
  });

  if (!geprueft.success) return { fehler: fehlerAusZod(geprueft.error) };

  const nutzer = await prisma.nutzer.findUnique({ where: { email: geprueft.data.email } });
  // Same message for unknown user and wrong password - no account enumeration.
  const allgemeinerFehler = { fehler: "E-Mail-Adresse oder Passwort ist nicht korrekt." };
  if (!nutzer) {
    // Keep the timing comparable to the success path.
    await passwortPruefen(geprueft.data.passwort, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid");
    return allgemeinerFehler;
  }

  const passt = await passwortPruefen(geprueft.data.passwort, nutzer.passwortHash);
  if (!passt) return allgemeinerFehler;

  await sessionSetzen(nutzer.id);
  redirect("/dashboard");
}

export async function abmelden(): Promise<void> {
  await sessionLoeschen();
  redirect("/anmelden");
}
