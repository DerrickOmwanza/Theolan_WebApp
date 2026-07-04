import { useState, useRef, useEffect } from "react";
import {
  EAST_AFRICAN_COUNTRIES,
  DEFAULT_COUNTRY,
  formatFullPhone,
  parsePhone,
  getFlagEmoji,
} from "../data/countries.js";

/**
 * CountryPhoneInput — a phone input with a country-code dropdown.
 *
 * Props:
 *   value       — the full phone string (e.g. "+254712345678")
 *   onChange    — called with the full phone string on every change
 *   error       — error message string
 *   id          — HTML id for the input
 *   disabled    — disables the component
 *   placeholder — placeholder for local number
 */
export default function CountryPhoneInput({
  value = "",
  onChange,
  error,
  id = "phone",
  disabled = false,
  placeholder = "712345678",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const wrapperRef = useRef(null);

  const { countryCode, localNumber } = parsePhone(value);
  const selectedCountry =
    EAST_AFRICAN_COUNTRIES.find((c) => c.code === countryCode) ||
    DEFAULT_COUNTRY;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = EAST_AFRICAN_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery) ||
      c.iso.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCountrySelect = (country) => {
    const newFull = formatFullPhone(country.code, localNumber);
    onChange(newFull);
    setDropdownOpen(false);
    setSearchQuery("");
  };

  const handleLocalNumberChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const newFull = formatFullPhone(selectedCountry.code, raw);
    onChange(newFull);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={`flex rounded-md border bg-charcoal-700 overflow-hidden transition-colors ${
          error
            ? "border-red-500"
            : "border-silver-600 focus-within:border-cobalt focus-within:ring-1 focus-within:ring-cobalt"
        }`}
      >
        {/* Country Dropdown Trigger */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 px-3 bg-charcoal-800 border-r border-silver-600
                     hover:bg-charcoal-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed min-w-[96px]"
          aria-label="Select country code"
          aria-expanded={dropdownOpen}
        >
          <span
            className="text-base"
            role="img"
            aria-label={`${selectedCountry.name} flag`}
          >
            {getFlagEmoji(selectedCountry.iso)}
          </span>
          <span className="text-warmwhite text-sm font-medium">
            {selectedCountry.code}
          </span>
          <svg
            className={`w-3 h-3 text-silver-400 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Phone Number Input */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          placeholder={placeholder}
          value={localNumber}
          onChange={handleLocalNumberChange}
          disabled={disabled}
          autoComplete="tel"
          className="flex-1 px-3 py-3 bg-transparent text-warmwhite placeholder-silver-500
                     focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                     text-base"
          aria-label="Phone number"
        />
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}

      {/* Country Dropdown */}
      {dropdownOpen && (
        <div
          className="absolute z-50 mt-1 w-64 bg-charcoal-700 border border-silver-600 rounded-md shadow-lg overflow-hidden"
          role="listbox"
        >
          {/* Search */}
          <div className="p-2 border-b border-silver-600">
            <input
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-charcoal-800 border border-silver-600 rounded
                         text-warmwhite placeholder-silver-500 focus:outline-none focus:border-cobalt"
              autoFocus
            />
          </div>

          {/* Country List */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filteredCountries.length === 0 && (
              <li className="px-3 py-2 text-sm text-silver-400">
                No countries found
              </li>
            )}
            {filteredCountries.map((country) => (
              <li
                key={country.iso}
                role="option"
                aria-selected={country.code === selectedCountry.code}
                onClick={() => handleCountrySelect(country)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
                  ${
                    country.code === selectedCountry.code
                      ? "bg-cobalt/20 text-cobalt-300"
                      : "text-warmwhite hover:bg-charcoal-600"
                  }`}
              >
                <span
                  className="text-base"
                  role="img"
                  aria-label={`${country.name} flag`}
                >
                  {getFlagEmoji(country.iso)}
                </span>
                <span className="flex-1 text-sm">{country.name}</span>
                <span className="text-silver-400 text-xs">{country.code}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
