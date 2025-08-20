import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
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
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     const fetchNews = async () => {
      try {
        const response = await api.get('api/client/news/list');
        setNews(response.data.data.data || []);
        setIsLoaded(true);
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
            <div className="text-center py-2">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay eventos disponibles</h3>
              <p className="text-muted-foreground">
                Actualmente no hay eventos programados. Mantente atento para próximas actividades.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 px-4">
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
            <div className="text-center py-2">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay cursos disponibles</h3>
              <p className="text-muted-foreground">
                Actualmente no hay cursos programados. Mantente atento para próximas convocatorias.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Raffles Section */}
      <section className="py-16 px-4 bg-muted/30">
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
            <div className="text-center py-2">
              <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay rifas disponibles</h3>
              <p className="text-muted-foreground">
                Actualmente no hay rifas activas. Mantente atento para futuras rifas benéficas.
              </p>
            </div>
          )}
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
            <div className="text-center py-2">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay novedades disponibles</h3>
              <p className="text-muted-foreground">
                Actualmente no hay novedades publicadas. Mantente informado de las últimas noticias.
              </p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
