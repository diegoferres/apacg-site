
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CreditCard, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/services/api";
import { formatPrice } from "@/lib/utils";

interface StudentData {
  name: string;
  cedula: string;
  is_member: boolean;
}

interface PaymentData {
  type: 'event' | 'raffle' | 'course';
  eventId?: number;
  eventSlug?: string;
  eventTitle?: string;
  courseGroupId?: number | null;
  studentData?: StudentData;
  totalAmount: number;
  totalTickets: number;
  customerData: {
    name: string;
    email: string;
    phone: string;
    cedula: string;
  };
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Obtener datos del pago desde localStorage
        const savedData = localStorage.getItem('payment_data');
        if (!savedData) {
          setError('No se encontraron datos de pago');
          setIsLoading(false);
          return;
        }

        const data: PaymentData = JSON.parse(savedData);
        setPaymentData(data);

        // Crear orden y obtener URL de Bancard
        const response = await api.post('/api/client/sales/order', {
          type: data.type,
          item_id: data.eventId,
          customer_data: data.customerData,
          ...(data.type === 'course' && {
            course_group_id: data.courseGroupId,
            student_data: data.studentData
          })
        });

        if (response.data.success && response.data.payment_url) {
          setIframeUrl(response.data.payment_url);
        } else {
          setError(response.data.message || 'Error al procesar el pago');
        }
      } catch (error: any) {
        console.error('Error initializing payment:', error);
        setError(error.response?.data?.message || 'Error al inicializar el pago');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, []);

  const handleGoBack = () => {
    if (paymentData?.type === 'course') {
      navigate('/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const getPageTitle = () => {
    if (!paymentData) return 'Pago';
    switch (paymentData.type) {
      case 'event':
        return 'Pago de Entrada';
      case 'raffle':
        return 'Pago de Rifa';
      case 'course':
        return 'Pago de Inscripción';
      default:
        return 'Pago';
    }
  };

  const getPageDescription = () => {
    if (!paymentData) return 'Complete el pago para finalizar su compra';
    switch (paymentData.type) {
      case 'event':
        return 'Complete el pago para confirmar su entrada al evento';
      case 'raffle':
        return 'Complete el pago para confirmar su participación en la rifa';
      case 'course':
        return 'Complete el pago para confirmar su inscripción al curso';
      default:
        return 'Complete el pago para finalizar su compra';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto">
            <Button variant="outline" className="mb-6" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/checkout">Checkout</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" className="mb-6" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Checkout
          </Button>
          
          {/* Payment Summary */}
          {paymentData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{paymentData.eventTitle}</span>
                  </div>
                  {paymentData.type === 'course' && paymentData.studentData && (
                    <div className="text-sm text-muted-foreground">
                      <p>Estudiante: {paymentData.studentData.name}</p>
                      <p>Tipo: {paymentData.studentData.is_member ? 'Socio' : 'No Socio'}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(paymentData.totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                {getPageTitle()}
              </CardTitle>
              <CardDescription>
                {getPageDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-muted-foreground">Cargando pasarela de pago...</p>
                </div>
              ) : iframeUrl ? (
                <div className="bg-gray-50 border rounded-lg overflow-hidden">
                  <iframe 
                    src={iframeUrl}
                    className="w-full min-h-[600px]"
                    title="Pasarela de pago Bancard" 
                    sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation"
                  />
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No se pudo cargar la pasarela de pago. Por favor, intente nuevamente.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentPage;
