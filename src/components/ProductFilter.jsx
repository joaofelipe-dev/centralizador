import React from 'react';
import { SearchInput } from '@/components/ui/SearchInput';

export function ProductFilter({
  categories,
  selectedCategory,
  searchTerm,
  filteredCount,
  totalCount,
  onCategoryChange,
  onSearchChange,
  onClear
}) {
  return (
    <div className="space-y-4 p-4 glass-card rounded-xl">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Buscar produtos..."
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
            selectedCategory === null
              ? 'bg-primary text-white'
              : 'bg-white/5 text-muted-foreground hover:bg-white/10'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {filteredCount} de {totalCount} produtos
        </span>
        {(searchTerm || selectedCategory) && (
          <button
            onClick={onClear}
            className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-all"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
