
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import api from '@/services/api';
import { set } from 'date-fns';

interface Child {
  id: string;
  ci: string;
  full_name: string;
}

// Mock API call - Replace with actual API call later
// const mockSearchChild = async (document: string): Promise<{ fullName: string } | null> => {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 1000));
  
//   // Mock database of students
//   const mockStudents = {
//     '1234567': 'Juan Pérez',
//     '2345678': 'María González',
//     '3456789': 'Carlos Rodríguez',
//   };
  
//   return mockStudents[document] ? { fullName: mockStudents[document] } : null;
  
//   // Real API call would be something like:
//   // const response = await api.get(`/api/students/${document}`);
//   // return response.data;
// };



export const ChildrenManager = () => {
  const [ci, setCi] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [students, setStudents] = useState<Child[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/client/students');
  
        setStudents(response.data.data);

        console.log('response.data.data');
        console.log(response.data.data);


      } catch (error) {
        console.error('Error fetching students:', error);
      }
    }

    fetchStudents();
  }, []);

    useEffect(() => {
      if (isSearching) {
        const fetchStudents = async () => {
          try {
            const response = await api.get(`api/client/students/${ci}`);
  
            if(students.some(child => child.ci === ci)) {
              toast({
                title: "Error",
                description: "Este alumno ya ha sido agregado",
                variant: "destructive",
              });
              return;
            }
  
            console.log(response.data.data);
  
            setStudents([...students, {
              id: response.data.data.id,
              ci: response.data.data.ci,
              full_name: response.data.data.full_name,
            }
            ]);
            setCi('');
            setIsSearching(false);
            toast({
              title: "Éxito",
              description: "Alumno encontrado correctamente",
            });  
          } catch (error) {
            setIsSearching(false);
            toast({
              title: "Error",
              description: error.response?.data?.message || "Hubo un error al buscar el alumno",
              variant: "destructive",
            }); 
          }
        }
  
        fetchStudents();
      }
  
      // fetchStudents();
    }, [isSearching]);

  // const searchChild = async () => {
  //   if (!document.trim()) {
  //     toast({
  //       title: "Error",
  //       description: "Por favor ingresa un número de cédula",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setIsSearching(true);
  //   try {
  //     const result = await mockSearchChild(document);
      
  //     if (result) {
  //       // Check if child is already added
  //       if (children.some(child => child.document === document)) {
  //         toast({
  //           title: "Error",
  //           description: "Este alumno ya ha sido agregado",
  //           variant: "destructive",
  //         });
  //         return;
  //       }

  //       setChildren([...children, {
  //         id: crypto.randomUUID(),
  //         document,
  //         fullName: result.fullName,
  //       }]);
  //       setDocument('');
  //       toast({
  //         title: "Éxito",
  //         description: "Alumno agregado correctamente",
  //       });
  //     } else {
  //       toast({
  //         title: "Error",
  //         description: "No se encontró ningún alumno con ese número de cédula",
  //         variant: "destructive",
  //       });
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Hubo un error al buscar el alumno",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };

  const removeChild = (id: string) => {
    setStudents(students.filter(child => child.id !== id));
    toast({
      title: "Éxito",
      description: "Alumno removido correctamente",
    });
  };

   const saveStudents = async () => {
      try {
        const response = await api.post('api/client/students', {
          data: students.map((child) => ({
            id: child.id,
            ci: child.ci,
            full_name: child.full_name,
          })),
        });
  
        console.log('response', response);
  
        toast({
          title: "Éxito",
          description: "Alumnos guardados correctamente",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un error al guardar los alumnos",
          variant: "destructive",
        });
      }
    } 

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-grow">
          <Label htmlFor="document">Cédula del Alumno</Label>
          <Input
            id="document"
            placeholder="Ingrese la cédula"
            value={ci}
            onChange={(e) => setCi(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button 
            onClick={() => setIsSearching(true)} 
            disabled={isSearching}
          >
            {isSearching ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {students.map((child) => (
          <Card key={child.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{child.full_name}</p>
                <p className="text-sm text-muted-foreground">CI: {child.ci}</p>
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

        {students.length > 0 && (
          <div className="pt-4">
            <Button className="w-full" onClick={saveStudents}> 
                Finalizar Inscripción
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
