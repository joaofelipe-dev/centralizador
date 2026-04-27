import { Search } from 'lucide-react';
import React, { useCallback, useRef } from 'react';
import type { SearchInputProps } from '@/types/components';

export function SearchInput({ value, onChange, placeholder = "Buscar...", className }: SearchInputProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onChange(e.target.value);
    }, 300);
  }, [onChange]);

  return (
    <div className={`relative ${className ?? ''}`}>
      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
      />
    </div>
  );
}