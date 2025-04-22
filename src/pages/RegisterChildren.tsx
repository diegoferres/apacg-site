
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Child {
  id: string;
  document: string;
  fullName: string;
}

// Simulated API call to verify child
const verifyChild = async (document: string): Promise<{ fullName: string } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulated database of children
  const mockDatabase = {
    '1234567': 'Juan Pérez',
    '2345678': 'María García',
    '3456789': 'Carlos López',
  };
  
  return document in mockDatabase ? { fullName: mockDatabase[document] } : null;
};

const RegisterChildren = () => {
  const navigate = useNavigate();
  const [document, setDocument] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [verifying, setVerifying] = useState(false);
  
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/register');
    }
  }, [navigate]);

  const handleVerifyChild = async () => {
    if (!document.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un número de documento",
        variant: "destructive"
      });
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyChild(document);
      
      if (result) {
        const newChild = {
          id: crypto.randomUUID(),
          document,
          fullName: result.fullName
        };
        
        setChildren(prev => [...prev, newChild]);
        setDocument('');
        toast({
          title: "Éxito",
          description: `Se ha agregado a ${result.fullName} a la lista`,
        });
      } else {
        toast({
          title: "No encontrado",
          description: "No se encontró un estudiante con ese documento",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al verificar el documento",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const removeChild = (id: string) => {
    setChildren(prev => prev.filter(child => child.id !== id));
  };

  const handleFinish = () => {
    // Simulate API call
    // TODO: Replace with actual API call
    /*
    try {
      await api.post('/api/register-children', { children });
      navigate('/profile');
    } catch (error) {
      console.error('Error registering children:', error);
    }
    */
    
    // For demo purposes:
    localStorage.setItem('userChildren', JSON.stringify(children));
    toast({
      title: "Registro completado",
      description: "Los datos han sido guardados exitosamente",
    });
    navigate('/profile');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Hijos</CardTitle>
              <CardDescription>
                Agregue los datos de sus hijos que asisten al colegio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="document">Cédula del Hijo/a</Label>
                    <Input
                      id="document"
                      placeholder="Ingrese el número de documento"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleVerifyChild} 
                      disabled={verifying}
                    >
                      Verificar y Agregar
                    </Button>
                  </div>
                </div>

                {children.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Hijos Registrados</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Documento</TableHead>
                          <TableHead>Nombre Completo</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {children.map((child) => (
                          <TableRow key={child.id}>
                            <TableCell>{child.document}</TableCell>
                            <TableCell>{child.fullName}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChild(child.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleFinish}
                    disabled={children.length === 0}
                  >
                    Finalizar Registro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegisterChildren;
