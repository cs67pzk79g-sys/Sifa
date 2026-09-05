import { redirect } from "next/navigation";
import { aktuellerNutzer } from "@/lib/auth";

export default async function Start() {
  const nutzer = await aktuellerNutzer();
  redirect(nutzer ? "/dashboard" : "/anmelden");
}
