"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

function isValidYMD(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function ymdToUTCDate(ymd: string) {
  return new Date(`${ymd}T00:00:00.000Z`);
}

function utcDateToYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDaysUTC(ymd: string, deltaDays: number) {
  const d = ymdToUTCDate(ymd);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return utcDateToYMD(d);
}

function formatDDMMWeekday(ymd: string) {
  const [, m, d] = ymd.split("-");
  const wd = ymdToUTCDate(ymd).toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
  return `${d}/${m} ${wd}`;
}

function monthTitleUTC(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function daysInUTCMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export default function DateDropdown({
  valueYMD,
  todayYMD,
  onSelect,
  fullWidth = false,
}: {
  valueYMD: string;
  todayYMD: string;
  onSelect: (ymd: string) => void;
  fullWidth?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  const safeValue = isValidYMD(valueYMD) ? valueYMD : todayYMD;

  const initial = useMemo(() => {
    const d = ymdToUTCDate(safeValue);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  }, [safeValue]);

  const [viewY, setViewY] = useState(initial.y);
  const [viewM, setViewM] = useState(initial.m);

  // When dropdown closes, reset month view to current selected date's month
  useEffect(() => {
    if (!open) {
      setViewY(initial.y);
      setViewM(initial.m);
    }
  }, [open, initial.y, initial.m]);

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Scroll selected into view when opening
  useEffect(() => {
    if (open) selectedRef.current?.scrollIntoView({ block: "center" });
  }, [open, viewY, viewM, safeValue]);

  const list = useMemo(() => {
    const total = daysInUTCMonth(viewY, viewM);
    const items: string[] = [];
    for (let day = 1; day <= total; day++) {
      const dd = String(day).padStart(2, "0");
      const mm = String(viewM + 1).padStart(2, "0");
      items.push(`${viewY}-${mm}-${dd}`);
    }
    return items;
  }, [viewY, viewM]);

  const wrapperClass = isDark
    ? "bg-slate-800 text-slate-300 border-slate-700"
    : "bg-gray-100 text-slate-700 border-gray-200";

  const hoverClass = isDark ? "hover:bg-slate-700" : "hover:bg-gray-200";
  const dividerClass = isDark ? "divide-slate-700" : "divide-gray-200";

  const panelClass = isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200";

  const rowBase = isDark ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-gray-100";
  const rowActive = isDark ? "bg-slate-800 text-white" : "bg-gray-200 text-slate-900";

  const gotoPrevMonth = () => {
    const m = viewM - 1;
    if (m < 0) {
      setViewM(11);
      setViewY((y) => y - 1);
    } else setViewM(m);
  };

  const gotoNextMonth = () => {
    const m = viewM + 1;
    if (m > 11) {
      setViewM(0);
      setViewY((y) => y + 1);
    } else setViewM(m);
  };

  const selectPrevDay = () => {
    const prev = addDaysUTC(safeValue, -1);
    onSelect(prev);
  };

  const selectNextDay = () => {
    const next = addDaysUTC(safeValue, 1);
    onSelect(next);
  };

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? "w-full" : ""}`}>
      {/* Top control: Prev day | Date (opens dropdown) | Next day */}
      <div
        className={`h-9 rounded-md border overflow-hidden items-stretch divide-x ${dividerClass} ${
          fullWidth ? "flex w-full" : "inline-flex"
        } ${wrapperClass}`}
      >
        <button
          type="button"
          onClick={selectPrevDay}
          className={`h-full px-2 flex items-center justify-center transition-colors ${hoverClass}`}
          aria-label="Previous day"
        >
          <ChevronLeft size={16} className="opacity-90" />
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`h-full px-3 flex items-center gap-2 text-xs font-bold transition-colors ${
            fullWidth ? "flex-1 justify-center" : ""
          } ${hoverClass}`}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <CalendarDays size={16} className="opacity-90" />
          <span className="whitespace-nowrap">{formatDDMMWeekday(safeValue)}</span>
        </button>

        <button
          type="button"
          onClick={selectNextDay}
          className={`h-full px-2 flex items-center justify-center transition-colors ${hoverClass}`}
          aria-label="Next day"
        >
          <ChevronRight size={16} className="opacity-90" />
        </button>
      </div>

      {open && (
        <div
          className={`absolute left-0 mt-2 rounded-lg border shadow-lg overflow-hidden z-50 ${
            fullWidth ? "w-full" : "w-52"
          } ${panelClass}`}
        >
          {/* Month header (ONLY changes month view; DOES NOT auto-select/filter) */}
          <div
            className={`flex items-center justify-between px-2 py-2 border-b ${
              isDark ? "border-slate-800" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={gotoPrevMonth}
              className={`p-2 rounded-md ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="text-xs font-bold uppercase tracking-wide text-secondary">
              {monthTitleUTC(viewY, viewM)}
            </div>

            <button
              type="button"
              onClick={gotoNextMonth}
              className={`p-2 rounded-md ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onSelect(todayYMD);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wide ${
                safeValue === todayYMD ? rowActive : rowBase
              }`}
            >
              TODAY
            </button>

            {list.map((ymd) => {
              const isSelected = ymd === safeValue;
              return (
                <button
                  key={ymd}
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  onClick={() => {
                    onSelect(ymd);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold whitespace-nowrap ${
                    isSelected ? rowActive : rowBase
                  }`}
                >
                  {formatDDMMWeekday(ymd)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
