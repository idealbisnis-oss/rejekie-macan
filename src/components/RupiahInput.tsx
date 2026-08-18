import React, { useState, useEffect } from "react";
import { parseRupiahInput, formatRupiah, formatRupiahShort, terbilangRupiah } from "../utils/currencyUtils";

interface RupiahInputProps {
  id?: string;
  name?: string;
  value: number | string;
  onChange: (numericValue: number, formattedString: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showQuickButtons?: boolean;
  showTerbilang?: boolean;
  min?: number;
  max?: number;
}

export const RupiahInput: React.FC<RupiahInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Ketik angka (misal: 200jt, 2.5m, atau 200.000.000)",
  className = "",
  required = false,
  disabled = false,
  showQuickButtons = true,
  showTerbilang = true,
}) => {
  const numericVal = typeof value === "number" ? value : parseRupiahInput(value);
  const [displayValue, setDisplayValue] = useState<string>(
    numericVal ? formatRupiah(numericVal) : ""
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Synchronize when external value changes
  useEffect(() => {
    const num = typeof value === "number" ? value : parseRupiahInput(value);
    if (!isFocused) {
      setDisplayValue(num ? formatRupiah(num) : "");
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setDisplayValue(text);

    const parsed = parseRupiahInput(text);
    onChange(parsed, text);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseRupiahInput(displayValue);
    if (parsed > 0) {
      setDisplayValue(formatRupiah(parsed));
      onChange(parsed, formatRupiah(parsed));
    } else if (displayValue.trim() === "" || parsed === 0) {
      setDisplayValue("");
      onChange(0, "");
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleQuickAdd = (multiplier: number) => {
    const nextVal = (numericVal || 0) + multiplier;
    setDisplayValue(formatRupiah(nextVal));
    onChange(nextVal, formatRupiah(nextVal));
  };

  const handleSetExact = (amount: number) => {
    setDisplayValue(formatRupiah(amount));
    onChange(amount, formatRupiah(amount));
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="relative rounded-xl shadow-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500 font-bold text-xs">Rp</span>
        </div>
        <input
          type="text"
          id={id}
          name={name}
          inputMode="numeric"
          required={required}
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl font-mono font-bold text-slate-900 transition-all text-xs sm:text-sm ${className}`}
        />
      </div>

      {/* Live Reading / Terbilang Helper */}
      {showTerbilang && numericVal > 0 && (
        <div className="flex items-center justify-between gap-2 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/30 text-[11px] text-amber-950 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded text-[10px]">
              {formatRupiahShort(numericVal)}
            </span>
            <span className="font-semibold text-slate-800">
              = Rp {formatRupiah(numericVal)}
            </span>
          </div>
          <span className="italic text-slate-600 text-[10.5px]">
            ({terbilangRupiah(numericVal)})
          </span>
        </div>
      )}

      {/* Quick Shorthand Buttons (100 Juta, 1 Miliar, dll) */}
      {showQuickButtons && !disabled && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-slate-400 mr-0.5">Pintasan:</span>
          <button
            type="button"
            onClick={() => handleQuickAdd(10_000_000)}
            className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
          >
            +10 Juta
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(100_000_000)}
            className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
          >
            +100 Juta
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(1_000_000_000)}
            className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
          >
            +1 Miliar
          </button>
          <button
            type="button"
            onClick={() => handleSetExact(200_000_000)}
            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
          >
            200 Jt
          </button>
          {numericVal > 0 && (
            <button
              type="button"
              onClick={() => handleSetExact(0)}
              className="px-1.5 py-0.5 text-red-600 hover:bg-red-50 rounded text-[10px] font-bold transition-colors cursor-pointer ml-auto"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};
