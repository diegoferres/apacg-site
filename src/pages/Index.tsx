import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import { Store, Tag, ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import api from '@/services/api';
import CommerceCard, { Commerce } from '@/components/CommerceCard';
import { useStore } from '@/stores/store';

// Mock data para eventos destacados en el home
const featuredEvents = [
  {
    id: 1,
    title: "Gala Anual de Graduación",
    date: "2024-07-15",
    time: "19:00",
    location: "Auditorio Principal",
    priceFrom: 15000
  },
  {
    id: 2,
    title: "Festival Cultural Internacional",
    date: "2024-08-20",
    time: "15:00",
    location: "Patio Central",
    priceFrom: 12000
  }
];

const Index = () => {
  const [filteredBenefits, setFilteredBenefits] = useState<Benefit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuredCommerces, setFeaturedCommerces] = useState<Commerce[]>([]);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    // const fetchUser = async () => {
    //   try {
    //     const response = await api.get('api/user');
    //     setUser(response.data);
    //     console.log(user);
    //   } catch (error) {
    //     console.error('Error fetching user:', error);
    //   }
    // }

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
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-ES')}`;
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

      {/* Events Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-blue-50/50 to-white">
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
            {featuredEvents.map((event, index) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-up" style={{ animationDelay: `${100 + index * 100}ms` }}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-blue-900">
                      {event.title}
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(event.date)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    {event.time} hrs
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    {event.location}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Desde</span>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPrice(event.priceFrom)}
                      </p>
                    </div>
                    
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <Link to="/eventos">
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
