import { useState, useRef, useEffect, useId } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

interface ChipsInputProps {
  label: string;
  value: string | string[]; // comma-separated string OR array (from GraphQL)
  onChange: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export function ChipsInput({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter...",
  error,
  helperText,
}: ChipsInputProps) {
  const generatedId = useId();
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalise value: accept both string and string[] (GraphQL may return arrays)
  const valueStr = Array.isArray(value) ? value.join(", ") : (value ?? "");
  const chips = valueStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const chipSet = new Set(chips);
  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !chipSet.has(s)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addChip = (chip: string) => {
    const trimmed = chip.trim();
    if (!trimmed || chips.includes(trimmed)) return;
    const newValue = chips.length > 0 ? `${valueStr}, ${trimmed}` : trimmed;
    onChange(newValue);
    setInputValue("");
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const removeChip = (index: number) => {
    const newChips = [...chips];
    newChips.splice(index, 1);
    onChange(newChips.join(", "));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        const sug = filteredSuggestions[highlightedIndex];
        if (sug) addChip(sug);
      } else if (inputValue.trim()) {
        addChip(inputValue);
      }
    } else if (e.key === "Backspace" && inputValue === "" && chips.length > 0) {
      removeChip(chips.length - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    setHighlightedIndex(-1);
    // Compute dropdown visibility with the new value immediately (avoid one-keystroke lag)
    const chipSet = new Set(Array.isArray(value) ? value : (value ?? "").split(",").map((s) => s.trim()).filter(Boolean));
    const newFiltered = suggestions.filter(
      (s) => s.toLowerCase().includes(newVal.toLowerCase()) && !chipSet.has(s),
    );
    setShowDropdown(newFiltered.length > 0);
  };

  const handleFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const errorId = error ? `${generatedId}-error` : undefined;
  const helperId = helperText ? `${generatedId}-helper` : undefined;
  const listboxId = `${generatedId}-listbox`;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;
  const activeDescendant = highlightedIndex >= 0 && showDropdown ? `${generatedId}-option-${highlightedIndex}` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={generatedId}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      <div
        ref={containerRef}
        className={clsx(
          "relative flex min-h-[38px] flex-wrap items-center gap-1 rounded-lg border bg-slate-900 px-2 py-1.5",
          "focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500",
          error ? "border-red-700" : "border-slate-700"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {chips.map((chip, index) => (
          <span
            key={`${chip}-${index}`}
            className="inline-flex items-center rounded-md bg-slate-700/70 px-2 py-0.5 text-xs font-medium text-slate-200"
          >
            {chip}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(index);
              }}
              className="ml-1 rounded p-0.5 text-slate-400 hover:bg-slate-600 hover:text-red-400 focus:ring-2 focus:ring-slate-500 focus:outline-none"
              aria-label={`Remove ${chip}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={generatedId}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={chips.length === 0 ? placeholder : ""}
          aria-describedby={describedBy}
          aria-expanded={showDropdown && filteredSuggestions.length > 0}
          aria-controls={showDropdown && filteredSuggestions.length > 0 ? listboxId : undefined}
          aria-activedescendant={activeDescendant}
          role="combobox"
          aria-autocomplete="list"
          className="min-w-[80px] flex-1 border-0 bg-transparent p-0 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-0"
        />
        {showDropdown && filteredSuggestions.length > 0 && (
          <ul id={listboxId} className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-800 shadow-lg" role="listbox">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                id={`${generatedId}-option-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  addChip(suggestion);
                }}
                tabIndex={0}
                role="option"
                aria-selected={index === highlightedIndex}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    addChip(suggestion);
                  }
                }}
                className={clsx(
                  "cursor-pointer px-3 py-1.5 text-sm text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none",
                  index === highlightedIndex
                    ? "bg-slate-600/70"
                    : "hover:bg-slate-700/70"
                )}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
}