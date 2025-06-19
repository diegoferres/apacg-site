
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface TicketType {
  id: number;
  name: string;
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
    title: "Gala Anual de Graduación",
    description: "Celebración especial para honrar a nuestros graduados del año lectivo. Un evento emotivo donde reconocemos el esfuerzo y dedicación de nuestros estudiantes que han completado exitosamente sus estudios. La gala incluirá ceremonias de entrega de diplomas, discursos inspiradores de graduados destacados, presentaciones artísticas preparadas por los mismos estudiantes, y un cocktail de celebración para compartir con familiares y amigos. Es una noche para celebrar los logros académicos y personales de nuestros jóvenes.",
    shortDescription: "Celebración especial para honrar a nuestros graduados",
    date: "2024-07-15",
    time: "19:00",
    location: "Auditorio Principal Colegio Goethe",
    image: null,
    priceFrom: 15000,
    ticketTypes: [
      {
        id: 1,
        name: "Entrada General",
        price: 15000,
        stock: 50
      },
      {
        id: 2,
        name: "Entrada VIP",
        price: 25000,
        stock: 20
      },
      {
        id: 3,
        name: "Entrada Estudiante",
        price: 10000,
        stock: 30
      }
    ]
  },
  {
    id: 2,
    title: "Festival Cultural Internacional",
    description: "Una celebración de la diversidad cultural de nuestra comunidad educativa donde las diferentes nacionalidades y culturas presentes en nuestro colegio tendrán la oportunidad de mostrar sus tradiciones, gastronomía, música y danzas típicas. El festival contará con stands temáticos de cada país, presentaciones en vivo de grupos folclóricos, degustaciones de comidas tradicionales, talleres interactivos para niños y adultos, exposiciones de arte y artesanías, y conferencias sobre la importancia de la diversidad cultural en la educación. Un evento familiar perfecto para aprender y celebrar juntos.",
    shortDescription: "Una celebración de la diversidad cultural de nuestra comunidad",
    date: "2024-08-20",
    time: "15:00",
    location: "Patio Central Colegio Goethe",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80",
    priceFrom: 12000,
    ticketTypes: [
      {
        id: 4,
        name: "Entrada Familiar",
        price: 12000,
        stock: 25
      },
      {
        id: 5,
        name: "Entrada Individual",
        price: 5000,
        stock: 100
      }
    ]
  },
  {
    id: 3,
    title: "Concierto de Primavera",
    description: "Presentación especial del coro y orquesta del colegio en una velada musical única. Los estudiantes han preparado durante meses un repertorio que incluye música clásica, piezas contemporáneas y canciones tradicionales alemanas y argentinas. El concierto será dirigido por reconocidos maestros y contará con la participación especial de exalumnos músicos profesionales. Una oportunidad única para apreciar el talento musical de nuestros estudiantes y disfrutar de una velada cultural de primer nivel en el prestigioso Teatro Municipal.",
    shortDescription: "Presentación especial del coro y orquesta del colegio",
    date: "2024-09-10",
    time: "18:30",
    location: "Teatro Municipal",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=800&q=80",
    priceFrom: 10000,
    ticketTypes: [
      {
        id: 6,
        name: "Platea",
        price: 18000,
        stock: 40
      },
      {
        id: 7,
        name: "Pullman",
        price: 12000,
        stock: 60
      },
      {
        id: 8,
        name: "Cazuela",
        price: 8000,
        stock: 80
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-ES')}`;
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
                    <Users className="h-16 w-16 text-primary/60 mx-auto mb-4" />
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
            </div>
          </div>
        </div>
      </section>
      
      {/* Ticket Selection */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Entradas</h2>
            
            <div className="space-y-4 mb-8">
              {event.ticketTypes.map((ticketType) => (
                <Card key={ticketType.id} className="border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{ticketType.name}</h3>
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
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Purchase Summary */}
            {getTotalTickets() > 0 && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                  
                  <Button
                    onClick={handlePurchase}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                    size="lg"
                  >
                    {isLoading ? "Procesando..." : "Comprar ahora"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Event Description */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Acerca del Evento</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default EventDetail;
