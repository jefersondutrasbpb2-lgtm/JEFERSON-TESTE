"use client";

import { usePathname } from "next/navigation";
import { localeFromPathname, pick, type L10n, type Locale } from "./config";

export function useLocale(): Locale {
  return localeFromPathname(usePathname() || "/");
}

export function useT() {
  const locale = useLocale();
  return <T,>(value: T | L10n<T>): T => pick(locale, value);
}
