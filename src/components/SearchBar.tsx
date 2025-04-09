
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
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
  onSearch: (term: string, categories: string[]) => void;
  categories: string[] | undefined;
}

// const categories = [
//   "Restaurantes",
//   "Cafeterías",
//   "Tiendas",
//   "Entretenimiento",
//   "Salud",
//   "Educación"
// ];

const SearchBar = ({ onSearch, categories = [] }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value, selectedCategories);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      onSearch(searchTerm, newSelection);
      return newSelection;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative animate-fade-up">
      <div className="flex items-center glass p-2 rounded-xl shadow-sm">
        <div className="flex-1 flex items-center border-r border-border/30 pr-2">
          <Search className="w-5 h-5 text-muted-foreground ml-3 mr-2" />
          <Input
            type="text"
            placeholder="Buscar beneficios, comercios, categorías..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent"
          />
        </div>

        {categories.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Categorías</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
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

export default SearchBar;
