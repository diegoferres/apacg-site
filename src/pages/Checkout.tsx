import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  cedula: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<CheckoutData>({
    name: '',
    email: '',
    phone: '',
    cedula: ''
  });
  const [errors, setErrors] = useState<Partial<CheckoutData>>({});

  const itemType = searchParams.get('type'); // 'event' or 'raffle'
  const itemSlug = searchParams.get('item');
  const itemTitle = searchParams.get('title') || 'Compra';
  const itemTotal = searchParams.get('total') || '0';

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
    
    if (validateForm()) {
      // Navegar a la página de pago con los datos
      const paymentParams = new URLSearchParams({
        type: itemType || '',
        item: itemSlug || '',
        title: itemTitle,
        total: itemTotal,
        ...formData
      });
      
      navigate(`/pago?${paymentParams.toString()}`);
    }
  };

  const handleGoBack = () => {
    if (itemType === 'event') {
      navigate(`/evento/${itemSlug}`);
    } else if (itemType === 'raffle') {
      navigate(`/rifa/${itemSlug}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <Button variant="ghost" onClick={handleGoBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Datos de Compra</CardTitle>
              <p className="text-muted-foreground">
                Complete sus datos para continuar con la compra de: <strong>{itemTitle}</strong>
              </p>
            </CardHeader>
            
            <CardContent>
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
                    <span className="text-2xl font-bold text-primary">₲ {itemTotal}</span>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    Continuar al Pago
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;