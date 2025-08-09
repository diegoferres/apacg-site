import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice, formatDate } from '@/lib/utils';
import api from '@/services/api';

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
  referralCode?: string;
}

interface BancardData {
  process_id: string;
  script_url: string;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [bancardData, setBancardData] = useState<BancardData | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    loadPaymentData();
  }, [searchParams]);

  const loadPaymentData = () => {
    // Intentar leer datos del localStorage
    const savedData = localStorage.getItem('payment_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setPaymentData(parsedData);
        setIsLoading(false);
        // Crear automáticamente la orden de pago
        createPaymentOrder(parsedData);
      } catch (error) {
        console.error('Error parsing payment data:', error);
        setError('Error al cargar los datos de pago');
        setIsLoading(false);
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
        const fallbackData = {
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
        };
        setPaymentData(fallbackData);
        setIsLoading(false);
        createPaymentOrder(fallbackData);
      } else {
        setError('No se encontraron datos de pago');
        setIsLoading(false);
      }
    }
  };

  const createPaymentOrder = async (data: PaymentData) => {
    if (!data.eventId) {
      setError('ID del item no encontrado. No se puede procesar el pago.');
      return;
    }

    setIsCreatingPayment(true);
    setError(null);

    try {
      // Preparar datos según el tipo (return_url se maneja automáticamente en el backend)
      const requestData: any = {
        type: data.type,
        item_id: data.eventId,
        customer_data: data.customerData,
        referral_code: data.referralCode // Incluir código de referido si existe
      };

      if (data.type === 'event') {
        // Para eventos, enviar array de tickets específicos
        requestData.tickets = data.tickets?.map(ticket => ({
          id: ticket.id,
          quantity: ticket.quantity
        }));
      } else {
        // Para rifas, usar quantity simple
        requestData.quantity = data.totalTickets;
      }

      const response = await api.post('/api/client/sales/create-order', requestData);

      if (response.data.success) {
        const { checkout_data, order, payment_id } = response.data.data;
        setBancardData(checkout_data);
        setOrderId(order.id);
        
        // Guardar datos para el callback
        localStorage.setItem('current_payment', JSON.stringify({
          order_id: order.id,
          payment_id: payment_id,
          process_id: checkout_data.process_id
        }));

        // Cargar script de Bancard
        loadBancardScript(checkout_data);
      } else {
        setError(response.data.message || 'Error al crear la orden de pago');
      }
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        // Redirigir al login después de 2 segundos
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Error interno del servidor. Inténtelo nuevamente.');
      }
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const loadBancardScript = (checkoutData: BancardData) => {
    // Verificar si el script ya está cargado
    if (document.getElementById('bancard-script')) {
      initializeBancardCheckout(checkoutData);
      return;
    }

    const script = document.createElement('script');
    script.id = 'bancard-script';
    script.src = checkoutData.script_url;
    script.onload = () => {
      initializeBancardCheckout(checkoutData);
    };
    script.onerror = () => {
      setError('Error al cargar el procesador de pagos. Verifique su conexión.');
    };
    
    document.head.appendChild(script);
  };

  const initializeBancardCheckout = (checkoutData: BancardData) => {
    try {
      // @ts-ignore - Bancard script global
      if (window.Bancard && window.Bancard.Checkout) {
        // Limpiar contenedor
        const container = document.getElementById('bancard-checkout-container');
        if (container) {
          container.innerHTML = '';
        }

        // Configurar estilos del formulario
        const styles = {
          "form-background-color": "#ffffff",
          "button-background-color": "#0ea5e9",
          "button-text-color": "#ffffff",
          "button-border-color": "#0ea5e9",
          "input-background-color": "#ffffff",
          "input-text-color": "#333333",
          "input-placeholder-color": "#666666"
        };

        // @ts-ignore
        window.Bancard.Checkout.createForm(
          'bancard-checkout-container',
          checkoutData.process_id,
          styles
        );

        // Bancard se encarga de la redirección automática al completar/fallar
        console.log('Bancard checkout form initialized successfully');
      } else {
        setError('El procesador de pagos no está disponible. Inténtelo nuevamente.');
      }
    } catch (error) {
      console.error('Error initializing Bancard checkout:', error);
      setError('Error al inicializar el procesador de pagos.');
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment success:', data);
    
    // Limpiar datos del localStorage (pero preservar checkout_form_data para guests)
    localStorage.removeItem('payment_data');
    localStorage.removeItem('checkout_data');
    localStorage.removeItem('current_payment');
    localStorage.removeItem('referral_code'); // Limpiar código de referido usado
    // NO limpiar checkout_form_data para preservar datos del formulario para guests
    
    // Redirigir a página de éxito con datos
    navigate(`/pago-exitoso?title=${encodeURIComponent(paymentData?.eventTitle || 'Compra')}&order=${orderId}`);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setError('Hubo un problema procesando el pago. Por favor, verifique sus datos e intente nuevamente.');
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
    // NO limpiar checkout_form_data para preservar datos del formulario
    navigate('/checkout');
  };

  const handleGoBack = () => {
    // NO limpiar checkout_form_data para preservar datos del formulario
    navigate('/checkout');
  };

  const handleRetry = () => {
    setError(null);
    setBancardData(null);
    setOrderId(null);
    
    if (paymentData) {
      createPaymentOrder(paymentData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Cargando datos de pago...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

            {/* Procesador de pago */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Procesamiento de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isCreatingPayment ? (
                    <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
                      <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Creando orden de pago...</p>
                      </div>
                    </div>
                  ) : bancardData && !error ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">Procesando con Bancard</span>
                        </div>
                        <p className="text-sm text-blue-600">
                          Complete los datos de su tarjeta para finalizar la compra.
                        </p>
                        <p className="text-xs text-blue-500 mt-2">
                          🔒 Sus datos están protegidos con encriptación SSL
                        </p>
                      </div>

                      {/* Container para el formulario de Bancard */}
                      <div 
                        id="bancard-checkout-container"
                        className="w-full min-h-[500px] p-4 border rounded-lg bg-white"
                      >
                        {/* El formulario de Bancard se insertará aquí */}
                      </div>
                      
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          ¿Problemas con el pago?
                        </p>
                        <Button variant="outline" onClick={handleGoBack}>
                          Volver a Datos
                        </Button>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-semibold text-red-800 mb-2">Error en el procesamiento</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={handleRetry} className="bg-primary hover:bg-primary/90">
                          Reintentar
                        </Button>
                        <Button variant="outline" onClick={handleGoBack}>
                          Volver a Datos
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
                      <div className="text-center space-y-4">
                        <CreditCard className="h-16 w-16 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">
                          {error ? 'Error cargando procesador de pagos' : 'Preparando procesador de pagos...'}
                        </p>
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

export default PaymentPage;