/**
 * Minimal credential auth for the admin role.
 *
 * Readers have no account at all - they open a per company link that carries a
 * hard to guess token (see lib/token.ts). Deliberately no user groups, no role
 * matrix and no approval workflow: managing who is admin and who gets the
 * reader link is the employer's job, not the software's.
 */
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "as_session";
const LAUFZEIT_TAGE = 7;

function secret(): Uint8Array {
  const wert = process.env.SESSION_SECRET;
  if (!wert || wert.length < 32) {
    throw new Error(
      "SESSION_SECRET fehlt oder ist zu kurz. Bitte in .env einen Zufallswert mit mindestens 32 Zeichen setzen.",
    );
  }
  return new TextEncoder().encode(wert);
}

export async function passwortHashen(passwort: string): Promise<string> {
  return bcrypt.hash(passwort, 12);
}

export async function passwortPruefen(passwort: string, hash: string): Promise<boolean> {
  return bcrypt.compare(passwort, hash);
}

export async function sessionSetzen(nutzerId: string): Promise<void> {
  const token = await new SignJWT({ sub: nutzerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${LAUFZEIT_TAGE}d`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LAUFZEIT_TAGE * 24 * 60 * 60,
  });
}

export async function sessionLoeschen(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

async function nutzerIdAusCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export type AngemeldeterNutzer = NonNullable<Awaited<ReturnType<typeof aktuellerNutzer>>>;

/** Returns the logged in admin including their company, or null. */
export async function aktuellerNutzer() {
  const id = await nutzerIdAusCookie();
  if (!id) return null;
  return prisma.nutzer.findUnique({
    where: { id },
    include: { betrieb: true },
  });
}

/** Use in server components and actions that require a logged in admin. */
export async function nutzerErzwingen() {
  const nutzer = await aktuellerNutzer();
  if (!nutzer) redirect("/anmelden");
  return nutzer;
}
