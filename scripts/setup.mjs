/**
 * One-command setup: creates .env with a fresh session secret, applies the
 * database schema and - on a fresh install - loads the demo data.
 *
 * Safe to run more than once: an existing .env is never overwritten, and the
 * demo data is only loaded while the database still has no companies in it.
 */
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const DEMO_ERZWINGEN = process.argv.includes("--demo");

const schritt = (text) => console.log(`\n${text}\n${"-".repeat(text.length)}`);
const info = (text) => console.log(`  ${text}`);

const geheimnisErzeugen = () => randomBytes(48).toString("base64url");

/** Reads .env into a plain object without pulling in a dependency. */
function envLesen(pfad) {
  const werte = {};
  if (!existsSync(pfad)) return werte;
  for (const zeile of readFileSync(pfad, "utf8").split("\n")) {
    const treffer = zeile.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!treffer) continue;
    werte[treffer[1]] = treffer[2].replace(/^["']|["']$/g, "");
  }
  return werte;
}

// --- 1. .env ---------------------------------------------------------------
schritt("Schritt 1 von 3: Konfiguration (.env)");

if (!existsSync(".env")) {
  if (!existsSync(".env.example")) {
    console.error("  Fehler: .env.example fehlt. Ist das Projekt vollständig geklont?");
    process.exit(1);
  }
  const inhalt = readFileSync(".env.example", "utf8").replace(
    /^SESSION_SECRET=.*$/m,
    `SESSION_SECRET="${geheimnisErzeugen()}"`,
  );
  writeFileSync(".env", inhalt);
  info(".env neu angelegt, Sitzungsschlüssel zufällig erzeugt.");
} else {
  const geheimnis = envLesen(".env").SESSION_SECRET ?? "";
  // Replace only a placeholder or a too-short value - never a working secret,
  // because that would log every user out.
  if (geheimnis.length < 32 || geheimnis.startsWith("bitte-ersetzen")) {
    const inhalt = readFileSync(".env", "utf8");
    const neu = /^SESSION_SECRET=.*$/m.test(inhalt)
      ? inhalt.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET="${geheimnisErzeugen()}"`)
      : `${inhalt.trimEnd()}\nSESSION_SECRET="${geheimnisErzeugen()}"\n`;
    writeFileSync(".env", neu);
    info(".env vorhanden, aber SESSION_SECRET fehlte oder war zu kurz - neu gesetzt.");
  } else {
    info(".env vorhanden und vollständig - unverändert übernommen.");
  }
}

// Make DATABASE_URL available to this process for the check further down.
for (const [schluessel, wert] of Object.entries(envLesen(".env"))) {
  process.env[schluessel] ??= wert;
}

// --- 2. Datenbank ----------------------------------------------------------
schritt("Schritt 2 von 3: Datenbank einrichten");
execSync("npx prisma db push", { stdio: "inherit" });

// --- 3. Demo-Daten ---------------------------------------------------------
schritt("Schritt 3 von 3: Demo-Daten");

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
let betriebe = 0;
try {
  betriebe = await prisma.betrieb.count();
} finally {
  await prisma.$disconnect();
}

if (betriebe === 0 || DEMO_ERZWINGEN) {
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
} else {
  info(`Übersprungen: Die Datenbank enthält bereits ${betriebe} Betrieb(e).`);
  info("Ihre Daten bleiben unangetastet.");
  info("Demo-Daten trotzdem laden:  npm run setup -- --demo");
}

console.log("\nFertig. Jetzt starten mit:  npm run dev");
console.log("Danach im Browser öffnen:   http://localhost:3000\n");
