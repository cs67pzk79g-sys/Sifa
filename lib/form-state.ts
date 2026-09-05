/** Shared shape for all Server Action results rendered with useActionState. */
export interface FormZustand {
  fehler?: string;
  erfolg?: string;
}

export const LEERER_ZUSTAND: FormZustand = {};
