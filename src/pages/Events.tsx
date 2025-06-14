
import { useState } from 'react';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventPurchaseModal from '@/components/EventPurchaseModal';

// Mock data para eventos
const mockEvents = [
  {
    id: 1,
    title: "Gala Anual de Graduación",
    description: "Celebración especial para honrar a nuestros graduados",
    date: "2024-07-15",
    time: "19:00",
    location: "Auditorio Principal Colegio Goethe",
    image: "/placeholder.svg",
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
    description: "Una celebración de la diversidad cultural de nuestra comunidad",
    date: "2024-08-20",
    time: "15:00",
    location: "Patio Central Colegio Goethe",
    image: "/placeholder.svg",
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
    description: "Presentación especial del coro y orquesta del colegio",
    date: "2024-09-10",
    time: "18:30",
    location: "Teatro Municipal",
    image: "/placeholder.svg",
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

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-ES')}`;
  };

  const handleBuyTickets = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <span>Inicio</span>
            <span>/</span>
            <span className="text-foreground font-medium">Eventos</span>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Eventos Disponibles
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre y participa en los eventos especiales organizados por A.P.A.C. GOETHE
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(event.date)}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {event.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    {event.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    {event.time} hrs
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Desde</span>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(event.priceFrom)}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => handleBuyTickets(event)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Comprar Entradas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
