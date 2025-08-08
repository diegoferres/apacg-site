import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, toNumber, formatDate } from '@/lib/utils';
import { useStore } from '@/stores/store';
import api from '@/services/api';

interface Raffle {
  id: number;
  title: string;
  short_description: string;
  description: string;
  end_date: string;
  price: number;
  cover: {
    storage_path_full: string;
  };
  slug: string;
}

const RaffleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [raffle, setRaffle] = useState<Raffle>();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn } = useStore();
  
  // Detectar y almacenar código de referido
  useEffect(() => {
    const referralCode = searchParams.get('ref');
    if (referralCode) {
      console.log('Código de referido detectado:', referralCode);
      localStorage.setItem('referral_code', referralCode);
      
      // Opcional: mostrar toast informando al usuario
      toast({
        title: "¡Link de referido activado!",
        description: "Esta compra será acreditada al estudiante referente.",
        className: "bg-green-50 border-green-200",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/client/raffles/${slug}`);
        setRaffle(response.data.data);
      } catch (error) {
        console.error('Error fetching raffle:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaffle();
  }, [slug]);

  // Restaurar selección guardada al volver del login
  useEffect(() => {
    if (isLoggedIn && raffle) {
      const savedSelection = localStorage.getItem(`raffle_selection_${raffle.slug}`);
      if (savedSelection) {
        try {
          const parsedSelection = JSON.parse(savedSelection);
          setQuantity(parsedSelection.quantity || 0);
          localStorage.removeItem(`raffle_selection_${raffle.slug}`);
        } catch (error) {
          console.error('Error parsing saved raffle selection:', error);
        }
      }
    }
  }, [isLoggedIn, raffle]);

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

  if (!raffle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold">Rifa no encontrada</h1>
          <Button asChild className="mt-4">
            <Link to="/rifas">Volver a Rifas</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }


  const updateQuantity = (change: number) => {
    const newQuantity = Math.max(0, quantity + change);
    setQuantity(newQuantity);
  };

  const getTotalPrice = () => {
    return toNumber(raffle.price) * quantity;
  };

  const handlePurchase = async () => {
    if (quantity === 0) {
      toast({
        title: "Selecciona al menos un número",
        description: "Debes seleccionar al menos un número para participar en la rifa.",
        variant: "destructive"
      });
      return;
    }

    // Obtener código de referido si existe
    const referralCode = localStorage.getItem('referral_code');

    // Proceder al checkout con datos detallados
    const checkoutData = {
      type: 'raffle' as const,
      eventId: raffle.id,
      eventSlug: raffle.slug,
      eventTitle: raffle.title,
      tickets: [{
        id: 1,
        name: 'Número de Rifa',
        quantity: quantity,
        price: toNumber(raffle.price),
        total: getTotalPrice()
      }],
      totalAmount: getTotalPrice(),
      totalTickets: quantity,
      referralCode: referralCode // Incluir código de referido
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
            <Link to="/rifas" className="hover:text-foreground transition-colors">Rifas</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{raffle.title}</span>
          </nav>
          
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          {/* Header Card with Raffle Info */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(raffle.end_date, { format: 'short' })}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    {raffle.title}
                  </h1>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <span>Sortea el {formatDate(raffle.end_date)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Raffle Description */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Acerca de la Rifa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: raffle.description }}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Purchase Section */}
            <div className="space-y-6">
              
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Participar en la Rifa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg hover:border-primary/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">Número de Rifa</h4>
                        <span className="text-xl md:text-2xl font-bold text-primary">
                          {formatPrice(toNumber(raffle.price))}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 justify-center sm:justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(-1)}
                          disabled={quantity === 0}
                          className="h-8 w-8"
                        >
                          -
                        </Button>
                        
                        <span className="w-8 text-center font-semibold">
                          {quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(1)}
                          className="h-8 w-8"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Purchase Button */}
                  {quantity > 0 && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl md:text-2xl font-bold text-primary">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                      
                      <Button
                        onClick={handlePurchase}
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                      >
                        Comprar números
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default RaffleDetail;
