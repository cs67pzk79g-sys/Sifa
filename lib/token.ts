// Also used by the seed script, therefore no "server-only" guard.
import { randomBytes } from "node:crypto";

/**
 * Token for the login free reader link. 32 random bytes, base64url encoded -
 * long enough that the link cannot be guessed, short enough to be shared.
 */
export function leserTokenErzeugen(): string {
  return randomBytes(32).toString("base64url");
}
