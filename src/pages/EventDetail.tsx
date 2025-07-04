import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/stores/store';
import api from '@/services/api';

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
  date_format: string;
  time: string;
  date: string;
  location: string;
  slug: string;
  price_from: number;
  ticket_types: TicketType[];
  cover: {
    storage_path_full: string;
  }
}

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event>();
  const { toast } = useToast();
  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn } = useStore();
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/client/events/${slug}`);
        setEvent(response.data.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  // Restaurar selección guardada al volver del login
  useEffect(() => {
    if (isLoggedIn && event) {
      const savedSelection = localStorage.getItem(`event_selection_${event.slug}`);
      if (savedSelection) {
        try {
          const parsedSelection = JSON.parse(savedSelection);
          setSelectedTickets(parsedSelection);
          localStorage.removeItem(`event_selection_${event.slug}`);
        } catch (error) {
          console.error('Error parsing saved selection:', error);
        }
      }
    }
  }, [isLoggedIn, event]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-muted/30 animate-pulse rounded-lg"></div>
              <div className="space-y-6">
                <div className="h-8 bg-muted/30 animate-pulse rounded w-3/4"></div>
                <div className="h-12 bg-muted/30 animate-pulse rounded w-full"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted/30 animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-muted/30 animate-pulse rounded w-5/6"></div>
                  <div className="h-4 bg-muted/30 animate-pulse rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

  const updateTicketQuantity = (ticketId: number, change: number) => {
    const currentQuantity = selectedTickets[ticketId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    const ticketType = event.ticket_types.find(t => t.id === ticketId);
    
    if (ticketType && newQuantity <= ticketType.stock) {
      setSelectedTickets(prev => ({
        ...prev,
        [ticketId]: newQuantity
      }));
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticketType = event.ticket_types.find(t => t.id === parseInt(ticketId));
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

    // Verificar autenticación
    if (!isLoggedIn || !user) {
      // Guardar selección en localStorage
      if (event) {
        localStorage.setItem(`event_selection_${event.slug}`, JSON.stringify(selectedTickets));
      }
      
      toast({
        title: "Inicia sesión para continuar",
        description: "Debes iniciar sesión para comprar entradas. Tu selección se guardará.",
        variant: "default"
      });
      
      // Redirigir al login con parámetro de retorno
      navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Proceder al checkout con datos detallados
    const ticketDetails = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = event.ticket_types.find(t => t.id === parseInt(ticketId));
        return {
          id: parseInt(ticketId),
          name: ticketType?.name || '',
          quantity: quantity,
          price: ticketType?.price || 0,
          total: (ticketType?.price || 0) * quantity
        };
      });

    const checkoutData = {
      type: 'event',
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      tickets: ticketDetails,
      totalAmount: getTotalPrice(),
      totalTickets: getTotalTickets()
    };

    // Guardar datos del checkout en localStorage
    localStorage.setItem('checkout_data', JSON.stringify(checkoutData));

    // Navegar al checkout
    navigate('/checkout');
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
              {event.cover ? (
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={event.cover?.storage_path_full}
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
                  {formatDate(event.date_format)}
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
                  {event.ticket_types.map((ticketType) => (
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
                      Comprar ahora
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
