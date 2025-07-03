
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, ArrowLeft, FileText } from 'lucide-react';
import { NewsItem } from './News';
import api from '@/services/api';



const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem & { fullContent: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadNewsDetail = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/client/news/${slug}`);
        setNewsItem(response.data.data);
      } catch (error) {
        console.error('Error fetching news detail:', error);
      }
      setIsLoading(false);
    };
    
    loadNewsDetail();
  }, [slug]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-28 pb-16 px-4 flex-1">
          <div className="container mx-auto max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
              <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-muted rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!newsItem) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-28 pb-16 px-4 flex-1">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-2xl font-bold mb-4">Novedad no encontrada</h1>
            <p className="text-muted-foreground mb-8">
              La novedad que buscas no existe o ha sido eliminada.
            </p>
            <Button asChild>
              <Link to="/novedades">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Novedades
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <article className="pt-28 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/novedades" className="hover:text-foreground transition-colors">Novedades</Link>
            <span>/</span>
            <span className="text-foreground font-medium line-clamp-1">{newsItem.title}</span>
          </nav>
          
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-6 -ml-4">
            <Link to="/novedades">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Novedades
            </Link>
          </Button>
          
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(newsItem.date_format)}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-up">
              {newsItem.title}
            </h1>
            
            <p className="text-lg text-muted-foreground animate-fade-up">
              {newsItem.excerpt}
            </p>
          </header>
          
          {/* Featured image */}
          {newsItem.cover ? (
            <div className="relative mb-8 animate-fade-up">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={newsItem.cover.storage_path_full}
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="relative mb-8 animate-fade-up">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <FileText className="h-16 w-16 text-primary/60" />
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="prose prose-lg max-w-none animate-fade-up">
            <div 
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
              className="text-foreground/90 leading-relaxed"
            />
          </div>
          
          {/* Back to news */}
          <div className="mt-12 pt-8 border-t">
            <Button asChild>
              <Link to="/novedades">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Novedades
              </Link>
            </Button>
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default NewsDetail;
