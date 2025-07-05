import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentConfirmation = () => {
  const { paymentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleConfirmation = () => {
      // Verificar si hay error en los query params (viene del backend)
      const error = searchParams.get('error');
      
      if (error) {
        // Hay error, redireccionar al checkout con mensaje
        const errorMessage = decodeURIComponent(error);
        navigate(`/checkout?error=${encodeURIComponent(errorMessage)}`, { replace: true });
        return;
      }

      // No hay error explícito, verificar si tenemos los parámetros de éxito
      const orderId = searchParams.get('order_id');
      
      if (orderId && paymentId) {
        // Tenemos parámetros de éxito, redireccionar a página de éxito original
        navigate(`/pago-exitoso?order_id=${orderId}&payment_id=${paymentId}`, { replace: true });
        return;
      }

      // Si llegamos aquí, algo salió mal - redireccionar con error genérico
      navigate('/checkout?error=Error verificando el estado del pago', { replace: true });
    };

    // Ejecutar después de un breve delay para evitar problemas de navegación
    const timer = setTimeout(handleConfirmation, 100);
    
    return () => clearTimeout(timer);
  }, [paymentId, searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verificando pago...</h2>
            <p className="text-muted-foreground">
              Estamos confirmando el estado de su pago. Por favor espere.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentConfirmation; 