import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShareButton } from '@/components/ShareButton';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, formatDate, renderSafeHtml } from '@/lib/utils';
import { useStore } from '@/stores/store';
import api from '@/services/api';
import analytics from '@/services/analytics';
import MembershipBadge from '@/components/MembershipBadge';

interface TicketType {
  id: number;
  name: string;
  description: string;
  price: number;
  member_price: number | null;
  member_price_format: string | null;
  has_member_price: boolean;
  stock: number;
}

interface EventExtra {
  id: number;
  name: string;
  description: string | null;
  price: number;
  member_price: number | null;
  status: 'active' | 'inactive';
}

interface EventImage {
  id: number;
  type: 'cover' | 'image';
  storage_path: string;
  storage_path_full?: string;
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
  is_informational: boolean;
  allow_extras_only: boolean;
  extras_description?: string | null;
  ticket_types: TicketType[];
  extras?: EventExtra[];
  cover?: EventImage | null;
  gallery?: EventImage[];
}

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState<Event>();
  const { toast } = useToast();
  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
  const [selectedExtras, setSelectedExtras] = useState<Record<number, number>>({});
  // Validación de CI socio APACG en vivo durante la elección de entradas
  const [buyerCi, setBuyerCi] = useState('');
  const [memberPricing, setMemberPricing] = useState<{
    applies_member_price: boolean;
    ticket_types: Array<{ id: number; effective_price: number }>;
    member_status?: {
      is_apacg_member: boolean;
      is_active: boolean;
      can_activate: boolean;
      unpaid_students: Array<{ id: number; full_name: string; payment_year: number }>;
      amount_per_student: number;
      suggested_total: number;
      member_id: number | null;
    };
  } | null>(null);
  const [isCheckingPricing, setIsCheckingPricing] = useState(false);
  const [activateMembership, setActivateMembership] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn } = useStore();
  const [isMember, setIsMember] = useState(false);
  const [membershipChecked, setMembershipChecked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Verificar membresía real (status + pagos al día)
  useEffect(() => {
    if (isLoggedIn && user?.member) {
      api.get('/api/client/members/check-membership-status')
        .then(res => setIsMember(res.data.is_active_member))
        .catch(() => setIsMember(false))
        .finally(() => setMembershipChecked(true));
    } else {
      setIsMember(false);
      setMembershipChecked(true);
    }
  }, [isLoggedIn, user]);

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
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/client/events/${slug}`);
        setEvent(response.data.data);
        setActiveImageIndex(0);
        
        // Track visualización del evento
        if (response.data.data) {
          const eventData = response.data.data;
          analytics.trackViewItem(
            eventData.id.toString(),
            eventData.title,
            'event',
            eventData.price_from
          );
        }
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

  // Validación en vivo del CI contra socios APACG. Si matchea Member activo o
  // Member con cuotas pendientes, recalcula precios efectivos en los tickets
  // y muestra indicador suave para activar membresía en el flow de compra.
  useEffect(() => {
    if (!event?.id) return;
    const ci = buyerCi.trim();
    if (ci.length < 5) {
      setMemberPricing(null);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsCheckingPricing(true);
      try {
        const { data } = await api.post(
          `/api/client/events/${event.id}/check-pricing`,
          { ci },
          { signal: controller.signal }
        );
        if (data?.success) {
          setMemberPricing(data.data);
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'CanceledError') {
          setMemberPricing(null);
        }
      } finally {
        setIsCheckingPricing(false);
      }
    }, 500);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [buyerCi, event?.id]);

  // Si el CI deja de tener can_activate (cambió o no es socio), resetear el flag
  useEffect(() => {
    if (!memberPricing?.member_status?.can_activate && activateMembership) {
      setActivateMembership(false);
    }
  }, [memberPricing, activateMembership]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
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

  // El precio efectivo viene del backend si el CI matcheó (socio activo o
  // socio con cuotas pendientes que va a activar en el checkout). Fallback al
  // precio del usuario logueado o al público.
  const memberStatus = memberPricing?.member_status;
  const appliesPriceFromCi = !!memberPricing?.applies_member_price
    || !!memberStatus?.can_activate;

  const getTicketPrice = (ticketType: TicketType) => {
    if (appliesPriceFromCi) {
      const fromBackend = memberPricing?.ticket_types.find(t => t.id === ticketType.id);
      if (fromBackend) return fromBackend.effective_price;
    }
    if (isMember && ticketType.member_price !== null) {
      return ticketType.member_price;
    }
    return ticketType.price;
  };

  const updateTicketQuantity = (ticketId: number, change: number) => {
    const currentQuantity = selectedTickets[ticketId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    const ticketType = event.ticket_types.find(t => t.id === ticketId);
    
    if (ticketType && newQuantity <= ticketType.stock) {
      // Track selección de tickets (solo cuando se agrega)
      if (change > 0 && newQuantity > currentQuantity) {
        analytics.trackEvent('add_to_cart', {
          currency: 'PYG',
          value: ticketType.price,
          items: [{
            item_id: `ticket_${ticketId}`,
            item_name: ticketType.name,
            item_category: 'event_ticket',
            price: ticketType.price,
            quantity: 1
          }]
        });
      }
      
      setSelectedTickets(prev => ({
        ...prev,
        [ticketId]: newQuantity
      }));
    }
  };

  const getTotalPrice = () => {
    const ticketsTotal = Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticketType = event.ticket_types.find(t => t.id === parseInt(ticketId));
      return total + (ticketType ? getTicketPrice(ticketType) * quantity : 0);
    }, 0);
    const extrasTotal = Object.entries(selectedExtras).reduce((total, [extraId, qty]) => {
      const ex = event?.extras?.find(e => e.id === parseInt(extraId));
      return total + (ex ? Number(ex.price) * qty : 0);
    }, 0);
    return ticketsTotal + extrasTotal;
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const getTotalExtras = () => {
    return Object.values(selectedExtras).reduce((total, quantity) => total + quantity, 0);
  };

  // Hay items en el carrito si hay entradas, o si el evento permite solo-extras y hay extras.
  const hasCartItems = () => {
    if (getTotalTickets() > 0) return true;
    if (event?.allow_extras_only && getTotalExtras() > 0) return true;
    return false;
  };

  const updateExtraQty = (extraId: number, delta: number) => {
    setSelectedExtras(prev => {
      const current = prev[extraId] || 0;
      const next = Math.max(0, Math.min(50, current + delta));
      const updated = { ...prev };
      if (next === 0) delete updated[extraId];
      else updated[extraId] = next;
      return updated;
    });
  };

  const handlePurchase = async () => {
    if (!hasCartItems()) {
      const allowExtrasOnly = event?.allow_extras_only;
      toast({
        title: allowExtrasOnly ? "Selecciona al menos una entrada o un extra" : "Selecciona al menos una entrada",
        description: allowExtrasOnly
          ? "Agregá una entrada o un extra del evento para continuar."
          : "Debes seleccionar al menos una entrada para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    // Track intención de compra de tickets
    if (event) {
      analytics.trackTicketPurchase(
        event.id.toString(),
        event.title,
        getTotalTickets(),
        getTotalPrice()
      );
    }

    // Obtener código de referido si existe
    const referralCode = localStorage.getItem('referral_code');

    // Proceder al checkout con datos detallados
    const ticketDetails = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = event.ticket_types.find(t => t.id === parseInt(ticketId));
        const effectivePrice = ticketType ? getTicketPrice(ticketType) : 0;
        return {
          id: parseInt(ticketId),
          name: ticketType?.name || '',
          quantity: quantity,
          price: effectivePrice,
          total: effectivePrice * quantity
        };
      });

    const extraDetails = Object.entries(selectedExtras)
      .filter(([_, qty]) => qty > 0)
      .map(([extraId, qty]) => {
        const ex = event.extras?.find(e => e.id === parseInt(extraId));
        return {
          id: parseInt(extraId),
          name: ex?.name || '',
          quantity: qty,
          price: Number(ex?.price || 0),
          total: Number(ex?.price || 0) * qty,
        };
      });

    // Si el comprador es socio inactivo y eligió activar membresía,
    // pre-cargamos los datos para que el checkout los reciba listos.
    const pendingAnnualPayments = (memberStatus?.can_activate && memberStatus.unpaid_students.length > 0)
      ? memberStatus.unpaid_students.map(s => ({
          student_id: s.id,
          payment_year: s.payment_year,
        }))
      : undefined;

    const checkoutData = {
      type: 'event',
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      tickets: ticketDetails,
      extras: extraDetails,
      totalAmount: getTotalPrice(),
      totalTickets: getTotalTickets(),
      referralCode: referralCode,
      is_member: isMember || appliesPriceFromCi,
      // Pre-cargar CI ingresado en el evento
      prefilledCi: buyerCi.trim() || undefined,
      // Pre-cargar oferta de activación si aplica
      memberStatusFromEvent: memberStatus,
      pendingAnnualPayments,
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
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
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
          
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Event Images — cover principal + thumbnails de galería */}
            {(() => {
              const allImages: EventImage[] = [
                ...(event.cover ? [event.cover] : []),
                ...(event.gallery ?? []),
              ];
              const activeImage = allImages[activeImageIndex] ?? allImages[0];
              return (
                <div className="space-y-3">
                  {activeImage ? (
                    <img
                      src={activeImage.storage_path_full || activeImage.storage_path}
                      alt={event.title}
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Ticket className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                        <p className="text-primary/80 font-medium">Evento Especial</p>
                      </div>
                    </div>
                  )}

                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${idx === activeImageIndex ? 'border-primary' : 'border-transparent'}`}
                        >
                          <img
                            src={img.storage_path_full || img.storage_path}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            
            {/* Event Details */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(event.date, { format: 'long' })}
                </Badge>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground flex-1">
                    {event.title}
                  </h1>
                  <ShareButton type="event" slug={event.slug} title={event.title} iconOnly />
                </div>
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
              
              {/* Validación de socio APACG por CI — muestra precio socio en vivo */}
              {!event.is_informational && event.ticket_types.some(t => t.has_member_price) && (
                <div className="mt-8 rounded-lg border bg-muted/30 p-3 space-y-2">
                  <label className="block text-sm font-semibold">
                    ¿Sos socio APACG? Ingresá tu CI para ver precio socio
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={buyerCi}
                    onChange={(e) => setBuyerCi(e.target.value)}
                    placeholder="Ej: 1234567"
                    className="w-full px-3 py-2 rounded border bg-background text-sm"
                  />
                  {/* Estado del CI (live) */}
                  {isCheckingPricing && buyerCi.trim().length >= 5 && (
                    <p className="text-xs text-muted-foreground">Verificando…</p>
                  )}
                  {!isCheckingPricing && memberStatus?.is_apacg_member && memberStatus?.is_active && (
                    <p className="text-sm text-green-700 flex items-center gap-1.5">
                      <span>✓</span> Socio activo — precio socio aplicado
                    </p>
                  )}
                  {!isCheckingPricing && memberStatus?.can_activate && (
                    <p className="text-sm text-amber-800 leading-snug">
                      Sos socio APACG. Activá tu membresía al pagar
                      {' '}
                      (<strong>+Gs. {memberStatus.suggested_total.toLocaleString('es-PY')}</strong>)
                      {' '}y obtené precio socio en esta compra.
                    </p>
                  )}
                  {!isCheckingPricing && memberPricing && !memberStatus?.is_apacg_member && buyerCi.trim().length >= 5 && (
                    <p className="text-xs text-muted-foreground">
                      No encontramos un socio con ese CI. Continuás con precio general.
                    </p>
                  )}
                </div>
              )}

              {/* Ticket Selection - Simplified */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Entradas</h3>
                {event.allow_extras_only && !event.is_informational && (event.extras?.length ?? 0) > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Las entradas son opcionales: podés llevar solo extras si lo preferís.
                  </p>
                )}
                <div className="space-y-3">
                  {event.ticket_types.map((ticketType) => {
                    const effectivePrice = getTicketPrice(ticketType);
                    const showsMemberPrice = appliesPriceFromCi || (isMember && ticketType.member_price !== null);
                    return (
                    <div key={ticketType.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/20 transition-colors">
                      <div className="flex-1 min-w-0 pr-3">
                        <h4 className="font-semibold">{ticketType.name}</h4>
                        {ticketType.description && (
                          <p className="text-xs text-muted-foreground leading-snug mt-0.5 mb-1.5 whitespace-pre-line">
                            {ticketType.description}
                          </p>
                        )}
                        {ticketType.has_member_price ? (
                          showsMemberPrice ? (
                            <div>
                              <span className="text-sm line-through text-muted-foreground mr-2">
                                {formatPrice(ticketType.price)}
                              </span>
                              <span className="text-xl font-bold text-green-600">
                                {formatPrice(effectivePrice)}
                              </span>
                              <div className="text-xs text-green-700 font-medium">Precio socio aplicado</div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xl font-bold text-primary">
                                {formatPrice(ticketType.price)}
                              </span>
                              <div className="text-sm font-medium text-green-600">
                                Socios: {formatPrice(ticketType.member_price!)}
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(ticketType.price)}
                          </span>
                        )}
                      </div>
                      
                      {!event.is_informational && (
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Disminuir cantidad"
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
                            aria-label="Aumentar cantidad"
                            onClick={() => updateTicketQuantity(ticketType.id, 1)}
                            disabled={(selectedTickets[ticketType.id] || 0) >= ticketType.stock}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>

                {/* Sección Extras (comida, bebida, etc) — compacta para densidad mobile */}
                {event.extras && event.extras.length > 0 && !event.is_informational && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-1">Extras del evento</h3>
                    {event.extras_description && (
                      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                        {event.extras_description}
                      </p>
                    )}
                    <div className="rounded-lg border border-amber-200 bg-amber-50/30 divide-y divide-amber-200/60">
                      {event.extras.map((extra) => (
                        <div key={extra.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50/60 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm leading-tight truncate">{extra.name}</h4>
                              <span className="text-sm font-bold text-amber-700 whitespace-nowrap">
                                {formatPrice(extra.price)}
                              </span>
                            </div>
                            {extra.description && (
                              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                                {extra.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Disminuir cantidad"
                              onClick={() => updateExtraQty(extra.id, -1)}
                              disabled={!selectedExtras[extra.id]}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-6 text-center font-semibold text-sm">
                              {selectedExtras[extra.id] || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Aumentar cantidad"
                              onClick={() => updateExtraQty(extra.id, 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchase Button — solo desktop. En mobile se usa el sticky bottom bar. */}
                {hasCartItems() && !event.is_informational && (
                  <div className="hidden md:block mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>

                    {/* Indicador de membresía si hay precios diferenciales */}
                    {event.ticket_types.some(t => t.has_member_price) && (
                      <div className="mb-3">
                        <MembershipBadge isMember={isMember} compact />
                      </div>
                    )}

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
      <section className="py-16 bg-muted/30 pb-32 md:pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Acerca del Evento</h2>
            <div
              className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={renderSafeHtml(event.description)}
            />
          </div>
        </div>
      </section>

      {/* Sticky bottom bar — visible solo en mobile cuando hay items en el carrito */}
      {hasCartItems() && !event.is_informational && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border shadow-lg p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Total</div>
            <div className="text-xl font-bold text-primary leading-tight">
              {formatPrice(getTotalPrice())}
            </div>
          </div>
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            size="lg"
            className="bg-primary hover:bg-primary/90 px-6"
          >
            Comprar ahora
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;
