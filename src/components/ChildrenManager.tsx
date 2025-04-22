
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

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
  };
  
  return mockStudents[document] ? { fullName: mockStudents[document] } : null;
  
  // Real API call would be something like:
  // const response = await api.get(`/api/students/${document}`);
  // return response.data;
};

export const ChildrenManager = () => {
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
          description: "Alumno agregado correctamente",
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
    <div className="space-y-6">
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
      </div>
    </div>
  );
};
