
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, ArrowLeft, FileText } from 'lucide-react';
import { NewsItem } from './News';

// Mock data extendido para las novedades
const mockNewsDetail: Record<string, NewsItem & { fullContent: string }> = {
  "nueva-alianza-comercios-locales": {
    id: 1,
    title: "Nueva Alianza con Comercios Locales",
    slug: "nueva-alianza-comercios-locales",
    excerpt: "Nos complace anunciar nuevas alianzas comerciales que beneficiarán a todos nuestros socios con descuentos exclusivos.",
    content: "Contenido resumido...",
    fullContent: `
      <h2>Una Gran Noticia para Nuestros Socios</h2>
      <p>Nos complace anunciar que hemos establecido nuevas alianzas estratégicas con comercios locales que beneficiarán directamente a todos nuestros socios y sus familias.</p>
      
      <h3>Nuevos Beneficios Disponibles</h3>
      <p>A partir de este mes, nuestros socios podrán acceder a descuentos exclusivos en:</p>
      <ul>
        <li>Restaurantes y cafeterías locales</li>
        <li>Tiendas de ropa y accesorios</li>
        <li>Servicios profesionales</li>
        <li>Actividades recreativas</li>
      </ul>
      
      <h3>Cómo Acceder a los Beneficios</h3>
      <p>Para acceder a estos beneficios, simplemente presenta tu carnet de socio de A.P.A.C. GOETHE en los comercios afiliados. También puedes consultar la lista completa de comercios en nuestra sección de beneficios.</p>
      
      <p>Estas alianzas son parte de nuestro compromiso continuo de brindar valor agregado a nuestros socios y fortalecer los lazos con la comunidad local.</p>
    `,
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
  },
  "asamblea-general-ordinaria-2024": {
    id: 2,
    title: "Asamblea General Ordinaria 2024",
    slug: "asamblea-general-ordinaria-2024",
    excerpt: "Se convoca a todos los socios a la Asamblea General Ordinaria que se realizará el próximo mes.",
    content: "Contenido resumido...",
    fullContent: `
      <h2>Convocatoria Oficial</h2>
      <p>Por medio de la presente, convocamos a todos los socios de A.P.A.C. GOETHE a participar en la Asamblea General Ordinaria 2024.</p>
      
      <h3>Detalles del Evento</h3>
      <p><strong>Fecha:</strong> Sábado 20 de febrero de 2024</p>
      <p><strong>Hora:</strong> 10:00 AM</p>
      <p><strong>Lugar:</strong> Auditorio Principal del Colegio Goethe</p>
      
      <h3>Orden del Día</h3>
      <ol>
        <li>Verificación del quórum</li>
        <li>Lectura y aprobación del acta anterior</li>
        <li>Presentación del informe anual de actividades</li>
        <li>Presentación del balance financiero</li>
        <li>Elección de nuevos miembros de la comisión directiva</li>
        <li>Propuestas y proyectos para el año 2024</li>
        <li>Varios</li>
      </ol>
      
      <p>La participación de todos los socios es fundamental para el buen funcionamiento de nuestra asociación. ¡Los esperamos!</p>
    `,
    date: "2024-01-10",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
  }
};

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem & { fullContent: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadNewsDetail = () => {
      setIsLoading(true);
      
      // Simular carga de datos
      setTimeout(() => {
        if (slug && mockNewsDetail[slug]) {
          setNewsItem(mockNewsDetail[slug]);
        }
        setIsLoading(false);
      }, 500);
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
                {formatDate(newsItem.date)}
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
          {newsItem.image ? (
            <div className="relative mb-8 animate-fade-up">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={newsItem.image}
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
              dangerouslySetInnerHTML={{ __html: newsItem.fullContent }}
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
