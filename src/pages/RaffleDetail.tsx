
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
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
  const [raffle, setRaffle] = useState<Raffle>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  
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



  const updateQuantity = (change: number) => {
    const newQuantity = Math.max(0, quantity + change);
    setQuantity(newQuantity);
  };

  const getTotalPrice = () => {
    return raffle.price * quantity;
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

    setIsLoading(true);
    
    // Simular proceso de compra
    setTimeout(() => {
      toast({
        title: "¡Compra exitosa!",
        description: `Has comprado ${quantity} número(s) para ${raffle.title}. Recibirás un correo de confirmación.`
      });
      setIsLoading(false);
      setQuantity(0);
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
                    {formatDate(raffle.end_date)}
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
                          {formatPrice(raffle.price)}
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
                        {isLoading ? "Procesando..." : "Comprar ahora"}
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
