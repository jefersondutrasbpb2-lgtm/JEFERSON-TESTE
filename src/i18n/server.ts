import { cache } from "react";
import { defaultLocale, pick, type L10n, type Locale } from "./config";

/**
 * Idioma da renderização atual (componentes de servidor).
 * Cada layout e página chama setLocale() antes de renderizar; os componentes
 * leem com getLocale() / t(), sem precisar receber o idioma por props.
 * Componentes de cliente usam useLocale() / useT() de "@/i18n/client".
 */
const store = cache(() => ({ locale: defaultLocale as Locale }));

export const setLocale = (locale: Locale) => {
  store().locale = locale;
};
export const getLocale = (): Locale => store().locale;

/** Escolhe o texto do idioma atual. */
export function t<T>(value: T | L10n<T>): T {
  return pick(getLocale(), value);
}
