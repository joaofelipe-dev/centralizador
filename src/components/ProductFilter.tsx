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
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <Input
        value={localSearch}
        onChange={handleSearchChange}
        placeholder="Buscar produtos..."
        leftIcon={<Search className="h-5 w-5" />}
        fullWidth
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button
          onClick={() => onCategoryChange(null)}
          variant={selectedCategory === null ? 'default' : 'outline'}
          className="shrink-0"
        >
          Todos
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            className="shrink-0"
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
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}