import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickNav from '@/components/QuickNav';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import EventCard from '@/components/EventCard';
import CourseCard from '@/components/CourseCard';
import RaffleCard from '@/components/RaffleCard';
import NewsCard from '@/components/NewsCard';
import { Store, Tag, ArrowRight, Calendar, Clock, MapPin, Users, Ticket, FileText, GraduationCap } from 'lucide-react';
import api from '@/services/api';
import CommerceCard, { Commerce } from '@/components/CommerceCard';
import { useStore } from '@/stores/store';
import { formatPrice, toNumber, formatDate, renderSafeHtml } from '@/lib/utils';
import analytics from '@/services/analytics';
import { useTour } from '@/hooks/useTour';
import { homeTourSteps } from '@/config/tours';
import TourHelpButton from '@/components/TourHelpButton';

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
  date: string;
  date_format: string;
  end_date?: string;
  end_date_format?: string;
  time: string;
  location: string;
  price_from: number;
  is_informational: boolean;
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
  const user = useStore((state) => state.user);
  const isLoggedIn = !!user?.id;

  const { startTour } = useTour({
    tourId: 'home',
    steps: homeTourSteps,
    autoStart: isLoggedIn,
    delay: 2000,
  });

  const [filteredBenefits, setFilteredBenefits] = useState<Benefit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuredCommerces, setFeaturedCommerces] = useState<Commerce[]>([]);
  const setUser = useStore((state) => state.setUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<Events[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     const fetchNews = async () => {
      try {
        const response = await api.get('api/client/news/list');
        setNews(response.data.data.data || []);
        setIsLoaded(true);
        
        // Track visualización de home con noticias
        if (response.data.data.data && response.data.data.data.length > 0) {
          analytics.trackEvent('view_home_news', {
            news_count: response.data.data.data.length
          });
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await api.get('api/client/events/list');
        setEvents(response.data.data.data || []);
        setIsLoaded(true);
        
        // Track visualización de home con eventos
        if (response.data.data.data && response.data.data.data.length > 0) {
          analytics.trackEvent('view_home_events', {
            events_count: response.data.data.data.length
          });
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      }
    };

    const fetchRaffles = async () => {
      try {
        const response = await api.get('api/client/raffles/list');
        setRaffles(response.data.data.data || []);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching raffles:', error);
        setRaffles([]);
      }
    };

    const fetchBenefits = async () => {
      try {
        const response = await api.get('api/client/benefits/list');
        setFilteredBenefits(response.data.data.data || []);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching benefits:', error);
        setFilteredBenefits([]);
      }
    }

    const fetchCommerces = async () => {
      try {
        const response = await api.get('api/client/commerces/list');
        setFeaturedCommerces(response.data.data.data || []);
        setIsLoaded(true);  
      } catch (error) {
        console.error('Error fetching commerces:', error);
        setFeaturedCommerces([]);
      }
    }

    const fetchCourses = async () => {
      try {
        const response = await api.get('api/client/courses', {
          params: { 
            per_page: 6,
            sort_by: 'start_date',
            sort_order: 'asc'
          }
        });
        const coursesData = response.data.data.data || [];
        setCourses(coursesData);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchBenefits(),
        fetchCommerces(), 
        fetchNews(),
        fetchEvents(),
        fetchRaffles(),
        fetchCourses()
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);





  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Tour Help Button - Fixed */}
      <div className="fixed bottom-6 right-6 z-50">
        <TourHelpButton onClick={startTour} label="Ver tour de la web" />
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-8 md:pt-28 md:pb-16 px-4 relative hero-gradient overflow-hidden">
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
      
      {/* Quick Navigation - Mobile Only */}
      <QuickNav />
      
      {/* Benefits Section */}
      <section id="beneficios-section" className="py-16 px-4">
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
            {filteredBenefits?.map((benefit, index) => (
              <BenefitCard 
                key={benefit.slug} 
                benefit={benefit} 
                delay={100 + index * 50} 
              />
            )) || []}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="eventos-section" className="py-16 px-4 bg-muted/30">
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
          
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
              {events?.map((event, index) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  delay={100 + index * 100}
                />
              )) || []}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay eventos próximos</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Estamos preparando nuevas actividades. Seguí visitando para enterarte de los próximos eventos.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Courses Section */}
      <section id="cursos-section" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold animate-fade-up">
              Cursos Disponibles
            </h2>
            <Button variant="ghost" asChild className="gap-1 animate-fade-up">
              <Link to="/cursos">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {courses?.map((course, index) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  delay={100 + index * 100}
                />
              )) || []}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay cursos disponibles</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Pronto abriremos nuevas convocatorias. Revisá esta sección regularmente.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Raffles Section */}
      <section id="rifas-section" className="py-16 px-4 bg-muted/30">
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
          
          {raffles && raffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles?.map((raffle, index) => (
                <RaffleCard 
                  key={raffle.id} 
                  raffle={raffle}
                  delay={100 + index * 100}
                />
              )) || []}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Ticket className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay rifas activas</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Actualmente no hay rifas disponibles. Volvé pronto para participar en futuras rifas benéficas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      
      {/* Featured Stores Section */}
      <section id="comercios-section" className="py-16 px-4">
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
            {featuredCommerces?.map((commerce, index) => (            
              <CommerceCard
                key={commerce.slug}
                commerce={commerce} 
                delay={100 + index * 50}
              />
            )) || []}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="novedades-section" className="py-16 px-4 bg-muted/30">
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
          
          {news && news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news?.map((newsItem, index) => (
                <NewsCard 
                  key={newsItem.id} 
                  newsItem={newsItem}
                  delay={100 + index * 100}
                />
              )) || []}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay novedades recientes</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Todavía no hay novedades publicadas. Volvé pronto para estar al día.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
