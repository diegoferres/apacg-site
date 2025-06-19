import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface TicketType {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  time: string;
  location: string;
  image: string | null;
  priceFrom: number;
  ticketTypes: TicketType[];
}

// Mock data para eventos con tipos de entradas
const mockEvents: Event[] = [
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
        id: 2,
        name: "Inscripción Deportista",
        description: "Para padres participantes",
        price: 0,
        stock: 100
      },
      {
        id: 3,
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
        id: 4,
        name: "5K Adultos",
        description: "Incluye kit de carrera y medalla",
        price: 25000,
        stock: 200
      },
      {
        id: 5,
        name: "10K Adultos",
        description: "Incluye kit de carrera y medalla",
        price: 35000,
        stock: 150
      },
      {
        id: 6,
        name: "5K Estudiantes",
        description: "Precio especial para estudiantes",
        price: 15000,
        stock: 100
      },
      {
        id: 7,
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
        id: 8,
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
        id: 9,
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
        id: 10,
        name: "Entrada Individual",
        description: "Incluye cena buffet y bebidas",
        price: 50000,
        stock: 150
      },
      {
        id: 11,
        name: "Entrada Pareja",
        description: "Para dos personas",
        price: 90000,
        stock: 100
      }
    ]
  }
];

const EventDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const event = mockEvents.find(e => e.id === parseInt(id || ''));
  
  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold">Evento no encontrado</h1>
          <Button asChild className="mt-4">
            <Link to="/eventos">Volver a Eventos</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

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
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'No definido';
    }
  };

  const formatPrice = (price: number) => {
    return `Gs. ${price.toLocaleString('es-ES')}`;
  };

  const updateTicketQuantity = (ticketId: number, change: number) => {
    const currentQuantity = selectedTickets[ticketId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    const ticketType = event.ticketTypes.find(t => t.id === ticketId);
    
    if (ticketType && newQuantity <= ticketType.stock) {
      setSelectedTickets(prev => ({
        ...prev,
        [ticketId]: newQuantity
      }));
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticketType = event.ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticketType ? ticketType.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handlePurchase = async () => {
    if (getTotalTickets() === 0) {
      toast({
        title: "Selecciona al menos una entrada",
        description: "Debes seleccionar al menos una entrada para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simular proceso de compra
    setTimeout(() => {
      toast({
        title: "¡Compra exitosa!",
        description: `Has comprado ${getTotalTickets()} entrada(s) para ${event.title}. Recibirás un correo de confirmación.`
      });
      setIsLoading(false);
      setSelectedTickets({});
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/eventos" className="hover:text-foreground transition-colors">Eventos</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{event.title}</span>
          </nav>
          
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/eventos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Link>
          </Button>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Event Image */}
            <div className="space-y-4">
              {event.image ? (
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ) : (
                <div className="relative h-96 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Ticket className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                    <p className="text-primary/80 font-medium">Evento Especial</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Event Details */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(event.date)}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {event.title}
                </h1>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <span>{event.time} hrs</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              {/* Ticket Selection - Simplified */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Entradas</h3>
                <div className="space-y-3">
                  {event.ticketTypes.map((ticketType) => (
                    <div key={ticketType.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/20 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold">{ticketType.name}</h4>
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(ticketType.price)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateTicketQuantity(ticketType.id, -1)}
                          disabled={!selectedTickets[ticketType.id]}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-semibold">
                          {selectedTickets[ticketType.id] || 0}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateTicketQuantity(ticketType.id, 1)}
                          disabled={(selectedTickets[ticketType.id] || 0) >= ticketType.stock}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Purchase Button */}
                {getTotalTickets() > 0 && (
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handlePurchase}
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isLoading ? "Procesando..." : "Comprar ahora"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Event Description */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Acerca del Evento</h2>
            <div 
              className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default EventDetail;
