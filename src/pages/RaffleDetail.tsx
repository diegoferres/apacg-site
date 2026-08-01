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
import PageHeader from '@/components/PageHeader';
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

  // En mobile los controles de cantidad y la compra viven SOLO en la barra inferior fija: asi
  // estan siempre a mano sin importar donde este el scroll, y no se duplican con la tarjeta
  // (que en mobile queda como informacion de precio).

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
        <div className="page-top pb-12">
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
        <div className="page-top pb-12 text-center">
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
    // Forma funcional: con taps rapidos seguidos, `quantity` de la clausura queda desactualizado
    // y se pierden incrementos (3 taps podian dejar el contador en 1).
    setQuantity((actual) => Math.max(0, actual + change));

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
      
      {/* Hero Section.
          El navbar es fixed: reservamos exactamente su alto real (--navbar-h, que publica el
          propio Navbar) mas un respiro chico. Antes era pt-24 fijo, que en mobile dejaba un
          hueco muerto cuando el navbar medía menos, y tapaba el contenido cuando medía mas. */}
      <section className="page-top pb-44 lg:pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <PageHeader
            crumbs={[
              { label: 'Inicio', to: '/' },
              { label: 'Rifas', to: '/rifas' },
              { label: raffle.title },
            ]}
          />
          
          {/* Misma distribucion que el detalle de evento: dos columnas parejas, la imagen a la
              izquierda y a la derecha el titulo con los datos y la compra. Antes el titulo iba en
              una tarjeta a todo el ancho y la imagen quedaba en 2/3 (con franjas vacias a los
              lados, porque el flyer es vertical) contra una columna de compra casi vacia. */}
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            {/* Imagen de la rifa */}
            <div>
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
            </div>

            {/* Datos de la rifa + compra */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(raffle.end_date, { format: 'long' })}
                </Badge>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h1 className="flex-1 text-3xl font-bold text-foreground md:text-4xl">
                    {raffle.title}
                  </h1>
                  <ShareButton type="raffle" slug={raffle.slug} title={raffle.title} iconOnly />
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Sortea el {formatDate(raffle.end_date, { format: 'long' })}</span>
                </div>
              </div>

              {/* En mobile toda la compra vive en la barra fija de abajo, asi que esta tarjeta
                  no aporta nada: se muestra desde lg, donde la barra no existe. */}
              <Card className="hidden lg:block">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Participar en la Rifa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Precio y selector en una sola fila. El selector solo desde lg: en mobile
                      vive en la barra fija de abajo, para no tener dos controles para lo mismo */}
                  <div className="flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:border-primary/20">
                    <div className="min-w-0">
                      <h4 className="font-semibold">Número de Rifa</h4>
                      <span className="text-xl font-bold text-primary md:text-2xl">
                        {formatPrice(toNumber(raffle.price))}
                      </span>
                    </div>

                    <div className="hidden shrink-0 items-center gap-2 lg:flex">
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

                      <span className="w-6 text-center font-semibold tabular-nums">
                        {quantity}
                      </span>

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
                  </div>

                  {/* Total + CTA, solo desde lg (en mobile esta en la barra fija) */}
                  {quantity > 0 && (
                    <div className="hidden rounded-lg border border-primary/20 bg-primary/5 p-4 lg:block">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl font-bold text-primary md:text-2xl">
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Acerca de la Rifa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={renderSafeHtml(isDescriptionExpanded ? raffle.description : truncateText(raffle.description))}
                  />
                  {shouldShowReadMore && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-3 h-auto p-0 font-medium text-primary hover:text-primary/80"
                    >
                      {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                    </Button>
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

      {/* Barra de compra fija en mobile: unico punto de compra en pantallas chicas. Lleva su
          descripcion (precio unitario o total segun haya seleccion) para que siempre se entienda
          que se esta comprando sin volver a subir. */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-primary/20 bg-background px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-8px_24px_-6px_rgba(0,0,0,0.18)] lg:hidden">
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">
              {quantity > 0 ? `${quantity} ${quantity === 1 ? 'número' : 'números'} × ${formatPrice(toNumber(raffle.price))}` : 'Número de Rifa'}
            </p>
            <p className="text-2xl font-bold leading-tight text-primary">
              {quantity > 0 ? formatPrice(getTotalPrice()) : formatPrice(toNumber(raffle.price))}
            </p>
          </div>

          {/* Selector grande: es el control principal de la pantalla en mobile */}
          <div className="flex shrink-0 items-center gap-1 rounded-full border bg-muted/40 p-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Disminuir cantidad"
              onClick={() => updateQuantity(-1)}
              disabled={quantity === 0}
              className="h-10 w-10 rounded-full hover:bg-background"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <span className="w-7 text-center text-lg font-bold tabular-nums">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Aumentar cantidad"
              onClick={() => updateQuantity(1)}
              className="h-10 w-10 rounded-full hover:bg-background"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handlePurchase}
          disabled={isLoading || quantity === 0}
          size="lg"
          className="h-12 w-full text-base font-semibold"
        >
          {quantity > 0 ? `Comprar ${formatPrice(getTotalPrice())}` : 'Seleccioná tus números'}
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default RaffleDetail;
