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

interface StudentData {
  name: string;
  cedula: string;
  is_member: boolean;
}

interface CourseGroupData {
  id: number;
  name: string;
  schedule: string;
  location?: string;
}

interface CourseData {
  title: string;
  location?: string;
  commerce: string;
  requires_enrollment_fee: boolean;
}

interface PaymentData {
  type: 'event' | 'raffle' | 'course' | 'course_monthly_payment';
  eventId?: number;
  eventSlug?: string;
  eventTitle?: string;
  tickets?: TicketDetail[];
  courseGroupId?: number | null;
  courseGroupData?: CourseGroupData | null;
  studentData?: StudentData;
  totalAmount: number;
  totalTickets: number;
  customerData: CustomerData;
  referralCode?: string;
  enrollmentFee?: number;
  monthlyFee?: number;
  courseData?: CourseData;
  // Campos específicos para mensualidades
  enrollment_id?: number;
  studentName?: string;
  courseName?: string;
  groupName?: string;
  lateFee?: number;
  hasLateFee?: boolean;
  orderNumber?: string;
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
    
    // Cleanup function para limpiar el script de Bancard cuando el componente se desmonte
    return () => {
      const existingScript = document.getElementById('bancard-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [searchParams]);

  const loadPaymentData = () => {
    // Intentar leer datos del localStorage
    const savedData = localStorage.getItem('payment_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        
        setPaymentData(parsedData);
        setIsLoading(false);
        
        // Si ya tiene checkout_data (como en membresía), usar directamente
        if (parsedData.checkout_data) {
          setBancardData(parsedData.checkout_data);
          loadBancardScript(parsedData.checkout_data);
        } else {
          // Crear automáticamente la orden de pago para otros tipos
          createPaymentOrder(parsedData);
        }
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
      } else if (data.type === 'course') {
        // Para cursos, enviar datos del estudiante y grupo
        requestData.student_data = data.studentData;
        requestData.course_group_id = data.courseGroupId;
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
    // Limpiar cualquier instancia previa de Bancard
    const existingScript = document.getElementById('bancard-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Crear y cargar el script de Bancard
    const script = document.createElement('script');
    script.id = 'bancard-script';
    script.src = checkoutData.script_url;
    script.onload = () => {
      // Dar tiempo para que el DOM se actualice antes de inicializar
      setTimeout(() => {
        initializeBancardCheckout(checkoutData);
      }, 100);
    };
    script.onerror = () => {
      setError('Error al cargar el procesador de pagos. Verifique su conexión.');
    };
    
    document.head.appendChild(script);
  };

  const initializeBancardCheckout = (checkoutData: BancardData) => {
    try {
      // Verificar que el contenedor existe
      const container = document.getElementById('bancard-checkout-container');
      if (!container) {
        console.error('Bancard container not found in DOM');
        setError('Error: Contenedor de pago no encontrado. Intente recargar la página.');
        return;
      }

      // @ts-ignore - Bancard script global
      if (window.Bancard && window.Bancard.Checkout) {
        // Limpiar contenedor antes de inicializar
        container.innerHTML = '';

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
        console.error('Bancard object not available:', window.Bancard);
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
    // Determinar a dónde volver según el tipo de pago
    if (paymentData?.type === 'membership') {
      // Para pagos de membresía, volver al perfil
      navigate('/perfil');
    } else {
      // Para otros tipos (eventos, rifas, cursos), volver al checkout
      // NO limpiar checkout_form_data para preservar datos del formulario
      navigate('/checkout');
    }
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
            {paymentData?.type === 'membership' ? 'Volver al Perfil' : 'Volver a Datos'}
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Resumen de compra */}
            <div className="lg:col-span-1 lg:order-2 order-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Datos del comprador */}
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Comprador:</span>
                      <p className="text-muted-foreground">{paymentData.customerData.name}</p>
                      <p className="text-muted-foreground">{paymentData.customerData.email}</p>
                      <p className="text-muted-foreground">{paymentData.customerData.phone}</p>
                      <p className="text-muted-foreground">C.I. {paymentData.customerData.cedula}</p>
                    </div>
                  </div>
                  
                  {/* Información del item */}
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {paymentData.type === 'membership' ? 'Pago de Membresía' : 
                       paymentData.type === 'course_monthly_payment' ? 'Pago de Mensualidad' :
                       paymentData.eventTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {paymentData.type === 'event' && 'Entrada de Evento'}
                      {paymentData.type === 'raffle' && 'Números de Rifa'}
                      {paymentData.type === 'course' && 'Inscripción al Curso'}
                      {paymentData.type === 'course_monthly_payment' && paymentData.courseName}
                      {paymentData.type === 'membership' && 'Anualidades de Estudiantes'}
                    </p>
                    {paymentData.type === 'course' && (
                      <div className="mt-2 text-sm space-y-2">
                        {paymentData.courseGroupData && (
                          <div className="bg-muted/30 p-2 rounded-md">
                            <p><strong>Grupo:</strong> {paymentData.courseGroupData.name}</p>
                            <p><strong>Horario:</strong> {paymentData.courseGroupData.schedule}</p>
                            {paymentData.courseGroupData.location && (
                              <p><strong>Ubicación:</strong> {paymentData.courseGroupData.location}</p>
                            )}
                          </div>
                        )}
                        {paymentData.studentData && (
                          <div>
                            <p><strong>Estudiante:</strong> {paymentData.studentData.name}</p>
                            <p><strong>Cédula:</strong> {paymentData.studentData.cedula}</p>
                            <p><strong>Tipo:</strong> {paymentData.studentData.is_member ? 'Socio' : 'No Socio'}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {paymentData.type === 'course_monthly_payment' && (
                      <div className="mt-2 text-sm space-y-2">
                        <div className="bg-muted/30 p-2 rounded-md">
                          <p><strong>Estudiante:</strong> {paymentData.studentName}</p>
                          {paymentData.groupName && (
                            <p><strong>Grupo:</strong> {paymentData.groupName}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {paymentData.type === 'membership' && paymentData.unpaidStudents && (
                      <div className="mt-2 text-sm space-y-2">
                        <p><strong>Estudiantes a pagar ({paymentData.studentCount}):</strong></p>
                        <div className="bg-muted/30 p-2 rounded-md space-y-1">
                          {paymentData.unpaidStudents.map((student, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              <span>{student.student_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detalle de la compra */}
                  {paymentData.type === 'membership' ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Detalle de pago:</h4>
                      {paymentData.unpaidStudents?.map((student, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{student.student_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Anualidad {paymentData.membershipStatus?.current_year || new Date().getFullYear()}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {formatPrice(paymentData.totalAmount / paymentData.studentCount)}
                          </span>
                        </div>
                      ))}
                      <div className="text-xs text-muted-foreground italic">
                        * Pago de anualidad por estudiante para el año {paymentData.membershipStatus?.current_year || new Date().getFullYear()}
                      </div>
                    </div>
                  ) : paymentData.type === 'course_monthly_payment' ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Detalle de mensualidad:</h4>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Mensualidad del curso</p>
                          <p className="text-xs text-muted-foreground">
                            {paymentData.courseName}
                          </p>
                        </div>
                        <span className="font-semibold">
                          {formatPrice(paymentData.monthlyFee || 0)}
                        </span>
                      </div>
                      {paymentData.hasLateFee && paymentData.lateFee && paymentData.lateFee > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-red-600">Multa por atraso</p>
                            <p className="text-xs text-muted-foreground">
                              Recargo por pago tardío
                            </p>
                          </div>
                          <span className="font-semibold text-red-600">
                            {formatPrice(paymentData.lateFee)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : paymentData.type === 'course' ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Detalle de inscripción:</h4>
                      {paymentData.enrollmentFee && paymentData.enrollmentFee > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Matrícula</p>
                            <p className="text-xs text-muted-foreground">
                              {paymentData.studentData?.is_member ? 'Tarifa de socio' : 'Tarifa regular'}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {formatPrice(paymentData.enrollmentFee)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Primera mensualidad</p>
                          <p className="text-xs text-muted-foreground">
                            {paymentData.studentData?.is_member ? 'Tarifa de socio' : 'Tarifa regular'}
                          </p>
                        </div>
                        <span className="font-semibold">
                          {formatPrice(paymentData.monthlyFee || 0)}
                        </span>
                      </div>
                      {paymentData.enrollmentFee && paymentData.enrollmentFee > 0 && (
                        <div className="text-xs text-muted-foreground italic">
                          * La matrícula se paga una sola vez al momento de la inscripción
                        </div>
                      )}
                    </div>
                  ) : paymentData.tickets && paymentData.tickets.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Detalle de entradas:</h4>
                      {paymentData.tickets.map((ticket, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{ticket.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ticket.quantity} × {formatPrice(ticket.price)}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {formatPrice(ticket.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    {(paymentData.type === 'membership' || paymentData.type === 'course' || paymentData.type === 'event' || paymentData.type === 'raffle') && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">
                          {paymentData.type === 'membership' ? 'Total de estudiantes:' : 
                           paymentData.type === 'course' ? 'Total de inscripciones:' : 
                           'Total de entradas:'}
                        </span>
                        <span className="text-sm font-medium">
                          {paymentData.type === 'membership' ? paymentData.studentCount : paymentData.totalTickets}
                        </span>
                      </div>
                    )}
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
            <div className="lg:col-span-2 lg:order-1 order-2">
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
                        className="w-full min-h-[600px] border rounded-lg bg-white"
                        style={{ padding: '0' }}
                      >
                        {/* El formulario de Bancard se insertará aquí */}
                      </div>
                      
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          ¿Problemas con el pago?
                        </p>
                        <Button variant="outline" onClick={handleGoBack}>
                          {paymentData?.type === 'membership' ? 'Volver al Perfil' : 'Volver a Datos'}
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
                          {paymentData?.type === 'membership' ? 'Volver al Perfil' : 'Volver a Datos'}
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