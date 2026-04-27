import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import type { Product, Category, Store } from './product';
import type { Cart } from './product';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'glass';
  size?: 'default' | 'icon' | 'sm';
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface ProductFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  searchTerm: string;
  filteredCount: number;
  totalCount: number;
  onCategoryChange: (categoryId: number | null) => void;
  onSearchChange: (search: string) => void;
  onClear: () => void;
}

export interface StoreSelectorProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelect: (store: Store) => void;
}

export interface DateInputProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
}

export interface ProductRowProps {
  product: Product;
  categoryName: string;
  cartItem?: Cart[string];
  updateField: (id: number, field: string, value: number | boolean) => void;
  handleInputChange: (id: number, field: string, value: string) => void;
  getProductIcon: (categoryName: string) => React.ReactNode;
}

export interface OrderFormProps {
  store: Store;
  onBack: () => void;
}

export interface OrderListProps {
  orders: import('./order').Order[];
  onEdit: (order: import('./order').Order) => void;
}

export interface FilterState {
  search: string;
  categoryId: number | null;
}