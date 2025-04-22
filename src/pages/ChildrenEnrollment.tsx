
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface Child {
  id: string;
  document: string;
  fullName: string;
}

// Mock API call - Replace with actual API call later
const mockSearchChild = async (document: string): Promise<{ fullName: string } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock database of students
  const mockStudents = {
    '1234567': 'Juan Pérez',
    '2345678': 'María González',
    '3456789': 'Carlos Rodríguez',
    '4567890': 'Ana Silva',
    '5678901': 'Luis Torres',
  };
  
  return mockStudents[document] ? { fullName: mockStudents[document] } : null;
};

const ChildrenEnrollment = () => {
  const [document, setDocument] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const { toast } = useToast();

  const searchChild = async () => {
    if (!document.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de cédula",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await mockSearchChild(document);
      
      if (result) {
        // Check if child is already added
        if (children.some(child => child.document === document)) {
          toast({
            title: "Error",
            description: "Este alumno ya ha sido agregado",
            variant: "destructive",
          });
          return;
        }

        setChildren([...children, {
          id: crypto.randomUUID(),
          document,
          fullName: result.fullName,
        }]);
        setDocument('');
        toast({
          title: "Éxito",
          description: "Alumno encontrado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: "No se encontró ningún alumno con ese número de cédula",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al buscar el alumno",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const removeChild = (id: string) => {
    setChildren(children.filter(child => child.id !== id));
    toast({
      title: "Éxito",
      description: "Alumno removido correctamente",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inscripción de Alumnos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Inscripción de Alumnos</CardTitle>
              <CardDescription>
                Ingresa la cédula del alumno para verificar y añadirlo a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-grow">
                  <Label htmlFor="document">Cédula del Alumno</Label>
                  <Input
                    id="document"
                    placeholder="Ingrese la cédula"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={searchChild} 
                    disabled={isSearching}
                  >
                    {isSearching ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {children.map((child) => (
                  <Card key={child.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{child.fullName}</p>
                        <p className="text-sm text-muted-foreground">CI: {child.document}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChild(child.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {children.length > 0 && (
                  <div className="pt-4">
                    <Button className="w-full" asChild>
                      <a href="/perfil">
                        Finalizar Inscripción
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChildrenEnrollment;
