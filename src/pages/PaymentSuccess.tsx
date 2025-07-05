import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Mail, Home, Loader2, CreditCard, Calendar, Hash, Receipt } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/utils';
import api from '@/services/api';

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
    total_amount: number;
    items: Array<{
      id: number;
      orderable_type: string;
      orderable_id: number;
      quantity: number;
      unit_price: number;
      total_price: number;
      details?: any;
    }>;
  };
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const fallbackTitle = searchParams.get('title') || 'su compra';

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (orderId && paymentId) {
      fetchPaymentDetails();
    } else {
      // Si no hay IDs, mostrar página básica
      setIsLoading(false);
    }
  }, [orderId, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/client/payments/${paymentId}/details`);
      
      if (response.data.success) {
        setPaymentDetails(response.data.data);
      } else {
        setError('No se pudieron cargar los detalles del pago');
      }
    } catch (error: any) {
      console.error('Error fetching payment details:', error);
      setError('Error al cargar los detalles del pago');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-PY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getItemTypeName = (type: string) => {
    switch (type) {
      case 'App\\Models\\Event':
        return 'Evento';
      case 'App\\Models\\EventTicketType':
        return 'Entrada';
      case 'App\\Models\\Raffle':
        return 'Rifa';
      default:
        return 'Item';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando detalles del pago...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-green-600 dark:text-green-400">
                ¡Pago Exitoso!
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Su compra ha sido procesada correctamente
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Detalles del pago */}
              {paymentDetails && !error ? (
                <div className="bg-muted/30 rounded-lg p-6 space-y-6">
                  <h3 className="font-semibold text-lg text-left">Detalles del Pago</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Hash className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Número de Autorización</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {paymentDetails.authorization_number}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Número de Ticket</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {paymentDetails.ticket_number}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Monto Pagado</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(paymentDetails.amount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Fecha y Hora</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(paymentDetails.processed_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resumen de compra */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 text-left">Resumen de Compra</h4>
                    <div className="space-y-2">
                      {paymentDetails.order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-left">
                            {getItemTypeName(item.orderable_type)} - Cantidad: {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatPrice(item.total_price)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(paymentDetails.order.total_amount)} PYG</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-muted/30 rounded-lg p-6">
                  <p className="text-muted-foreground">{error}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Su pago fue procesado correctamente, pero no pudimos cargar los detalles.
                  </p>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-6">
                  <p className="text-muted-foreground">
                    Su compra de <strong>{fallbackTitle}</strong> ha sido procesada correctamente
                  </p>
                </div>
              )}

              {/* Próximos pasos */}
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">¿Qué sigue ahora?</h3>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Confirmación por correo</p>
                      <p className="text-sm text-muted-foreground">
                        Recibirá un correo electrónico con los detalles de su compra y las instrucciones correspondientes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Comprobante disponible</p>
                      <p className="text-sm text-muted-foreground">
                        Puede descargar su comprobante desde su perfil en cualquier momento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link to="/perfil">
                    Ver Mis Compras
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Volver al Inicio
                  </Link>
                </Button>
              </div>

              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>
                  Si tiene alguna pregunta sobre su compra, no dude en contactarnos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;