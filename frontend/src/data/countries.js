// East African countries with phone code info
export const EAST_AFRICAN_COUNTRIES = [
  { name: "Kenya", code: "+254", iso: "KE", digits: 9 },
  { name: "Tanzania", code: "+255", iso: "TZ", digits: 9 },
  { name: "Uganda", code: "+256", iso: "UG", digits: 9 },
  { name: "Rwanda", code: "+250", iso: "RW", digits: 9 },
  { name: "Burundi", code: "+257", iso: "BI", digits: 8 },
  { name: "South Sudan", code: "+211", iso: "SS", digits: 9 },
  { name: "Ethiopia", code: "+251", iso: "ET", digits: 9 },
  { name: "Somalia", code: "+252", iso: "SO", digits: 9 },
  { name: "Djibouti", code: "+253", iso: "DJ", digits: 8 },
  { name: "Eritrea", code: "+291", iso: "ER", digits: 7 },
  { name: "Madagascar", code: "+261", iso: "MG", digits: 9 },
  { name: "Mozambique", code: "+258", iso: "MZ", digits: 9 },
  { name: "Zambia", code: "+260", iso: "ZM", digits: 9 },
  { name: "Zimbabwe", code: "+263", iso: "ZW", digits: 9 },
  { name: "Malawi", code: "+265", iso: "MW", digits: 9 },
  { name: "Mauritius", code: "+230", iso: "MU", digits: 7 },
  { name: "Comoros", code: "+269", iso: "KM", digits: 7 },
  { name: "DRC", code: "+243", iso: "CD", digits: 9 },
  { name: "Seychelles", code: "+248", iso: "SC", digits: 7 },
];

export const DEFAULT_COUNTRY = EAST_AFRICAN_COUNTRIES[0]; // Kenya

/**
 * Convert ISO country code to flag emoji
 */
export function getFlagEmoji(isoCode) {
  const codePoints = isoCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

/**
 * Combine country code + local number into full E.164 format
 */
export function formatFullPhone(countryCode, localNumber) {
  const cleaned = (localNumber || "").replace(/\D/g, "");
  return countryCode + cleaned;
}

/**
 * Parse a full phone number into country code + local number
 */
export function parsePhone(fullPhone) {
  if (!fullPhone) return { countryCode: DEFAULT_COUNTRY.code, localNumber: "" };
  const cleaned = fullPhone.replace(/\D/g, "");

  for (const country of EAST_AFRICAN_COUNTRIES) {
    const codeDigits = country.code.replace("+", "");
    if (cleaned.startsWith(codeDigits) || ("+" + cleaned).startsWith(country.code)) {
      const codeLen = country.code.length;
      const stripped = fullPhone.startsWith("+") ? fullPhone : "+" + cleaned;
      return {
        countryCode: country.code,
        localNumber: stripped.slice(codeLen),
      };
    }
  }

  return { countryCode: DEFAULT_COUNTRY.code, localNumber: fullPhone.replace(/^\+?\d+/, "") };
}

/**
 * Validate a local number against the selected country
 */
export function validateLocalNumber(localNumber, country) {
  const cleaned = (localNumber || "").replace(/\D/g, "");
  if (!cleaned) {
    return { valid: false, message: "Phone number is required" };
  }
  if (cleaned.length !== country.digits) {
    return {
      valid: false,
      message: `Phone number must be exactly ${country.digits} digits for ${country.name}`,
    };
  }
  return { valid: true, message: null };
}
