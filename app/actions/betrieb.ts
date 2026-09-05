"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nutzerErzwingen } from "@/lib/auth";
import { leserTokenErzeugen } from "@/lib/token";
import {
  betriebSchema,
  ERLAUBTE_LOGO_TYPEN,
  fehlerAusZod,
  MAX_LOGO_BYTES,
} from "@/lib/validation";
import type { FormZustand } from "@/lib/form-state";

export async function betriebAktualisieren(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const nutzer = await nutzerErzwingen();
  const geprueft = betriebSchema.safeParse({
    name: formular.get("name"),
    branche: formular.get("branche"),
  });
  if (!geprueft.success) return { fehler: fehlerAusZod(geprueft.error) };

  await prisma.betrieb.update({
    where: { id: nutzer.betriebId },
    data: geprueft.data,
  });

  revalidatePath("/betrieb");
  revalidatePath("/dashboard");
  return { erfolg: "Betriebsdaten gespeichert." };
}

export async function logoHochladen(
  _vorher: FormZustand,
  formular: FormData,
): Promise<FormZustand> {
  const nutzer = await nutzerErzwingen();
  const datei = formular.get("logo");

  if (!(datei instanceof File) || datei.size === 0) {
    return { fehler: "Bitte eine Bilddatei auswählen." };
  }
  if (!ERLAUBTE_LOGO_TYPEN.includes(datei.type)) {
    return { fehler: "Bitte eine PNG- oder JPEG-Datei hochladen." };
  }
  if (datei.size > MAX_LOGO_BYTES) {
    return { fehler: "Das Logo darf höchstens 2 MB groß sein." };
  }

  const inhalt = Buffer.from(await datei.arrayBuffer());
  const altesLogoId = nutzer.betrieb.logoId;

  const gespeichert = await prisma.datei.create({
    data: {
      dateiName: datei.name || "logo",
      mimeTyp: datei.type,
      groesse: inhalt.length,
      inhalt,
    },
  });

  await prisma.betrieb.update({
    where: { id: nutzer.betriebId },
    data: { logoId: gespeichert.id, logoUrl: `/api/dateien/${gespeichert.id}` },
  });

  if (altesLogoId) {
    await prisma.datei.delete({ where: { id: altesLogoId } }).catch(() => undefined);
  }

  revalidatePath("/", "layout");
  return { erfolg: "Logo aktualisiert." };
}

export async function logoEntfernen(_vorher: FormZustand): Promise<FormZustand> {
  const nutzer = await nutzerErzwingen();
  const logoId = nutzer.betrieb.logoId;
  if (!logoId) return { fehler: "Es ist kein Logo hinterlegt." };

  await prisma.betrieb.update({
    where: { id: nutzer.betriebId },
    data: { logoId: null, logoUrl: null },
  });
  await prisma.datei.delete({ where: { id: logoId } }).catch(() => undefined);

  revalidatePath("/", "layout");
  return { erfolg: "Logo entfernt." };
}

/** Invalidates the old reader link and creates a new one. */
export async function leserLinkErneuern(_vorher: FormZustand): Promise<FormZustand> {
  const nutzer = await nutzerErzwingen();
  await prisma.betrieb.update({
    where: { id: nutzer.betriebId },
    data: { leserToken: leserTokenErzeugen() },
  });
  revalidatePath("/betrieb");
  return { erfolg: "Neuer Leser-Link erzeugt. Der bisherige Link funktioniert nicht mehr." };
}
