import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommerceCard, { Commerce } from '@/components/CommerceCard';
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

const Commerces = () => {
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [filteredCommerces, setFilteredCommerces] = useState<Commerce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    setCurrentPage(page);
    
    const fetchCommerces = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('api/client/commerces/list', {
          params: { page }
        });
        
        setCommerces(response.data.data.data);
        setFilteredCommerces(response.data.data.data);
        setTotalPages(response.data.data.last_page || 1);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching commerces:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los comercios. Intente nuevamente más tarde.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchCommerces();
  }, [searchParams, toast]);
  
  const handleSearch = (term: string, categories: string[]) => {
    let results = [...commerces];
    
    if (term) {
      const searchTerm = term.toLowerCase();
      results = results.filter(commerce => 
        commerce.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Nota: Como no tenemos categorías para comercios, ignoramos ese filtro
    
    setFilteredCommerces(results);
  };
  
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="pt-28 pb-8 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Comercios Asociados
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Explora todos los comercios asociados que ofrecen beneficios exclusivos para los miembros de A.P.A.C. GOETHE.
          </p>
          
          <SearchBar onSearch={handleSearch} categories={[]} />
        </div>
      </section>
      
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-64 bg-muted/30 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredCommerces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCommerces.map((commerce, index) => (
                <CommerceCard 
                  key={commerce.id} 
                  commerce={commerce} 
                  delay={100 + index * 50}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron comercios con los criterios seleccionados.</p>
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

export default Commerces;
