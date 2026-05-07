"use client";

import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import "react-day-picker/style.css";

function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

interface DateInputProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateInput({
  value,
  onChange,
  min,
  placeholder = "DD/MM/AAAA",
  className = "",
  disabled = false
}: DateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: true, left: true });
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const selectedDate = value ? parseDateString(value) : undefined;
  const minDate = min ? parseDateString(min) : undefined;

  const inputValue = React.useMemo(() => {
    if (value) {
      const date = parseDateString(value);
      if (!isNaN(date.getTime())) {
        return format(date, "dd/MM/yyyy");
      }
    }
    return "";
  }, [value]);

  const [userInput, setUserInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);

    if (val.length <= 2) {
      setUserInput(val);
    } else if (val.length <= 4) {
      setUserInput(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setUserInput(`${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`);
    }
  };

  const handleInputBlur = () => {
    const input = userInput || inputValue;
    setTimeout(() => {
      try {
        const parsed = parse(input, "dd/MM/yyyy", new Date());
        if (!isNaN(parsed.getTime())) {
          if (minDate && parsed < minDate) {
            onChange(format(minDate, "yyyy-MM-dd"));
          } else {
            onChange(format(parsed, "yyyy-MM-dd"));
          }
        } else if (value) {
          onChange(value);
        }
      } catch {
        if (value) {
          onChange(value);
        }
      }
    }, 150);
  };

  const handleDaySelect = (date: Date) => {
    if (date) {
      let selectedDate = date;
      if (minDate && date < minDate) {
        selectedDate = minDate;
      }
      onChange(format(selectedDate, "yyyy-MM-dd"));
      setIsOpen(false);
    }
  };

  const toggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const popupClasses = [
    "absolute z-[110] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl p-2",
    position.top ? "top-full mt-2" : "bottom-full mb-2",
    position.left ? "left-0" : "right-0"
  ].join(" ");

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg">
        <Input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={userInput || inputValue}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={handleInputBlur}
          disabled={disabled}
          className={`bg-transparent border-none focus:ring-0 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ width: "100px", textAlign: "center" }}
        />
        <Button
          type="button"
          onClick={toggleCalendar}
          disabled={disabled}
          variant="ghost"
          size="icon"
          className="px-2 text-muted-foreground hover:text-white disabled:opacity-50"
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </div>
      {isOpen && !disabled && (
        <div ref={popupRef} className={popupClasses}>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            fromDate={minDate}
            locale={ptBR}
            className="text-white"
          />
        </div>
      )}
    </div>
  );
}
