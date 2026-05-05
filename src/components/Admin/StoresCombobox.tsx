import React, { useState, useRef, useEffect, useId } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import type { Store } from "@/types/product";

interface StoresComboboxProps {
  stores: Store[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function StoresCombobox({
  stores,
  selectedIds,
  onChange,
  disabled = false,
}: StoresComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selectedStores = stores.filter(s => selectedIds.includes(String(s.id)));

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStore = (id: string) => {
    const stringId = String(id);
    if (selectedIds.includes(stringId)) {
      onChange(selectedIds.filter(i => i !== stringId));
    } else {
      onChange([...selectedIds, stringId]);
    }
  };

  const removeStore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter(i => i !== String(id)));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2 block">
        Lojas com Acesso
      </label>

      <div
        className={`flex flex-wrap gap-1.5 p-3 bg-white/5 border border-white/10 rounded-xl min-h-[44px] cursor-pointer transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "focus-within:ring-2 focus-within:ring-primary/50"
        }`}
        onClick={() => !disabled && setOpen(!open)}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label="Selecionar lojas"
      >
        {selectedStores.length > 0 ? (
          selectedStores.map(s => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 bg-primary/20 text-primary text-xs px-2 py-1 rounded-lg border border-primary/30"
            >
              {s.name}
              <button
                type="button"
                onClick={e => !disabled && removeStore(String(s.id), e)}
                disabled={disabled}
                className="hover:text-red-400 transition-colors"
                aria-label={`Remover ${s.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Selecione as lojas...</span>
        )}
        <ChevronDown className={`h-4 w-4 ml-auto text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

       {open && !disabled && (
        <div id={listboxId} role="listbox" className="absolute z-50 w-full mt-1 bg-black/95 border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 p-2 border-b border-white/5">
            <Search className="h-4 w-4 text-muted-foreground ml-2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar loja..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none py-2"
              aria-label="Buscar loja"
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filteredStores.length > 0 ? (
              filteredStores.map(s => {
                const isSelected = selectedIds.includes(String(s.id));
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStore(String(s.id))}
                    className={`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                      isSelected ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-white"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? "bg-primary border-primary" : "border-white/30"
                    }`}>
                      {isSelected && <span className="text-[10px]">✓</span>}
                    </div>
                    {s.name}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                Nenhuma loja encontrada
              </div>
            )}
          </div>
          {selectedIds.length > 0 && (
            <div className="px-3 py-2 border-t border-white/5 text-xs text-muted-foreground">
              {selectedIds.length} loja(s) selecionada(s)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
