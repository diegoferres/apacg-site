
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
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

const Benefits = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [filteredBenefits, setFilteredBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    setCurrentPage(page);
    
    const fetchBenefits = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('api/client/benefits', {
          params: { page }
        });
        
        setBenefits(response.data.data.data);
        setFilteredBenefits(response.data.data.data);
        setTotalPages(response.data.data.last_page || 1);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching benefits:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los beneficios. Intente nuevamente más tarde.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchBenefits();
  }, [searchParams, toast]);
  
  const handleSearch = (term: string, categories: string[]) => {
    let results = [...benefits];
    
    if (term) {
      const searchTerm = term.toLowerCase();
      results = results.filter(benefit => 
        benefit.title.toLowerCase().includes(searchTerm) ||
        benefit.description.toLowerCase().includes(searchTerm) ||
        benefit.commerce.name.toLowerCase().includes(searchTerm) ||
        benefit.category.name.toLowerCase().includes(searchTerm)
      );
    }
    
    if (categories.length > 0) {
      results = results.filter(benefit => 
        categories.includes(benefit.category.name)
      );
    }
    
    setFilteredBenefits(results);
  };
  
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const availableCategories = Array.from(
    new Set(benefits.map(b => b.category.name))
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="pt-28 pb-8 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Beneficios</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Todos los Beneficios
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Explora todos los beneficios disponibles para los miembros de A.P.A.C. GOETHE.
          </p>
          
          <SearchBar onSearch={handleSearch}  categories={availableCategories} />
        </div>
      </section>
      
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-96 bg-muted/30 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredBenefits.length > 0 ? (
            <div className="space-y-10">
              {Object.entries(
                filteredBenefits.reduce((acc: Record<string, Benefit[]>, benefit) => {
                  const category = benefit.category.name;
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(benefit);
                  return acc;
                }, {})
              ).map(([category, benefitsInCategory]) => (
                <div key={category}>
                  <h2 className="text-2xl font-semibold mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefitsInCategory.map((benefit, index) => (
                      <BenefitCard
                        key={benefit.id}
                        benefit={benefit}
                        delay={100 + index * 50}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron beneficios con los criterios seleccionados.
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

export default Benefits;
