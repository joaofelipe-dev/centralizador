import { useCallback, useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Category } from '@/types/product';

interface ProductFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  searchTerm: string;
  filteredCount: number;
  totalCount: number;
  onCategoryChange: (categoryId: string | null) => void;
  onSearchChange: (search: string) => void;
  onClear: () => void;
}

export function ProductFilter({
  categories,
  selectedCategory,
  searchTerm,
  filteredCount,
  totalCount,
  onCategoryChange,
  onSearchChange,
  onClear
}: ProductFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(value), 300);
  }, [onSearchChange]);

  return (
    <div className="space-y-4 p-4 glass-card rounded-xl">
      <Input
        value={localSearch}
        onChange={handleSearchChange}
        placeholder="Buscar produtos..."
        leftIcon={<Search className="h-5 w-5" />}
        fullWidth
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => onCategoryChange(null)}
          variant={selectedCategory === null ? 'default' : 'ghost'}
          size="sm"
          className={selectedCategory === null ? '' : 'bg-muted text-muted-foreground hover:bg-surface-hover'}
        >
          Todos
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            variant={selectedCategory === cat.id ? 'default' : 'ghost'}
            size="sm"
            className={selectedCategory === cat.id ? '' : 'bg-muted text-muted-foreground hover:bg-surface-hover'}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {filteredCount} de {totalCount} produtos
        </span>
        {(searchTerm || selectedCategory) && (
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="text-xs px-3 py-1 bg-muted hover:bg-surface-hover text-muted-foreground hover:text-foreground"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}