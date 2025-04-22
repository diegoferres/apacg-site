
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "@/components/ui/use-toast";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    document: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    // TODO: Replace with actual API call
    /* 
    try {
      const response = await api.post('/api/register', formData);
      if (response.data) {
        navigate('/register-children');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Hubo un error al registrarse. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    }
    */

    // For demo purposes:
    localStorage.setItem('userData', JSON.stringify(formData));
    toast({
      title: "Registro exitoso",
      description: "¡Bienvenido! Ahora puedes registrar a tus hijos.",
    });
    navigate('/register-children');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Usuario</CardTitle>
              <CardDescription>
                Complete sus datos para registrarse en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    placeholder="Ingrese su nombre"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    placeholder="Ingrese su apellido"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document">Cédula/RUC</Label>
                  <Input
                    id="document"
                    placeholder="Ingrese su documento"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Registrarse
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
