import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Mail, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemTitle = searchParams.get('title') || 'su compra';

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl md:text-3xl text-green-600 dark:text-green-400">
                ¡Pago Exitoso!
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Su compra de <strong>{itemTitle}</strong> ha sido procesada correctamente
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
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