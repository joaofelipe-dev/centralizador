import { SearchInput } from '@/components/ui/SearchInput';
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
  return (
    <div className="space-y-4 p-4 glass-card rounded-xl">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Buscar produtos..."
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => onCategoryChange(null)}
          variant={selectedCategory === null ? 'default' : 'ghost'}
          size="sm"
          className={selectedCategory === null ? '' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}
        >
          Todos
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            variant={selectedCategory === cat.id ? 'default' : 'ghost'}
            size="sm"
            className={selectedCategory === cat.id ? '' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}
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
            className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}