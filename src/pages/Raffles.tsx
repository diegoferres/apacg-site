
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import api from '@/services/api';

export interface Raffle {
  id: number;
  title: string;
  short_description: string;
  description: string;
  end_date: string;
  price: number;
  cover: {
    storage_path_full: string;
  };
  slug: string;
}

const Raffles = () => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [filteredRaffles, setFilteredRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const itemsPerPage = 6;

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    setCurrentPage(page);
    
    // En el futuro, aquí se haría la llamada al API
    const fetchRaffles = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('api/client/raffles', {
          params: { page }
        });
        const rafflesData = response.data.data.data;
        setRaffles(rafflesData);
        setFilteredRaffles(rafflesData);
        setTotalPages(Math.ceil(response.data.data.last_page || 1));
      } catch (error) {
        console.error('Error fetching raffles:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las rifas. Intente nuevamente más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRaffles();
    
    setIsLoading(false);
  }, [searchParams, toast]);

  // Helper function to strip HTML tags for short descriptions
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const handleSearch = (term: string, categories: string[]) => {
    let results = [...raffles];
    
    if (term) {
      const searchTerm = term.toLowerCase();
      results = results.filter(raffle => 
        raffle.title.toLowerCase().includes(searchTerm) ||
        raffle.description.toLowerCase().includes(searchTerm) ||
        raffle.short_description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Las rifas no tienen categorías por ahora, pero se puede agregar en el futuro
    setFilteredRaffles(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1);
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'No definido' || dateString.trim() === '') {
      return 'No definido';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'No definido';
      }
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'No definido';
    }
  };



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="pt-28 pb-8 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Rifas</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Rifas Disponibles
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Participa en nuestras rifas benéficas y ayuda a A.P.A.C. GOETHE mientras ganas increíbles premios.
          </p>
          
          <SearchBar onSearch={handleSearch} categories={[]} />
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-96 bg-muted/30 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredRaffles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRaffles.map((raffle) => (
              <Card key={raffle.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(raffle.end_date)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                    {raffle.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {stripHtml(raffle.short_description)}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>Sortea el {formatDate(raffle.end_date)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Precio</span>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(raffle.price)}
                      </p>
                    </div>
                    
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to={`/rifa/${raffle.slug}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron rifas con los criterios seleccionados.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => handlePageChange(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <PaginationItem key={page}>...</PaginationItem>;
                  }
                  return null;
                })}
                
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Raffles;
