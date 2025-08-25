import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import api from '@/services/api';
import analytics from '@/services/analytics';

interface IndependentSearchBarProps {
  placeholder?: string;
  showCategoryFilter?: boolean;
  module: 'benefits' | 'commerces' | 'events' | 'news' | 'raffles' | 'courses';
}

const IndependentSearchBar = ({ 
  placeholder = "Buscar...",
  showCategoryFilter = false,
  module
}: IndependentSearchBarProps) => {

  // Completamente independiente - maneja sus propios params
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearchTerm, setLocalSearchTerm] = useState(() => searchParams.get('search') || '');
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(() => 
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs para preservar focus
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusPosition = useRef<number>(0);



  // Cargar categorías solo si es necesario
  useEffect(() => {
    if (showCategoryFilter && module === 'benefits') {
      const fetchCategories = async () => {
        try {
          const response = await api.get('api/client/categories');
          setCategories(response.data.data.map((cat: any) => cat.name));
        } catch (error) {
          console.error('[IndependentSearchBar] Error fetching categories:', error);
        }
      };
      fetchCategories();
    }
  }, [showCategoryFilter, module]);

  // Preservar focus agresivamente
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      const position = lastFocusPosition.current;
      // Usar setTimeout para asegurar que el DOM esté actualizado
      setTimeout(() => {
        if (input && document.contains(input)) {
          input.focus();
          input.setSelectionRange(position, position);
        }
      }, 0);
    }
  });

  // Función debounce estable
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const performSearch = useCallback((term: string, categories: string[]) => {
    
    const newParams = new URLSearchParams();
    if (term.trim()) {
      newParams.set('search', term.trim());
    }
    if (categories.length > 0) {
      newParams.set('categories', categories.join(','));
    }
    
    setSearchParams(newParams);
  }, [setSearchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    
    
    lastFocusPosition.current = position;
    setLocalSearchTerm(value);
    
    // Debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(value, localSelectedCategories);
      
      // Track search event if there's a search term
      if (value.trim()) {
        analytics.trackSearch(value.trim(), module);
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    lastFocusPosition.current = 0;
    performSearch('', localSelectedCategories);
    
    // Mantener focus
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const toggleCategory = (category: string) => {
    const newSelection = localSelectedCategories.includes(category)
      ? localSelectedCategories.filter(c => c !== category)
      : [...localSelectedCategories, category];
    
    setLocalSelectedCategories(newSelection);
    performSearch(localSearchTerm, newSelection);
    
    // Track filter applied event
    if (newSelection.length > 0) {
      analytics.trackFilterApplied('category', newSelection, module);
    }
    
    // Mantener focus
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(localSearchTerm, localSelectedCategories);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative animate-fade-up">
      <div className="flex items-center glass p-2 rounded-xl shadow-sm">
        <div className="flex-1 flex items-center border-r border-border/30 pr-2">
          <Search className="w-5 h-5 text-muted-foreground ml-3 mr-2" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={localSearchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onFocus={(e) => {
              lastFocusPosition.current = e.target.selectionStart || 0;
            }}
            onBlur={() => {
            }}
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent"
            disabled={isLoading}
          />
          {localSearchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground mr-2"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showCategoryFilter && categories.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Filtrar{localSelectedCategories.length > 0 ? ` (${localSelectedCategories.length})` : ''}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Categorías</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={localSelectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
              {localSelectedCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    onCheckedChange={() => {
                      setLocalSelectedCategories([]);
                      performSearch(localSearchTerm, []);
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 0);
                    }}
                    className="text-muted-foreground justify-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </DropdownMenuCheckboxItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button size="sm" className="ml-2">
          Buscar
        </Button>
      </div>
    </div>
  );
};


export default IndependentSearchBar;