
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import EventPurchaseModal from '@/components/EventPurchaseModal';

// Mock data para eventos (mismo que en Events.tsx)
const mockEvents = [
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
        description: "Acceso completo al evento",
        price: 15000,
        stock: 150
      },
      {
        id: 2,
        name: "Entrada VIP",
        description: "Acceso preferencial + refrigerio",
        price: 25000,
        stock: 50
      },
      {
        id: 3,
        name: "Entrada Estudiante",
        description: "Con credencial estudiantil válida",
        price: 8000,
        stock: 100
      },
      {
        id: 4,
        name: "Entrada Familiar",
        description: "Hasta 4 personas",
        price: 40000,
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
        id: 1,
        name: "Entrada General",
        description: "Acceso completo al festival",
        price: 12000,
        stock: 200
      },
      {
        id: 2,
        name: "Entrada VIP",
        description: "Área preferencial + degustación",
        price: 20000,
        stock: 75
      },
      {
        id: 3,
        name: "Entrada Estudiante",
        description: "Con credencial estudiantil válida",
        price: 6000,
        stock: 150
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
        id: 1,
        name: "Entrada General",
        description: "Acceso general al concierto",
        price: 10000,
        stock: 300
      },
      {
        id: 2,
        name: "Entrada Preferencial",
        description: "Mejores asientos disponibles",
        price: 18000,
        stock: 100
      }
    ]
  }
];

const EventDetail = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
              
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Entradas desde</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(event.priceFrom)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Comprar Entradas
                  </Button>
                </div>
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
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Ticket Types */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Tipos de Entrada</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {event.ticketTypes.map((ticket) => (
                <Card key={ticket.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{ticket.name}</CardTitle>
                    <p className="text-muted-foreground">{ticket.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(ticket.price)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.stock} disponibles
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button 
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                Comprar Entradas
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      
      <EventPurchaseModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default EventDetail;
