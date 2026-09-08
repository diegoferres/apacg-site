import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Mail, Home, Loader2, Calendar, MapPin, Ticket, ShoppingBag,
  GraduationCap, User, ChevronDown, Sparkles,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice, formatDate, toNumber } from '@/lib/utils';
import { useStore } from '@/stores/store';
import api from '@/services/api';
import analytics from '@/services/analytics';

/** Tipos de `orderable_type` que puede traer una orden. */
const T = {
  TICKET: 'App\\Models\\EventTicketType',
  EXTRA: 'App\\Models\\EventExtra',
  RAFFLE: 'App\\Models\\Raffle',
  PRODUCT: 'App\\Models\\Product',
  VARIANT: 'App\\Models\\ProductVariant',
  COURSE: 'App\\Models\\Course',
  COURSE_GROUP: 'App\\Models\\CourseGroup',
  ANNUAL: 'App\\Models\\StudentAnnualPayment',
} as const;

interface PaymentDetails {
  id: number;
  order_id: number;
  authorization_number: string;
  ticket_number: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  processed_at: string;
  order: {
    id: number;
    order_number?: string;
    status?: string;
    total_amount: number;
    customer_data?: {
      name?: string;
      email?: string;
      phone?: string;
      cedula?: string;
    } | null;
    /** Fecha, hora y lugar del evento, cuando la orden tiene entradas o extras. */
    event?: {
      title?: string;
      date?: string;
      time?: string;
      location?: string;
    } | null;
    applied_coupon?: {
      coupon_id: number;
      coupon_code: string;
      coupon_name: string;
      discount_type: 'percentage' | 'fixed';
      discount_value: number;
      original_amount: number;
      discount_amount: number;
      final_amount: number;
    };
    items: Array<{
      id: number;
      orderable_type: string;
      orderable_id: number;
      quantity: number;
      unit_price: number;
      total_price: number;
      details?: any;
      item_details?: any;
      /** Números asignados, sólo en ítems de rifa. */
      raffle_numbers?: Array<string | number>;
      orderable?: { id: number; title?: string; type?: string };
    }>;
  };
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useStore();

  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const fallbackTitle = searchParams.get('title') || 'su compra';

