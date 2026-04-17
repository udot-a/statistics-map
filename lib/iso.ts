import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

let registered = false;
function ensureRegistered() {
  if (!registered) {
    countries.registerLocale(enLocale);
    registered = true;
  }
}

export function iso3ToIso2(iso3: string): string | null {
  ensureRegistered();
  const v = countries.alpha3ToAlpha2(iso3.toUpperCase());
  return v ? v.toUpperCase() : null;
}

export function iso2ToIso3(iso2: string): string | null {
  ensureRegistered();
  const v = countries.alpha2ToAlpha3(iso2.toUpperCase());
  return v ? v.toUpperCase() : null;
}
