
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Simulación de API para validar cédula
const mockValidateId = async (id: string) => {
  // Simulamos una llamada a API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulamos datos de respuesta
      const mockData = {
        fullName: `Estudiante ${id}`,
        grade: "3er grado",
        valid: true,
      };
      resolve(mockData);
    }, 500);
  });
};

interface Child {
  id: string;
  fullName: string;
  grade: string;
}

const RegisterChildren = () => {
  const [identification, setIdentification] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está registrado
    const registeredUser = sessionStorage.getItem("registeredUser");
    if (!registeredUser) {
      navigate("/registro");
    }
  }, [navigate]);

  const handleValidateChild = async () => {
    if (!identification) {
      toast({
        title: "Error",
        description: "Por favor ingresa una cédula",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const response = await mockValidateId(identification);
      const childData = response as any;
      setCurrentChild({
        id: identification,
        fullName: childData.fullName,
        grade: childData.grade,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo validar la cédula",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddChild = () => {
    if (currentChild) {
      setChildren([...children, currentChild]);
      setIdentification("");
      setCurrentChild(null);
      toast({
        title: "Éxito",
        description: "Hijo agregado correctamente",
      });
    }
  };

  const handleRemoveChild = (id: string) => {
    setChildren(children.filter(child => child.id !== id));
  };

  const handleFinish = () => {
    // Guardamos los hijos en sessionStorage
    sessionStorage.setItem("registeredChildren", JSON.stringify(children));
    
    toast({
      title: "Registro completado",
      description: "Serás redirigido al perfil",
    });
    
    navigate("/perfil");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <School className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Registro de Hijos</CardTitle>
              <CardDescription className="text-center">
                Agrega los datos de tus hijos estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Cédula del estudiante"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                  />
                  <Button 
                    onClick={handleValidateChild}
                    disabled={isValidating || !identification}
                  >
                    Validar
                  </Button>
                </div>

                {currentChild && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Estudiante encontrado:</h3>
                    <p className="text-sm mb-1">Nombre: {currentChild.fullName}</p>
                    <p className="text-sm mb-3">Grado: {currentChild.grade}</p>
                    <Button 
                      onClick={handleAddChild}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                )}

                {children.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Hijos registrados:</h3>
                    <div className="space-y-2">
                      {children.map((child) => (
                        <div 
                          key={child.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{child.fullName}</p>
                            <p className="text-sm text-muted-foreground">{child.grade}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveChild(child.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleFinish}
                  className="w-full"
                  disabled={children.length === 0}
                >
                  Finalizar registro
                </Button>
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