  useEffect(() => {
    window.scrollTo(0, 0);

    if (orderId && paymentId) {
      fetchPaymentDetails();
    } else {
      localStorage.removeItem('checkout_form_data');
      localStorage.removeItem('payment_data');
      localStorage.removeItem('checkout_data');
      setIsLoading(false);
    }
  }, [orderId, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setIsLoading(true);

      let url = `/api/client/payments/${paymentId}/details`;
      let email = null;

      // El email valida el acceso cuando la compra fue como invitado.
      const paymentData = localStorage.getItem('payment_data');
      if (paymentData) {
        try {
          const parsed = JSON.parse(paymentData);
          email = parsed.customerData?.email || parsed.customer_data?.email;
        } catch (e) {
          console.warn('Could not parse payment_data for email');
        }
      }

      if (!email) {
        const checkoutData = localStorage.getItem('checkout_data');
        if (checkoutData) {
          try {
            const parsed = JSON.parse(checkoutData);
            email = parsed.customerData?.email || parsed.customer_data?.email ||
              parsed.customerEmail || parsed.email;
          } catch (e) {
            console.warn('Could not parse checkout_data for email');
          }
        }
      }

      if (!email) email = searchParams.get('email');
      if (email) url += `?email=${encodeURIComponent(email)}`;

      const response = await api.get(url);

      if (response.data.success) {
        setPaymentDetails(response.data.data);

        const payment = response.data.data;
        const gaItems = [];

        if (payment.order?.items) {
          payment.order.items.forEach((item: any) => {
            const itemType = item.orderable_type?.toLowerCase() || '';
            let category = 'other';
            if (itemType.includes('ticket')) category = 'event_ticket';
            else if (itemType.includes('course')) category = 'course';
            else if (itemType.includes('raffle')) category = 'raffle';

            gaItems.push({
              item_id: `${item.orderable_type}_${item.orderable_id}`,
              item_name: item.details?.name || 'Item',
              item_category: category,
              price: item.unit_price,
              quantity: item.quantity,
              currency: 'PYG',
            });
          });
        }

        analytics.trackPurchase(
          payment.ticket_number || payment.id.toString(),
          payment.amount,
          gaItems,
        );

        localStorage.removeItem('checkout_form_data');
        localStorage.removeItem('payment_data');
        localStorage.removeItem('checkout_data');
      } else {
        setError('No se pudieron cargar los detalles del pago');
      }
    } catch (error: any) {
      console.error('Error fetching payment details:', error);

      if (error.response?.status === 401 && !location.search.includes('email=')) {
        let fallbackEmail = null;
        const sources = [
          localStorage.getItem('payment_data'),
          localStorage.getItem('checkout_data'),
          searchParams.get('email'),
        ];

        for (const source of sources) {
          if (typeof source === 'string') {
            if (source.includes('@') && !source.includes('{')) {
              fallbackEmail = source;
              break;
            } else if (source.includes('{')) {
              try {
                const parsed = JSON.parse(source);
                fallbackEmail = parsed.customerData?.email || parsed.customer_data?.email ||
                  parsed.customerEmail || parsed.email;
                if (fallbackEmail) break;
              } catch (e) { /* ignorar */ }
            }
          }
        }

        if (fallbackEmail) {
          const retryUrl = `/api/client/payments/${paymentId}/details?email=${encodeURIComponent(fallbackEmail)}`;
          try {
            const retryResponse = await api.get(retryUrl);
            if (retryResponse.data.success) {
              setPaymentDetails(retryResponse.data.data);
              localStorage.removeItem('checkout_form_data');
              localStorage.removeItem('payment_data');
              localStorage.removeItem('checkout_data');
              return;
            }
          } catch (retryError) {
            console.error('Retry with email also failed:', retryError);
          }
        }
      }

      if (error.response?.status === 400 && error.response?.data?.error === 'EMAIL_REQUIRED') {
        setError('Se requiere validación de email para ver los detalles del pago');
      } else if (error.response?.status === 403) {
        setError('No tiene permisos para ver los detalles de este pago');
      } else if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente para ver los detalles.');
      } else {
        setError('Error al cargar los detalles del pago');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────── Derivados de la orden ───────────────────────────
  const items = paymentDetails?.order.items ?? [];
  const detailsOf = (item: any) => item.details || item.item_details || {};
  const countOf = (type: string) =>
    items.filter((i) => i.orderable_type === type).reduce((sum, i) => sum + i.quantity, 0);

  const ticketCount = countOf(T.TICKET);
  const extraCount = countOf(T.EXTRA);
  const hasRaffle = items.some((i) => i.orderable_type === T.RAFFLE);
  const hasCourse = items.some((i) => i.orderable_type === T.COURSE || i.orderable_type === T.COURSE_GROUP);
  const hasProducts = items.some((i) => i.orderable_type === T.PRODUCT || i.orderable_type === T.VARIANT);
  const hasMembership = items.some((i) => i.orderable_type === T.ANNUAL);
  const isFree = paymentDetails?.payment_method === 'free' || toNumber(paymentDetails?.amount ?? 0) === 0;

  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

  /** El encabezado nombra el acto, no siempre un "pago". */
  const heroTitle = (() => {
    if (!paymentDetails) return '¡Listo!';
    if (isFree) return '¡Reserva confirmada!';
    if (hasCourse && !ticketCount && !hasProducts) return '¡Inscripción confirmada!';
    if (hasProducts && !ticketCount && !hasCourse) return '¡Pedido confirmado!';
    if (hasRaffle && !ticketCount && !hasProducts && !hasCourse) return '¡Ya estás participando!';
    return '¡Pago confirmado!';
  })();

  /**
   * Contexto del evento. El backend lo manda en `order.event` (fecha, hora y lugar
   * leídos en vivo); si no viniera, se cae al título y fecha congelados en item_details.
   */
  const eventCtx = (() => {
    const fromApi = paymentDetails?.order.event;
    if (fromApi?.title) return fromApi;

    const it = items.find((i) => i.orderable_type === T.TICKET || i.orderable_type === T.EXTRA);
    if (!it) return null;
    const d = detailsOf(it);
    if (!d.event_title) return null;
    return { title: d.event_title as string, date: d.event_date as string | undefined };
  })();

  /** Números de rifa asignados a la orden (vienen por ítem desde el backend). */
  const raffleNumbers: string[] = items
    .filter((i) => i.orderable_type === T.RAFFLE)
    .flatMap((i) => i.raffle_numbers ?? [])
    .map(String);

  /** Todo lo que llega en el mismo correo va listado en una sola tarjeta. */
  const mailItems: Array<{ what: string; how: string }> = [];
  if (ticketCount > 0) {
    mailItems.push({
      what: `${ticketCount} ${plural(ticketCount, 'entrada', 'entradas')} con código QR`,
      how: `${plural(ticketCount, 'Presentala', 'Presentalas')} en el ingreso, desde el celular o ${plural(ticketCount, 'impresa', 'impresas')}.`,
    });
  }
  if (extraCount > 0) {
    mailItems.push({
      what: `${extraCount} ${plural(extraCount, 'voucher', 'vouchers')} de consumición`,
      how: `Se ${plural(extraCount, 'canjea', 'canjean')} en el puesto del evento.`,
    });
  }
  if (hasRaffle) {
    mailItems.push({
      what: 'el comprobante con tus números',
      how: 'Guardalo: esos son los números que participan del sorteo.',
    });
  }
  if (hasCourse) {
    mailItems.push({
      what: 'el comprobante de inscripción',
      how: 'Te contactamos con los datos del grupo antes del inicio.',
    });
  }
  if (mailItems.length === 0 && paymentDetails) {
    mailItems.push({
      what: 'el comprobante de tu compra',
      how: 'Guardalo por cualquier consulta.',
    });
  }

  const customer = paymentDetails?.order.customer_data ?? null;
  const email = customer?.email ?? null;

  const headLabel = hasProducts ? 'Tu pedido'
    : hasCourse ? 'Tu inscripción'
    : hasRaffle && !ticketCount ? 'Tus números'
    : ticketCount > 0 && isFree ? 'Tu entrada'
    : 'Tu compra';

  const HeadIcon = hasProducts ? ShoppingBag
    : hasCourse ? GraduationCap
    : hasRaffle && !ticketCount ? Sparkles
    : Ticket;

  const primaryCta = isLoggedIn
    ? { label: 'Ver mis compras', to: '/perfil' }
    : hasProducts ? { label: 'Seguir comprando', to: '/tienda' }
    : hasCourse ? { label: 'Ver cursos', to: '/cursos' }
    : hasRaffle && !ticketCount ? { label: 'Ver más rifas', to: '/rifas' }
    : { label: 'Ver más eventos', to: '/eventos' };

  const getDetailedItemDescription = (item: any) => {
    const type = item.orderable_type;
    const d = detailsOf(item);

    switch (type) {
      case 'App\\Models\\Event':
        return 'Evento';
      case T.TICKET:
        return d.ticket_type_name || 'Entrada';
      case T.EXTRA:
        return d.extra_name || d.name || 'Extra del evento';
      case T.RAFFLE:
        return d.raffle_title || 'Números de rifa';
      case T.ANNUAL:
        return d.student_name ? `Anualidad · ${d.student_name}` : 'Anualidad';
      case 'App\\Models\\Course':
      case T.COURSE_GROUP: {
        let description = 'Inscripción a curso';
        if (d.course_title) description = `Inscripción a ${d.course_title}`;
        if (d.course_group_name) description += ` - ${d.course_group_name}`;
        else if (d.group_name) description += ` - ${d.group_name}`;
        if (d.student_data?.name || d.student_name) {
          description += ` (Estudiante: ${d.student_data?.name || d.student_name})`;
        }
        return description;
      }
      case T.PRODUCT:
      case T.VARIANT: {
        const productName = d.product_name || 'Producto';
        return d.variant_name ? `${productName} · ${d.variant_name}` : productName;
      }
      default:
        return item.orderable?.title || 'Item';
    }
  };

  const getItemBreakdown = (item: any) => {
    const d = detailsOf(item);

    if ((item.orderable_type === 'App\\Models\\Course' || item.orderable_type === T.COURSE_GROUP) &&
      (d.payment_breakdown || d.enrollment_fee || d.monthly_fee)) {
      const rows = [];
      const b = d.payment_breakdown;

      if (b) {
        if (b.enrollment_fee > 0) rows.push({ name: 'Matrícula', amount: b.enrollment_fee });
        if (b.monthly_fee > 0) rows.push({ name: 'Mensualidad', amount: b.monthly_fee });
      } else {
        if (toNumber(d.enrollment_fee) > 0) rows.push({ name: 'Matrícula', amount: toNumber(d.enrollment_fee) });
        if (toNumber(d.monthly_fee) > 0) rows.push({ name: 'Mensualidad', amount: toNumber(d.monthly_fee) });
      }

      return rows.length > 0 ? rows : null;
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="page-top pb-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando detalles de tu compra...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="page-top pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="flex flex-col gap-4">

            {/* ── Confirmación ── */}
            <header className="flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/25 grid place-items-center">
                <CheckCircle2 className="h-6 w-6 text-green-700 dark:text-green-400" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-balance">
                {heroTitle}
              </h1>
              {paymentDetails && (
                <p className="text-sm text-muted-foreground">
                  {[
                    ticketCount > 0 && `${ticketCount} ${plural(ticketCount, 'entrada', 'entradas')}`,
                    extraCount > 0 && `${extraCount} ${plural(extraCount, 'voucher', 'vouchers')}`,
                    hasProducts && `${items.filter((i) => i.orderable_type === T.PRODUCT || i.orderable_type === T.VARIANT).reduce((s, i) => s + i.quantity, 0)} productos`,
                    eventCtx?.date && formatDate(eventCtx.date, { format: 'long' }),
                  ].filter(Boolean).join(' · ')}
                </p>
              )}
            </header>

            {paymentDetails && !error ? (
              <>
                {/* ── Resumen ── */}
                <Card>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <HeadIcon className="h-3.5 w-3.5" />
                      {headLabel}
                    </div>

                    {eventCtx && (
                      <>
                        <div>
                          <h2 className="text-base font-semibold leading-snug text-balance">{eventCtx.title}</h2>
                        </div>
                        <div className="flex flex-col gap-2">
                          {eventCtx.date && (
                            <div className="flex items-start gap-2 text-sm">
                              <Calendar className="h-4 w-4 mt-0.5 flex-none text-muted-foreground" />
                              <span>
                                {formatDate(eventCtx.date, { format: 'long' })}
                                {eventCtx.time && <><br /><span className="text-muted-foreground">{eventCtx.time}</span></>}
                              </span>
                            </div>
                          )}
                          {eventCtx.location && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="h-4 w-4 mt-0.5 flex-none text-muted-foreground" />
                              <span>{eventCtx.location}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Números de rifa: con más de 8 se colapsa el resto. */}
                    {raffleNumbers.length > 0 && (
                      <>
                        <div className="h-px bg-border" />
                        <div className="flex flex-wrap gap-1.5">
                          {raffleNumbers.slice(0, 8).map((n) => (
                            <span key={n} className="px-2.5 py-1.5 rounded-lg bg-muted border text-sm font-semibold tabular-nums">
                              {n}
                            </span>
                          ))}
                        </div>
                        {raffleNumbers.length > 8 && (
                          <details className="group">
                            <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                              Ver los {raffleNumbers.length - 8} restantes
                              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-40 overflow-y-auto">
                              {raffleNumbers.slice(8).map((n) => (
                                <span key={n} className="px-2.5 py-1.5 rounded-lg bg-muted border text-sm font-semibold tabular-nums">
                                  {n}
                                </span>
                              ))}
                            </div>
                          </details>
                        )}
                      </>
                    )}

                    <div className="h-px bg-border" />

                    <div className="flex flex-col gap-3">
                      {items.map((item) => {
                        const breakdown = getItemBreakdown(item);
                        const d = detailsOf(item);

                        return (
                          <div key={item.id} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-medium min-w-0">
                                {getDetailedItemDescription(item)}
                                {item.quantity > 1 && (
                                  <span className="block text-[13px] font-normal text-muted-foreground mt-0.5">
                                    {item.quantity} unidades
                                  </span>
                                )}
                              </span>
                              {isFree ? (
                                <span className="flex-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/25 dark:text-green-300 dark:border-green-800">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Cortesía
                                </span>
                              ) : (
                                <span className="font-semibold tabular-nums whitespace-nowrap">
                                  {formatPrice(toNumber(item.total_price))}
                                </span>
                              )}
                            </div>

                            {breakdown && (
                              <div className="flex flex-col gap-1 ml-0.5 pl-3 border-l-2">
                                {breakdown.map((b, i) => (
                                  <div key={i} className="flex justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                                    <span>{b.name}</span>
                                    <span>{formatPrice(b.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {d?.is_pre_order && (
                              <span className="self-start inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Calendar className="h-3 w-3" />
                                Pre-venta
                                {d.estimated_delivery_date && (
                                  <> · entrega estimada {formatDate(d.estimated_delivery_date, { format: 'medium' })}</>
                                )}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {paymentDetails.order.applied_coupon && (
                      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                        <div className="flex justify-between gap-2">
                          <span>Cupón <span className="font-bold">{paymentDetails.order.applied_coupon.coupon_code}</span></span>
                          <span>{paymentDetails.order.applied_coupon.coupon_name}</span>
                        </div>
                        <div className="flex justify-between gap-2 tabular-nums">
                          <span>Subtotal</span>
                          <span>{formatPrice(toNumber(paymentDetails.order.applied_coupon.original_amount))}</span>
                        </div>
                        <div className="flex justify-between gap-2 tabular-nums font-medium">
                          <span>Descuento</span>
                          <span>-{formatPrice(toNumber(paymentDetails.order.applied_coupon.discount_amount))}</span>
                        </div>
                      </div>
                    )}

                    {/* En una cortesía el precio es el dato menos relevante: lo dice el chip. */}
                    {!isFree && (
                      <>
                        <div className="h-px bg-border" />
                        <div className="flex items-baseline justify-between gap-3 font-bold">
                          <span>Total pagado</span>
                          <span className="tabular-nums">{formatPrice(toNumber(paymentDetails.order.total_amount))}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* ── Qué sigue: un correo, aunque lleve varias cosas ── */}
                <Card>
                  <CardContent className="p-4 flex gap-3">
                    <Mail className="h-5 w-5 mt-0.5 flex-none text-green-700 dark:text-green-400" />
                    <div className="min-w-0">
                      {mailItems.length === 1 ? (
                        <>
                          <p className="text-sm leading-snug">
                            Enviamos <strong>{mailItems[0].what}</strong>
                            {email && <> a<span className="block font-semibold break-words">{email}</span></>}
                          </p>
                          <p className="mt-1.5 text-xs text-muted-foreground leading-snug">
                            {mailItems[0].how} Si no llega en unos minutos, revisá spam.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm leading-snug">
                            Enviamos{email && <> a<span className="block font-semibold break-words">{email}</span></>}
                          </p>
                          <ul className="mt-2 flex flex-col gap-2 list-none p-0">
                            {mailItems.map((m, i) => (
                              <li key={i} className="relative pl-4 text-[13.5px] leading-snug">
                                <span className="absolute left-0.5 top-[7px] h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                                <strong>{m.what}</strong>
                                <span className="block text-xs text-muted-foreground mt-0.5">{m.how}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Si no llegan en unos minutos, revisá spam.
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lo que NO llega por correo va aparte, porque no es lo mismo. */}
                {hasProducts && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200">
                    <MapPin className="h-5 w-5 mt-0.5 flex-none" />
                    <div>
                      <p className="text-sm leading-snug">
                        <strong>Solo retiro en APACG.</strong> No hacemos envíos a domicilio.
                      </p>
                      <p className="mt-1.5 text-xs leading-snug opacity-90">
                        Te avisamos por correo cuando tu pedido esté listo para retirar.
                      </p>
                    </div>
                  </div>
                )}

                {hasMembership && (
                  <Card>
                    <CardContent className="p-4 flex gap-3">
                      <User className="h-5 w-5 mt-0.5 flex-none text-green-700 dark:text-green-400" />
                      <div>
                        <p className="text-sm leading-snug">La <strong>membresía</strong> quedó activa.</p>
                        <p className="mt-1.5 text-xs text-muted-foreground leading-snug">
                          Ya podés usar los beneficios de socio.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ── Referencias: una línea, no una tarjeta de siete filas ── */}
                <p className="flex flex-wrap gap-x-3 gap-y-1 px-0.5 text-xs text-muted-foreground tabular-nums">
                  {paymentDetails.order.order_number && (
                    <span>Orden <b className="font-semibold text-foreground">{paymentDetails.order.order_number}</b></span>
                  )}
                  {customer?.cedula && (
                    <span>CI <b className="font-semibold text-foreground">{customer.cedula}</b></span>
                  )}
                </p>
              </>
            ) : error ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tu compra se procesó correctamente, pero no pudimos cargar los detalles.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Tu compra de <strong>{fallbackTitle}</strong> se procesó correctamente.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ── Acciones ── */}
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full h-12 text-[15px]">
                <Link to={primaryCta.to}>{primaryCta.label}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 text-[15px]">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Volver al inicio
                </Link>
              </Button>
            </div>

            {/* ── Datos del checkout, plegados: se muestran los que sirven ── */}
            {customer && (
              <details className="group border-t pt-3">
                <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                  Ver datos de la compra
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <dl className="flex flex-col mt-2.5">
                  {[
                    ['Nombre', customer.name],
                    ['Cédula', customer.cedula],
                    ['Correo', customer.email],
                    ['Teléfono', customer.phone],
                    ['N.º de orden', paymentDetails?.order.order_number],
                    ['Medio', isFree ? 'Cortesía' : paymentDetails?.payment_method],
                    ['Confirmado', paymentDetails?.processed_at
                      ? formatDate(paymentDetails.processed_at, { includeTime: true })
                      : null],
                  ]
                    .filter(([, value]) => Boolean(value))
                    .map(([label, value]) => (
                      <div key={label as string} className="flex items-baseline justify-between gap-4 py-2 text-[13.5px] border-b last:border-b-0 last:pb-0">
                        <dt className="flex-none text-muted-foreground">{label}</dt>
                        <dd className="m-0 text-right font-medium min-w-0 break-words">{value}</dd>
                      </div>
                    ))}
                </dl>
              </details>
            )}

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              ¿Algún problema con tu compra? Escribinos.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
