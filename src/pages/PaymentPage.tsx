
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate iframe loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

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
              <BreadcrumbLink href="/perfil">Perfil</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pago de Membresía</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            className="mb-6" 
            onClick={() => navigate('/perfil')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Perfil
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Pago de Membresía
              </CardTitle>
              <CardDescription>
                Complete el formulario para renovar su membresía
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-muted-foreground">Cargando pasarela de pago...</p>
                </div>
              ) : (
                <div className="bg-gray-50 border rounded-lg overflow-hidden">
                  {/* This would be the real payment processor iframe in production */}
                  <iframe 
                    src="about:blank" 
                    className="w-full min-h-[500px]"
                    title="Pasarela de pago" 
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  >
                    {/* For demo purposes, we're showing a mocked payment form instead of a real iframe */}
                    <div className="p-8 max-w-md mx-auto">
                      <h2 className="text-xl font-bold mb-6">Formulario de Pago</h2>
                      <form className="space-y-4">
                        <div>
                          <label className="block mb-1">Número de tarjeta</label>
                          <input type="text" className="w-full border p-2 rounded" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1">Fecha expiración</label>
                            <input type="text" className="w-full border p-2 rounded" placeholder="MM/AA" />
                          </div>
                          <div>
                            <label className="block mb-1">CVC</label>
                            <input type="text" className="w-full border p-2 rounded" placeholder="123" />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1">Nombre del titular</label>
                          <input type="text" className="w-full border p-2 rounded" placeholder="Nombre como aparece en la tarjeta" />
                        </div>
                        <button className="w-full bg-primary text-white p-2 rounded font-medium">
                          Pagar 150.000 Gs.
                        </button>
                      </form>
                    </div>
                  </iframe>
                  
                  {/* Since real iframes might not show in this preview, we'll show a mocked payment form */}
                  <div className="p-8 border-t">
                    <div className="max-w-md mx-auto">
                      <h2 className="text-xl font-bold mb-6">Formulario de Pago</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium">Número de tarjeta</label>
                          <input type="text" className="w-full border p-2 rounded" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm font-medium">Fecha expiración</label>
                            <input type="text" className="w-full border p-2 rounded" placeholder="MM/AA" />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium">CVC</label>
                            <input type="text" className="w-full border p-2 rounded" placeholder="123" />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium">Nombre del titular</label>
                          <input type="text" className="w-full border p-2 rounded" placeholder="Nombre como aparece en la tarjeta" />
                        </div>
                        <Button className="w-full">
                          Pagar 150.000 Gs.
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
