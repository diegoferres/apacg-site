import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/utils';

interface TicketDetail {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cedula: string;
}

interface PaymentData {
  type: 'event' | 'raffle';
  eventId?: number;
  eventSlug?: string;
  eventTitle?: string;
  tickets?: TicketDetail[];
  totalAmount: number;
  totalTickets: number;
  customerData: CustomerData;
}

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    // Intentar leer datos del localStorage
    const savedData = localStorage.getItem('payment_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setPaymentData(parsedData);
      } catch (error) {
        console.error('Error parsing payment data:', error);
        setError('Error al cargar los datos de pago');
      }
    } else {
      // Fallback a URLSearchParams para compatibilidad
      const itemTitle = searchParams.get('title') || 'Compra';
      const itemTotal = searchParams.get('total') || '0';
      const itemType = searchParams.get('type') as 'event' | 'raffle' || 'event';
      const itemQuantity = searchParams.get('quantity') || '1';
      const itemUnitPrice = searchParams.get('unitPrice') || itemTotal;
      const customerName = searchParams.get('name') || '';
      const customerEmail = searchParams.get('email') || '';
      const customerPhone = searchParams.get('phone') || '';
      const customerCedula = searchParams.get('cedula') || '';
      
      if (itemTitle && itemTotal) {
        setPaymentData({
          type: itemType,
          eventTitle: itemTitle,
          totalAmount: parseInt(itemTotal),
          totalTickets: parseInt(itemQuantity),
          tickets: [{
            id: 1,
            name: itemType === 'event' ? 'Entrada General' : 'Número de Rifa',
            quantity: parseInt(itemQuantity),
            price: parseInt(itemUnitPrice),
            total: parseInt(itemTotal)
          }],
          customerData: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            cedula: customerCedula
          }
        });
      } else {
        setError('No se encontraron datos de pago');
      }
    }

    // Simular carga del iframe de pago
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleGoBack = () => {
    navigate('/checkout');
  };

  const handlePaymentSuccess = () => {
    if (paymentData) {
      // Limpiar datos del localStorage
      localStorage.removeItem('payment_data');
      localStorage.removeItem('checkout_data');
      
      // Redirigir a página de éxito
      navigate('/pago-exitoso?title=' + encodeURIComponent(paymentData.eventTitle || 'Compra'));
    }
  };

  const handlePaymentError = () => {
    setError('Hubo un problema procesando el pago. Por favor, verifique sus datos e intente nuevamente.');
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold mb-4">No se encontraron datos de pago</h1>
          <Button onClick={() => navigate('/')}>Volver a Inicio</Button>
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
          <Button variant="ghost" onClick={handleGoBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Datos
          </Button>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Resumen de compra */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Comprador:</span>
                      <p className="text-muted-foreground">{paymentData.customerData.name}</p>
                      <p className="text-muted-foreground">{paymentData.customerData.email}</p>
                      <p className="text-muted-foreground">{paymentData.customerData.phone}</p>
                      <p className="text-muted-foreground">C.I. {paymentData.customerData.cedula}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <h3 className="font-semibold text-sm mb-2">{paymentData.eventTitle}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {paymentData.type === 'event' ? 'Entrada de Evento' : 'Números de Rifa'}
                    </p>
                    
                    {paymentData.tickets && paymentData.tickets.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Detalle:</h4>
                        {paymentData.tickets.map((ticket, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{ticket.quantity}x {ticket.name}</span>
                            <span>{formatPrice(ticket.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Total de entradas:</span>
                      <span className="text-sm font-medium">{paymentData.totalTickets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(paymentData.totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Iframe de pago */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Procesamiento de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
                      <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground">Cargando procesador de pagos...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Simulación del iframe */}
                      <div className="w-full h-96 bg-muted/10 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-4 p-8">
                          <CreditCard className="h-16 w-16 text-primary mx-auto" />
                          <h3 className="text-lg font-semibold">Iframe del Procesador de Pagos</h3>
                          <p className="text-muted-foreground">
                            Aquí se mostraría el formulario de la procesadora de pagos (Bancard)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total a pagar: {formatPrice(paymentData.totalAmount)}
                          </p>
                          
                          {/* Botones de simulación */}
                          <div className="flex gap-4 justify-center pt-4">
                            <Button onClick={handlePaymentSuccess} className="bg-green-600 hover:bg-green-700">
                              Simular Pago Exitoso
                            </Button>
                            <Button onClick={handlePaymentError} variant="destructive">
                              Simular Error
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Información de seguridad */}
                      <div className="text-center text-sm text-muted-foreground">
                        <p>🔒 Conexión segura. Sus datos están protegidos.</p>
                        <p>Procesador de pagos: Bancard</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment;