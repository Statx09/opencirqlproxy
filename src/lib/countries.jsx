import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

// Convert country code → emoji flag 🇿🇦 🇺🇸 etc
function toFlagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
}

export const COUNTRIES = Object.entries(
  countries.getNames("en", { select: "official" })
).map(([code, name]) => ({
  code,
  name,
  flag: toFlagEmoji(code),
}));