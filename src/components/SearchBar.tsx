import React, { useState, useEffect, useCallback, useRef } from 'react';
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

interface SearchBarProps {
  // Datos disponibles
  categories?: string[];
  
  // Callbacks
  onSearch: (term: string, categories: string[]) => void;
  onClear?: () => void;
  
  // Configuración opcional
  placeholder?: string;
  isLoading?: boolean;
  showCategoryFilter?: boolean;
  
  // Props para inicialización (opcionales)
  initialSearch?: string;
  initialCategories?: string[];
}

const SearchBar = ({ 
  categories = [],
  onSearch,
  onClear,
  placeholder = "Buscar...",
  isLoading = false,
  showCategoryFilter = true,
  initialSearch = '',
  initialCategories = []
}: SearchBarProps) => {

  // Logs para debugging
  console.log('[SearchBar] Render', { 
    timestamp: Date.now(),
    hasCategories: categories.length > 0,
    initialSearch,
    initialCategories
  });

  // Estado completamente autónomo del SearchBar - SIN conexión a URL
  const [localSearchTerm, setLocalSearchTerm] = useState(initialSearch);
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(initialCategories);
  const inputRef = useRef<HTMLInputElement>(null);
  const renderCount = useRef(0);
  const lastFocusPosition = useRef<number>(0);

  // Log de renders
  useEffect(() => {
    renderCount.current++;
    console.log(`[SearchBar] Render count: ${renderCount.current}`);
  });

  // Log de mount/unmount
  useEffect(() => {
    console.log('[SearchBar] Component mounted');
    return () => {
      console.log('[SearchBar] Component unmounted');
    };
  }, []);

  // Preservar focus con técnica mejorada
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      const position = lastFocusPosition.current;
      console.log('[SearchBar] Preserving focus at position:', position);
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(position, position);
      });
    }
  });

  // Función debounce estable
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounce estable con ref - se crea una sola vez
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  
  const debouncedSearchRef = useRef(
    debounce((term: string, categories: string[]) => {
      console.log('[SearchBar] Calling onSearch', { term, categories, timestamp: Date.now() });
      onSearchRef.current(term, categories);
    }, 300)
  );
  
  // Solo recrear debounce si cambia la función (no debería pasar con nuestros callbacks estables)
  useEffect(() => {
    console.log('[SearchBar] onSearch callback changed, recreating debounce');
    debouncedSearchRef.current = debounce((term: string, categories: string[]) => {
      console.log('[SearchBar] Calling onSearch (recreated)', { term, categories, timestamp: Date.now() });
      onSearchRef.current(term, categories);
    }, 300);
  }, [onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    
    console.log('[SearchBar] Input change:', { value, position });
    
    lastFocusPosition.current = position;
    setLocalSearchTerm(value);
    debouncedSearchRef.current(value, localSelectedCategories);
  };

  const handleClearSearch = () => {
    console.log('[SearchBar] Clear search');
    setLocalSearchTerm('');
    lastFocusPosition.current = 0;
    onSearch('', localSelectedCategories);
    
    // Mantener focus después de limpiar
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const toggleCategory = (category: string) => {
    const newSelection = localSelectedCategories.includes(category)
      ? localSelectedCategories.filter(c => c !== category)
      : [...localSelectedCategories, category];
    
    console.log('[SearchBar] Toggle category:', { category, newSelection });
    
    setLocalSelectedCategories(newSelection);
    onSearch(localSearchTerm, newSelection);
    
    // Mantener focus después de filtrar
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('[SearchBar] Enter key pressed');
      onSearch(localSearchTerm, localSelectedCategories);
    }
  };

  // Log de estado
  useEffect(() => {
    console.log('[SearchBar] State change', { 
      localSearchTerm, 
      localSelectedCategories,
      hasFocus: document.activeElement === inputRef.current
    });
  }, [localSearchTerm, localSelectedCategories]);

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
              console.log('[SearchBar] Input focused');
              lastFocusPosition.current = e.target.selectionStart || 0;
            }}
            onBlur={() => {
              console.log('[SearchBar] Input blurred');
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
                      console.log('[SearchBar] Clear categories');
                      setLocalSelectedCategories([]);
                      onSearch(localSearchTerm, []);
                      requestAnimationFrame(() => {
                        inputRef.current?.focus();
                      });
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

// React.memo mejorado con comparación estricta
export default React.memo(SearchBar, (prevProps, nextProps) => {
  const isEqual = 
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.showCategoryFilter === nextProps.showCategoryFilter &&
    prevProps.onSearch === nextProps.onSearch && // Comparar callbacks
    prevProps.onClear === nextProps.onClear &&
    prevProps.initialSearch === nextProps.initialSearch &&
    JSON.stringify(prevProps.categories) === JSON.stringify(nextProps.categories) &&
    JSON.stringify(prevProps.initialCategories) === JSON.stringify(nextProps.initialCategories);
  
  console.log('[SearchBar] Memo comparison:', { 
    isEqual, 
    changes: {
      placeholder: prevProps.placeholder !== nextProps.placeholder,
      isLoading: prevProps.isLoading !== nextProps.isLoading,
      showCategoryFilter: prevProps.showCategoryFilter !== nextProps.showCategoryFilter,
      onSearch: prevProps.onSearch !== nextProps.onSearch,
      onClear: prevProps.onClear !== nextProps.onClear,
      initialSearch: prevProps.initialSearch !== nextProps.initialSearch,
      initialCategories: JSON.stringify(prevProps.initialCategories) !== JSON.stringify(nextProps.initialCategories),
      categories: JSON.stringify(prevProps.categories) !== JSON.stringify(nextProps.categories)
    },
    prevCategories: prevProps.categories,
    nextCategories: nextProps.categories,
    prevCallbacks: {
      onSearch: prevProps.onSearch?.toString().slice(0, 100),
      onClear: prevProps.onClear?.toString().slice(0, 100)
    },
    nextCallbacks: {
      onSearch: nextProps.onSearch?.toString().slice(0, 100),
      onClear: nextProps.onClear?.toString().slice(0, 100)
    }
  });
  
  return isEqual;
});