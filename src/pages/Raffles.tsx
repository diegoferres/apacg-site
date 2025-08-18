
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndependentSearchBar from '@/components/IndependentSearchBar';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice, toNumber, formatDate } from '@/lib/utils';
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const fetchRaffles = async (search: string = '', page: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page };
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get('api/client/raffles', { params });
      
      setRaffles(response.data.data.data);
      setTotalPages(response.data.data.last_page || 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las rifas. Intente nuevamente más tarde.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    const search = searchParams.get('search') || '';
    
    setCurrentPage(page);
    
    fetchRaffles(search, page);
  }, [searchParams, toast]);

  // Helper function to strip HTML tags for short descriptions
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // Search functionality is now handled by IndependentSearchBar

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
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
          
          <IndependentSearchBar 
            placeholder="Buscar rifas..."
            showCategoryFilter={false}
            module="raffles"
          />
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
          ) : raffles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {raffles.map((raffle) => (
              <Link key={raffle.id} to={`/rifa/${raffle.slug}`} className="block">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                {raffle.cover ? (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={raffle.cover?.storage_path_full}
                      alt={raffle.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(raffle.end_date, { format: 'short' })}
                    </Badge>
                  </div>
                ) : (
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <Ticket className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                      <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(raffle.end_date, { format: 'short' })}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
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
                    <span>Sortea el {formatDate(raffle.end_date, { format: 'short' })}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Precio</span>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(toNumber(raffle.price))}
                      </p>
                    </div>
                    
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={(e) => e.stopPropagation()}
                    >
                        Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchParams.get('search') ? 
                  `No se encontraron rifas que contengan "${searchParams.get('search')}".` :
                  'No se encontraron rifas disponibles.'
                }
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
