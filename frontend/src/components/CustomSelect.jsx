import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ label, value, onChange, options = [], disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    setHighlightedIndex(options.findIndex((opt) => opt.value === value));
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleOptionSelect = (option) => {
    onChange(option.value);
    closeDropdown();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      closeDropdown();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) { setIsOpen(true); setHighlightedIndex(0); }
      else { setHighlightedIndex((prev) => prev < options.length - 1 ? prev + 1 : 0); }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) { setHighlightedIndex((prev) => prev > 0 ? prev - 1 : options.length - 1); }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && buttonRef.current && listRef.current && !buttonRef.current.contains(e.target) && !listRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      const optionEl = listRef.current?.children[highlightedIndex];
      if (optionEl) optionEl.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative inline-block w-full">
      {label && (
        <label className="block text-xs text-silver-500 mb-1.5">{label}</label>
      )}
      <button ref={buttonRef} type="button" disabled={disabled} onClick={openDropdown} onKeyDown={handleKeyDown} className="w-full px-3 py-2 text-sm rounded-md bg-charcoal-700 border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-charcoal-600 text-warmwhite hover:border-cobalt/50 transition-colors flex items-center justify-between" aria-haspopup="listbox" aria-expanded={isOpen} aria-disabled={disabled}>
        <span className={value ? "text-warmwhite" : "text-silver-400"}>{selectedOption?.label || "Select..."}</span>
        <svg className={`w-4 h-4 text-silver-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div ref={listRef} className="absolute z-50 mt-1 w-full bg-charcoal-800 border border-charcoal-600 rounded-md shadow-lg max-h-60 overflow-y-auto py-1 focus:outline-none" role="listbox" aria-label={label}>
          {options.map((option, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = option.value === value;
            return (
              <button key={option.value} type="button" onClick={() => handleOptionSelect(option)} onMouseEnter={() => setHighlightedIndex(index)} onMouseLeave={() => setHighlightedIndex(-1)} className={`w-full px-3 py-2 text-left text-sm transition-colors ${isSelected ? "bg-cobalt text-warmwhite" : isHighlighted ? "bg-charcoal-600 text-warmwhite" : "text-silver-300 hover:bg-charcoal-600 hover:text-warmwhite"}`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOptionSelect(option); }}}>{option.label}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}
