import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import EventPurchaseModal from '@/components/EventPurchaseModal';

// Mock data para eventos con descripciones completas
const mockEvents = [
  {
    id: 1,
    title: "Encuentro de la Familia",
    description: "Un evento especial diseñado para fortalecer los vínculos familiares dentro de la comunidad del Colegio Goethe. Será una jornada llena de actividades recreativas, juegos familiares, competencias deportivas entre padres e hijos, talleres creativos y espacios de esparcimiento. El evento incluirá actividades para todas las edades, desde juegos para los más pequeños hasta competencias deportivas para adolescentes y adultos. Habrá también stands de comida, música en vivo y sorteos especiales. Una oportunidad perfecta para conocer a otras familias de la comunidad y disfrutar de una jornada de diversión y compañerismo.",
    shortDescription: "Jornada familiar para fortalecer vínculos en la comunidad escolar",
    date: "2024-08-12",
    time: "14:00",
    location: "Predio Colegio Goethe",
    image: null,
    priceFrom: 0,
    ticketTypes: [
      {
        id: 1,
        name: "Entrada Gratuita",
        description: "Acceso libre para toda la familia",
        price: 0,
        stock: 500
      }
    ]
  },
  {
    id: 2,
    title: "Intercolegial de Padres GOETHE 2025",
    description: "La competencia deportiva más esperada del año donde padres de familia del Colegio Goethe se enfrentarán contra padres de otros colegios prestigiosos en diversas disciplinas deportivas. El torneo se realizará durante varios días e incluirá deportes como fútbol, básquet, vóley, tenis y atletismo. Es una excelente oportunidad para demostrar el espíritu competitivo y la camaradería entre las instituciones educativas. Los eventos se desarrollarán en horarios vespertinos y de fin de semana para permitir la mayor participación posible. Habrá premiaciones especiales y un almuerzo de confraternidad el último día.",
    shortDescription: "Competencia deportiva entre padres de diferentes colegios",
    date: "2024-10-10",
    time: "08:00",
    location: "Predio Colegio Goethe",
    image: "/intercolegial_padres.png",
    priceFrom: 0,
    ticketTypes: [
      {
        id: 1,
        name: "Inscripción Deportista",
        description: "Para padres participantes",
        price: 0,
        stock: 100
      },
      {
        id: 2,
        name: "Entrada Espectador",
        description: "Para familiares y amigos",
        price: 0,
        stock: 300
      }
    ]
  },
  {
    id: 3,
    title: "Corrida Goethe Lauf 5K/10K",
    description: "La tradicional corrida anual del Colegio Goethe que reúne a deportistas de todas las edades en una jornada de actividad física y espíritu comunitario. El evento cuenta con dos modalidades: 5K para principiantes y familias, y 10K para corredores más experimentados. La largada y llegada se realizarán en el predio del colegio, con un recorrido cuidadosamente diseñado por las calles del barrio. Todos los participantes recibirán una medalla de participación, remera conmemorativa y refrigerio post-carrera. Habrá premiaciones especiales por categorías de edad y stands de hidratación en todo el recorrido. Una experiencia deportiva única que promueve la vida sana y el compañerismo.",
    shortDescription: "Corrida tradicional con modalidades de 5K y 10K para toda la familia",
    date: "2024-10-12",
    time: "07:00",
    location: "Predio Colegio Goethe",
    image: "/corrida_lauf.jpeg",
    priceFrom: 25000,
    ticketTypes: [
      {
        id: 1,
        name: "5K Adultos",
        description: "Incluye kit de carrera y medalla",
        price: 25000,
        stock: 200
      },
      {
        id: 2,
        name: "10K Adultos",
        description: "Incluye kit de carrera y medalla",
        price: 35000,
        stock: 150
      },
      {
        id: 3,
        name: "5K Estudiantes",
        description: "Precio especial para estudiantes",
        price: 15000,
        stock: 100
      },
      {
        id: 4,
        name: "Inscripción Familiar",
        description: "Hasta 4 personas modalidad 5K",
        price: 70000,
        stock: 50
      }
    ]
  },
  {
    id: 4,
    title: "Torneo Interno Padres e Hijos",
    description: "Un evento deportivo especial que busca estrechar los lazos entre padres e hijos a través del deporte. Las competencias incluirán diversos deportes adaptados para equipos mixtos de padres e hijos, como fútbol reducido, básquet 3x3, vóley recreativo y juegos tradicionales. El torneo está diseñado para ser inclusivo y divertido, priorizando la participación y el disfrute por encima de la competencia. Habrá categorías por edades de los niños para asegurar una competencia justa y divertida. Al final del evento se realizará una ceremonia de premiación donde todos los participantes recibirán reconocimientos especiales. Incluye refrigerio para todos los participantes.",
    shortDescription: "Competencias deportivas familiares entre padres e hijos",
    date: "2024-07-05",
    time: "09:00",
    location: "Sede Colegio Goethe",
    image: null,
    priceFrom: 0,
    ticketTypes: [
      {
        id: 1,
        name: "Inscripción Gratuita",
        description: "Para duplas padre/madre e hijo/a",
        price: 0,
        stock: 80
      }
    ]
  },
  {
    id: 5,
    title: "Cena de Egresados 2025",
    description: "Una emotiva celebración para despedir a la promoción 2025 del Colegio Goethe. La velada incluirá un asado especial preparado por Asados Benítez, reconocido por su excelencia culinaria, seguido de un brindis protocolar y la ceremonia de descubrimiento de la Placa Conmemorativa de la Promoción 2025. Será una noche llena de recuerdos, emociones y celebración donde los egresados compartirán con sus familias, docentes y autoridades del colegio. El evento contará con presentaciones especiales preparadas por los propios estudiantes, música en vivo y un espacio para que cada egresado pueda expresar sus palabras de agradecimiento. Una velada inolvidable para cerrar esta importante etapa educativa.",
    shortDescription: "Cena de despedida para la promoción 2025 con asado y ceremonia especial",
    date: "2024-11-14",
    time: "19:30",
    location: "Sede Colegio Goethe",
    image: null,
    priceFrom: 0,
    ticketTypes: [
      {
        id: 1,
        name: "Invitación Gratuita",
        description: "Para egresados, padres y autoridades",
        price: 0,
        stock: 200
      }
    ]
  },
  {
    id: 6,
    title: "Fiesta de Padres 2026",
    description: "La gran celebración anual que reúne a toda la comunidad de padres del Colegio Goethe en una noche de diversión, música y camaradería. Esta fiesta tradicional es el evento social más esperado del año, donde los padres pueden relajarse, conocerse mejor y fortalecer los vínculos comunitarios fuera del ámbito académico. La velada incluirá música en vivo con bandas locales, DJ, pista de baile, bar completo, cena buffet y actividades especiales. Es una oportunidad única para que los padres disfruten de una noche diferente mientras apoyan las actividades de la asociación. Los fondos recaudados se destinan a proyectos de mejora para el colegio y actividades estudiantiles.",
    shortDescription: "Gran celebración anual de la comunidad de padres",
    date: "2026-04-15",
    time: "20:00",
    location: "Lugar a Definir",
    image: null,
    priceFrom: 50000,
    ticketTypes: [
      {
        id: 1,
        name: "Entrada Individual",
        description: "Incluye cena buffet y bebidas",
        price: 50000,
        stock: 150
      },
      {
        id: 2,
        name: "Entrada Pareja",
        description: "Para dos personas",
        price: 90000,
        stock: 100
      }
    ]
  }
];

