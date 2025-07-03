import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemTitle = searchParams.get('title') || 'Compra';
  const itemTotal = searchParams.get('total') || '0';
  const itemType = searchParams.get('type') || '';
  const itemQuantity = searchParams.get('quantity') || '1';
  const itemUnitPrice = searchParams.get('unitPrice') || itemTotal;
  const customerName = searchParams.get('name') || '';
  const customerEmail = searchParams.get('email') || '';
  
  // Mock data based on type
  const getItemDetails = () => {
    if (itemType === 'event') {
      return {
        title: itemTitle,
        type: 'Entrada de Evento',
        details: `${itemQuantity} entrada(s)`,
        unitPrice: itemUnitPrice,
        quantity: parseInt(itemQuantity),
        image: '/corrida_lauf.jpeg'
      };
    } else if (itemType === 'raffle') {
      return {
        title: itemTitle,
        type: 'Números de Rifa',
        details: `${itemQuantity} número(s)`,
        unitPrice: itemUnitPrice,
        quantity: parseInt(itemQuantity),
        image: '/logo.png'
      };
    }
    return null;
  };
  
  const itemDetails = getItemDetails();

  useEffect(() => {
    // Simular carga del iframe de pago
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePaymentSuccess = () => {
    // Simular pago exitoso
    navigate('/pago-exitoso?title=' + encodeURIComponent(itemTitle));
  };

  const handlePaymentError = () => {
    // Simular error de pago
    setError('Hubo un problema procesando el pago. Por favor, verifique sus datos e intente nuevamente.');
  };

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
                      <p className="text-muted-foreground">{customerName}</p>
                      <p className="text-muted-foreground">{customerEmail}</p>
                    </div>
                  </div>
                  
                  {itemDetails && (
                    <>
                      <div className="pt-3 border-t">
                        <div className="flex gap-3">
                          <img 
                            src={itemDetails.image} 
                            alt={itemDetails.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{itemDetails.title}</h3>
                            <p className="text-xs text-muted-foreground">{itemDetails.type}</p>
                            <p className="text-xs text-muted-foreground">{itemDetails.details}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Precio unitario:</span>
                          <span>₲ {parseInt(itemDetails.unitPrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cantidad:</span>
                          <span>{itemDetails.quantity}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">₲ {parseInt(itemTotal).toLocaleString()}</span>
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
                            Aquí se mostraría el formulario de la procesadora de pagos
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