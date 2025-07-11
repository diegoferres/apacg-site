
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
import SearchBar from '@/components/SearchBar';
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
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const itemsPerPage = 6;
  
  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    setCurrentPage(page);
    
    const loadNews = async () => {
      setIsLoading(true);
      
      try {
        const response = await api.get('api/client/news');
        const newsData = response.data.data.data;
        setNews(newsData);
        setFilteredNews(newsData);
        console.log('response.data.data.data', newsData);
        setTotalPages(Math.ceil(response.data.data.last_page || 1));
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNews();
  }, [searchParams]);
  
  const handleSearch = (term: string) => {
    let results = [...news];
    
    if (term) {
      const searchTerm = term.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.excerpt.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredNews(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when searching
    setSearchParams({ page: '1' });
  };
  
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  // Paginar resultados
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);
  
  console.log('Debug info:', {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    filteredNewsLength: filteredNews.length,
    paginatedNewsLength: paginatedNews.length,
    paginatedNews
  });

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
          
          <SearchBar onSearch={handleSearch} categories={[]} />
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
          ) : paginatedNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedNews.map((item, index) => (
                <Link key={item.id} to={`/novedad/${item.slug}`} className="block">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-up cursor-pointer" style={{ animationDelay: `${100 + index * 100}ms` }}>
                  {item.cover ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.cover?.storage_path_full}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(item.date_format)}
                      </Badge>
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                        <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(item.date_format)}
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
              <p className="text-muted-foreground">No se encontraron novedades con los criterios seleccionados.</p>
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