const Events = () => {
  const [events, setEvents] = useState(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    setCurrentPage(page);
    
    // En el futuro, aquí se haría la llamada al API
    // const fetchEvents = async () => {
    //   setIsLoading(true);
    //   try {
    //     const response = await api.get('api/client/events/list', {
    //       params: { page }
    //     });
    //     setEvents(response.data.data.data);
    //     setFilteredEvents(response.data.data.data);
    //     setTotalPages(response.data.data.last_page || 1);
    //   } catch (error) {
    //     console.error('Error fetching events:', error);
    //     toast({
    //       title: "Error",
    //       description: "No se pudieron cargar los eventos. Intente nuevamente más tarde.",
    //       variant: "destructive",
    //     });
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchEvents();
    
    setFilteredEvents(mockEvents);
    setIsLoading(false);
  }, [searchParams, toast]);

  // Helper function to strip HTML tags for short descriptions
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const handleSearch = (term: string, categories: string[]) => {
    let results = [...events];
    
    if (term) {
      const searchTerm = term.toLowerCase();
      results = results.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.shortDescription.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm)
      );
    }
    
    // Los eventos no tienen categorías por ahora, pero se puede agregar en el futuro
    
    setFilteredEvents(results);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
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
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'No definido';
    }
  };

  const formatPrice = (price: number) => {
    return `Gs. ${price.toLocaleString('es-ES')}`;
  };

  const handleBuyTickets = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
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
            <span className="text-foreground font-medium">Eventos</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Eventos Disponibles
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Descubre y participa en los eventos especiales organizados por A.P.A.C. GOETHE.
          </p>
          
          <SearchBar onSearch={handleSearch} categories={[]} />
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-96 bg-muted/30 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {event.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(event.date)}
                    </Badge>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <Ticket className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                      <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(event.date)}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {stripHtml(event.shortDescription)}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {event.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    {event.time} hrs
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Desde</span>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(event.priceFrom)}
                      </p>
                    </div>
                    
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to={`/evento/${event.id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron eventos con los criterios seleccionados.
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
      
      {selectedEvent && (
        <EventPurchaseModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Events;
