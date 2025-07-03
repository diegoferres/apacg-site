import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import { Store, Tag, ArrowRight, Calendar, Clock, MapPin, Users, Ticket, FileText } from 'lucide-react';
import api from '@/services/api';
import CommerceCard, { Commerce } from '@/components/CommerceCard';
import { useStore } from '@/stores/store';
import { formatPrice } from '@/lib/utils';

// Mock data para eventos destacados en el home
const featuredEvents = [
  {
    id: 3,
    title: "Corrida Goethe Lauf 5K/10K",
    shortDescription: "Participa en nuestra tradicional corrida deportiva",
    date: "2024-10-12",
    time: "07:00",
    location: "Predio Colegio Goethe",
    priceFrom: 25000,
    image: "/corrida_lauf.jpeg"
  },
  {
    id: 2,
    title: "Intercolegial de Padres",
    shortDescription: "Competencia deportiva entre padres de diferentes colegios",
    date: "2024-10-10",
    time: "08:00",
    location: "Predio Colegio Goethe",
    priceFrom: 0,
    image: "/intercolegial_padres.png"
  }
];

// Mock data para rifas destacadas en el home
const featuredRaffles = [
  {
    id: 1,
    title: "Rifa Benéfica Colegio Goethe",
    shortDescription: "Rifa anual para mejoras en la infraestructura escolar",
    drawDate: "2024-08-30",
    drawTime: "20:00",
    drawLocation: "Auditorio Principal",
    isOnline: false,
    price: 5000,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Rifa Virtual Día del Maestro",
    shortDescription: "Rifa virtual en celebración del Día del Maestro",
    drawDate: "2024-09-11",
    drawTime: "19:00",
    drawLocation: null,
    isOnline: true,
    price: 3000,
    image: null
  }
];

export interface News {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  date_format: string;
  cover?: {
    storage_path_full: string;
  };
}

export interface Events {
  id: number;
  title: string;
  description: string;
  date_format: string;
  time: string;
  location: string;
  price_from: number;
  cover: {
    storage_path_full: string;
  }
  slug: string;
}

export interface Raffle {
  id: number;
  title: string;
  short_description: string;
  end_date: string;
  price: number;
  cover: {
    storage_path_full: string;
  };
  slug: string;
}

const Index = () => {
  const [filteredBenefits, setFilteredBenefits] = useState<Benefit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuredCommerces, setFeaturedCommerces] = useState<Commerce[]>([]);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<Events[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);

  useEffect(() => {
     const fetchNews = async () => {
      try {
        const response = await api.get('api/client/news/list');
        setNews(response.data.data.data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await api.get('api/client/events/list');
        setEvents(response.data.data.data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchRaffles = async () => {
      try {
        const response = await api.get('api/client/raffles/list');
        setRaffles(response.data.data.data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching raffles:', error);
      }
    };

    const fetchBenefits = async () => {
      try {
        const response = await api.get('api/client/benefits/list');

        setFilteredBenefits(response.data.data.data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching benefits:', error);
      }
    }

    const fetchCommerces = async () => {
      try {
        const response = await api.get('api/client/commerces/list');
        setFeaturedCommerces(response.data.data.data);
        setIsLoaded(true);  
      } catch (error) {
        console.error('Error fetching commerces:', error);
      }
    }

    fetchBenefits();
    fetchCommerces();
    fetchNews();
    fetchEvents();
    fetchRaffles();
  }, []);

  // Helper function to strip HTML tags for short descriptions
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
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
        month: 'short'
      });
    } catch {
      return 'No definido';
    }
  };



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative hero-gradient overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12 animate-fade-up">
            <Badge variant="outline" className="mb-4 py-1 px-3 bg-primary/5">
              Asociación de Padres de Alumnos del Colegio GOETHE
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Encuentra los mejores <span className="text-primary">beneficios</span> para vos
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Accedé a descuentos exclusivos y promociones especiales en diferentes comercios y servicios como miembro de A.P.A.C. GOETHE.
            </p>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold animate-fade-up">
              Beneficios Destacados
            </h2>
            <Button variant="ghost" asChild className="gap-1 animate-fade-up">
              <Link to="/beneficios">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBenefits.map((benefit, index) => (
              <BenefitCard 
                key={benefit.slug} 
                benefit={benefit} 
                delay={100 + index * 50} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold animate-fade-up">
              Últimas Novedades
            </h2>
            <Button variant="ghost" asChild className="gap-1 animate-fade-up">
              <Link to="/novedades">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((news, index) => (
              <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${100 + index * 100}ms` }}>
                {news.cover ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={news.cover?.storage_path_full}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(news.date_format)}
                    </Badge>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                      <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(news.date)}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {stripHtml(news.excerpt)}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link to={`/novedad/${news.slug}`}>
                      Leer Más
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold animate-fade-up">
              Próximos Eventos
            </h2>
            <Button variant="ghost" asChild className="gap-1 animate-fade-up">
              <Link to="/eventos">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${100 + index * 100}ms` }}>
                {event.cover ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.cover?.storage_path_full}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(event.date_format)}
                    </Badge>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <Ticket className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                      <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(event.date_format)}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {stripHtml(event.description)}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    {event.time} hrs
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {event.location}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Desde</span>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(event.price_from)}
                      </p>
                    </div>
                    
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to={`/evento/${event.slug}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Raffles Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold animate-fade-up">
              Rifas Disponibles
            </h2>
            <Button variant="ghost" asChild className="gap-1 animate-fade-up">
              <Link to="/rifas">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle, index) => (
              <Card key={raffle.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${100 + index * 100}ms` }}>
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
                  <p className="text-muted-foreground text-sm line-clamp-2">
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
        </div>
      </section>
      
      {/* Featured Stores Section */}
      <section className="py-12 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold animate-fade-up">
              Comercios Destacados
            </h2>
            <Button variant="ghost" asChild className="gap-1 animate-fade-up">
              <Link to="/comercios">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCommerces.map((commerce, index) => (            
              <CommerceCard
                key={commerce.slug}
                commerce={commerce} 
                delay={100 + index * 50}
              />
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
