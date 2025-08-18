
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
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

const Benefits = () => {
  
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  // Categories state removed - handled by IndependentSearchBar
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  


  const fetchBenefits = async (search: string = '', categories: string[] = [], page: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page };
      if (search.trim()) {
        params.search = search.trim();
      }
      if (categories.length > 0) {
        params.categories = categories;
      }

      const response = await api.get('api/client/benefits', { params });
      
      setBenefits(response.data.data.data);
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


  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    const search = searchParams.get('search') || '';
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam ? categoriesParam.split(',') : [];
    
    setCurrentPage(page);
    
    fetchBenefits(search, categories, page);
  }, [searchParams]); // Remove toast from dependencies
  
  
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
            <span className="text-foreground font-medium">Beneficios</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Todos los Beneficios
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Explora todos los beneficios disponibles para los miembros de A.P.A.C. GOETHE.
          </p>
          
          <IndependentSearchBar 
            placeholder="Buscar beneficios..."
            showCategoryFilter={true}
            module="benefits"
          />
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
          ) : benefits.length > 0 ? (
            <div className="space-y-10">
              {Object.entries(
                benefits.reduce((acc: Record<string, Benefit[]>, benefit) => {
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
                {searchParams.get('search') || searchParams.get('categories') ? 
                  'No se encontraron beneficios con los criterios seleccionados.' :
                  'No se encontraron beneficios disponibles.'
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

export default Benefits;
