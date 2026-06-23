"use client";

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
  disabled = false,
}: DateInputProps) {
  return (
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      placeholder={placeholder}
      className={`bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
    />
  );
}
