
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndependentSearchBar from '@/components/IndependentSearchBar';
import { Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  date_format: string;
  cover?: {
    storage_path_full: string;
  };
  content: string;
}



const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const fetchNews = async (search: string = '', page: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page };
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get('api/client/news', { params });
      
      setNews(response.data.data.data);
      setTotalPages(response.data.data.last_page || 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las noticias. Intente nuevamente más tarde.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    const search = searchParams.get('search') || '';
    
    setCurrentPage(page);
    
    fetchNews(search, page);
  }, [searchParams, toast]);
  
  // Search functionality is now handled by IndependentSearchBar
  
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };
  
  
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
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
            <span className="text-foreground font-medium">Novedades</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Novedades
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Mantente al día con las últimas noticias y novedades de A.P.A.C. GOETHE.
          </p>
          
          <IndependentSearchBar 
            placeholder="Buscar noticias..."
            showCategoryFilter={false}
            module="news"
          />
        </div>
      </section>
      
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-80 bg-muted/30 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, index) => (
                <Link key={item.id} to={`/novedad/${item.slug}`} className="block">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-up cursor-pointer" style={{ animationDelay: `${100 + index * 100}ms` }}>
                  {item.cover ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={item.cover?.storage_path_full}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.date_format || formatDate(item.date, { format: 'short' })}
                      </Badge>
                    </div>
                  ) : (
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                        <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          {item.date_format || formatDate(item.date, { format: 'short' })}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {stripHtml(item.excerpt)}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <span className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm">
                      Leer más
                    </span>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchParams.get('search') ? 
                  `No se encontraron novedades que contengan "${searchParams.get('search')}".` :
                  'No se encontraron novedades disponibles.'
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

export default News;
