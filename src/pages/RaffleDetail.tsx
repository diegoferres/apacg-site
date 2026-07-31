import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket, ArrowLeft, Plus, Minus, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShareButton } from '@/components/ShareButton';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, toNumber, formatDate, renderSafeHtml } from '@/lib/utils';
import { useStore } from '@/stores/store';
import api from '@/services/api';
import analytics from '@/services/analytics';
import { useReferralCode, getReferralCode } from '@/hooks/useReferralCode';

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
  const [raffle, setRaffle] = useState<Raffle>();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [coverExpanded, setCoverExpanded] = useState(false);
  const { user, isLoggedIn } = useStore();

  // Detectar y almacenar código de referido (con vencimiento — ver useReferralCode)
  useReferralCode();

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/client/raffles/${slug}`);
        setRaffle(response.data.data);
        
        // Track visualización de la rifa
        if (response.data.data) {
          const raffleData = response.data.data;
          analytics.trackViewItem(
            raffleData.id.toString(),
            raffleData.title,
            'raffle',
            raffleData.price
          );
        }
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
    
    // Track agregar al carrito (solo cuando se agrega)
    if (change > 0 && raffle) {
      analytics.trackEvent('add_to_cart', {
        currency: 'PYG',
        value: raffle.price,
        items: [{
          item_id: `raffle_${raffle.id}`,
          item_name: raffle.title,
          item_category: 'raffle',
          price: raffle.price,
          quantity: 1
        }]
      });
    }
    
    setQuantity(newQuantity);
  };

  const getTotalPrice = () => {
    return toNumber(raffle.price) * quantity;
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const shouldShowReadMore = raffle?.description && raffle.description.length > 300;

  const handlePurchase = async () => {
    if (quantity === 0) {
      toast({
        title: "Selecciona al menos un número",
        description: "Debes seleccionar al menos un número para participar en la rifa.",
        variant: "destructive"
      });
      return;
    }
    
    // Track inscripción a rifa
    if (raffle) {
      analytics.trackRaffleEntry(
        raffle.id.toString(),
        raffle.title
      );
    }

    // Obtener código de referido si existe (y aún no venció)
    const referralCode = getReferralCode();

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

    // Acá NO se limpia el código: el comprador puede volver atrás y reintentar (cambiar la
    // cantidad, corregir un dato), y borrarlo en este punto haría que el segundo intento se
    // pierda la imputación al socio. Se limpia recién cuando la compra termina de verdad, y
    // si se abandona vence solo por el TTL.

    // Navegar al checkout
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 lg:pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
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
                    {formatDate(raffle.end_date, { format: 'long' })}
                  </Badge>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex-1">
                      {raffle.title}
                    </h1>
                    <ShareButton type="raffle" slug={raffle.slug} title={raffle.title} iconOnly />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <span>Sortea el {formatDate(raffle.end_date, { format: 'long' })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Raffle Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Raffle Image */}
              {raffle.cover ? (
                /* La portada de una rifa suele ser un flyer vertical con la lista de premios.
                   Con aspect-video + object-cover se recortaba a una franja del medio y no se
                   podía leer nada. Se respeta la proporción real de la imagen y se puede tocar
                   para verla completa. */
                <button
                  type="button"
                  onClick={() => setCoverExpanded(true)}
                  className="group relative block w-full overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Ver la imagen de la rifa en grande"
                >
                  <img
                    src={raffle.cover?.storage_path_full}
                    alt={raffle.title}
                    className="mx-auto block h-auto w-full max-h-[75vh] object-contain"
                  />
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                    <Maximize2 className="h-3 w-3" />
                    Ver en grande
                  </span>
                </button>
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Ticket className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                    <p className="text-primary/80 font-medium">Rifa Especial</p>
                  </div>
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Acerca de la Rifa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={renderSafeHtml(isDescriptionExpanded ? raffle.description : truncateText(raffle.description))}
                  />
                  {shouldShowReadMore && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-3 text-primary hover:text-primary/80 p-0 h-auto font-medium"
                    >
                      {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                    </Button>
                  )}
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
                          aria-label="Disminuir cantidad"
                          onClick={() => updateQuantity(-1)}
                          disabled={quantity === 0}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-semibold">
                          {quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Aumentar cantidad"
                          onClick={() => updateQuantity(1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
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

      {/* La imagen a pantalla completa: es donde está la lista de premios con su letra chica,
          así que se muestra entera y con scroll si no entra. */}
      <Dialog open={coverExpanded} onOpenChange={setCoverExpanded}>
        <DialogContent className="max-w-3xl p-2 sm:p-4">
          <DialogTitle className="sr-only">{raffle.title}</DialogTitle>
          <div className="max-h-[85vh] overflow-y-auto">
            <img
              src={raffle.cover?.storage_path_full}
              alt={raffle.title}
              className="mx-auto block h-auto w-full"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Disminuir cantidad"
              onClick={() => updateQuantity(-1)}
              disabled={quantity === 0}
              className="h-9 w-9"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Aumentar cantidad"
              onClick={() => updateQuantity(1)}
              className="h-9 w-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handlePurchase}
            disabled={isLoading || quantity === 0}
            className="flex-1"
            size="lg"
          >
            {quantity > 0 ? `Comprar ${formatPrice(getTotalPrice())}` : 'Seleccionar números'}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RaffleDetail;
