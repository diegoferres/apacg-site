import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/stores/store';

interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  cedula: string;
}

interface TicketDetail {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface StudentData {
  name: string;
  cedula: string;
  is_member: boolean;
}

interface CheckoutEventData {
  type: 'event' | 'raffle' | 'course';
  eventId?: number;
  eventSlug?: string;
  eventTitle?: string;
  tickets?: TicketDetail[];
  courseGroupId?: number | null;
  studentData?: StudentData;
  totalAmount: number;
  totalTickets: number;
  referralCode?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useStore((state) => state.user);
  const [eventData, setEventData] = useState<CheckoutEventData | null>(null);
  const [formData, setFormData] = useState<CheckoutData>({
    name: '',
    email: '',
    phone: '',
    cedula: ''
  });
  const [errors, setErrors] = useState<Partial<CheckoutData>>({});
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Precargar datos del usuario autenticado
  useEffect(() => {
    if (user?.member) {
      setFormData({
        name: `${user.member.first_name || ''} ${user.member.last_name || ''}`.trim() || user.name || '',
        email: user.email || '',
        phone: user.member.phone || '',
        cedula: '12345678' // Valor temporal por ahora
      });
    }
  }, [user]);

  useEffect(() => {
    // Verificar si hay error de pago en los parámetros de URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setPaymentError(errorParam);
      // Limpiar el parámetro de error de la URL sin recargar la página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    // Intentar leer datos del localStorage primero
    const savedData = localStorage.getItem('checkout_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setEventData(parsedData);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
      }
    } else {
      // Fallback a URLSearchParams para compatibilidad
      const itemType = searchParams.get('type') as 'event' | 'raffle';
      const itemSlug = searchParams.get('item');
      const itemId = searchParams.get('id'); // Capturar el ID del item
      const itemTitle = searchParams.get('title') || 'Compra';
      const itemTotal = searchParams.get('total') || '0';
      const itemQuantity = searchParams.get('quantity') || '1';
      const itemUnitPrice = searchParams.get('unitPrice') || itemTotal;
      
      if (itemType && itemSlug && itemId) {
        setEventData({
          type: itemType,
          eventId: parseInt(itemId),
          eventSlug: itemSlug,
          eventTitle: itemTitle,
          totalAmount: parseInt(itemTotal),
          totalTickets: parseInt(itemQuantity),
          tickets: [{
            id: 1,
            name: itemType === 'event' ? 'Entrada General' : 'Número de Rifa',
            quantity: parseInt(itemQuantity),
            price: parseInt(itemUnitPrice),
            total: parseInt(itemTotal)
          }]
        });
      } else {
        console.warn('Missing required checkout parameters:', { itemType, itemSlug, itemId });
      }
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof CheckoutData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo no es válido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && eventData) {
      // Preparar datos para la página de pago
      const paymentData = {
        ...eventData,
        customerData: formData
      };
      
      // Guardar datos del pago
      localStorage.setItem('payment_data', JSON.stringify(paymentData));
      
      navigate('/pago');
    }
  };

  const handleGoBack = () => {
    if (eventData?.type === 'event') {
      navigate(`/evento/${eventData.eventSlug}`);
    } else if (eventData?.type === 'raffle') {
      navigate(`/rifa/${eventData.eventSlug}`);
    } else if (eventData?.type === 'course') {
      navigate(`/curso/${eventData.eventSlug}`);
    } else {
      navigate('/');
    }
  };

  if (!eventData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold mb-4">No se encontraron datos de compra</h1>
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
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <Button variant="ghost" onClick={handleGoBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Datos de Compra</CardTitle>
                  <p className="text-muted-foreground">
                    Complete sus datos para continuar con la compra
                  </p>
                </CardHeader>
                
                <CardContent>
                  {/* Mostrar error de pago si existe */}
                  {paymentError && (
                    <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <strong>Error en el pago:</strong> {paymentError}
                      </AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        placeholder="Ingrese su nombre completo"
                      />
                      {errors.name && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.name}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        placeholder="ejemplo@correo.com"
                      />
                      {errors.email && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.email}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange('phone')}
                        placeholder="Ej: 0981123456"
                      />
                      {errors.phone && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.phone}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cedula">Cédula de Identidad *</Label>
                      <Input
                        id="cedula"
                        type="text"
                        value={formData.cedula}
                        onChange={handleInputChange('cedula')}
                        placeholder="Ej: 1234567"
                      />
                      {errors.cedula && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.cedula}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(eventData.totalAmount)}
                        </span>
                      </div>
                      
                      <Button type="submit" className="w-full" size="lg">
                        Continuar al Pago
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
        
            {/* Resumen de compra */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de Compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-lg mb-2">{eventData.eventTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {eventData.type === 'event' && 'Entrada de Evento'}
                      {eventData.type === 'raffle' && 'Números de Rifa'}
                      {eventData.type === 'course' && 'Inscripción al Curso'}
                    </p>
                    {eventData.type === 'course' && eventData.studentData && (
                      <div className="mt-2 text-sm">
                        <p><strong>Estudiante:</strong> {eventData.studentData.name}</p>
                        <p><strong>Cédula:</strong> {eventData.studentData.cedula}</p>
                        <p><strong>Tipo:</strong> {eventData.studentData.is_member ? 'Socio' : 'No Socio'}</p>
                      </div>
                    )}
                  </div>

                  {eventData.type === 'course' ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Detalle de inscripción:</h4>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Inscripción al curso</p>
                          <p className="text-xs text-muted-foreground">
                            {eventData.studentData?.is_member ? 'Tarifa de socio' : 'Tarifa regular'}
                          </p>
                        </div>
                        <span className="font-semibold">
                          {formatPrice(eventData.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ) : eventData.tickets && eventData.tickets.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Detalle de entradas:</h4>
                      {eventData.tickets.map((ticket, index) => (
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
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">
                        {eventData.type === 'course' ? 'Total de inscripciones:' : 'Total de entradas:'}
                      </span>
                      <span className="text-sm font-medium">{eventData.totalTickets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(eventData.totalAmount)}
                      </span>
                    </div>
                  </div>
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

export default Checkout;