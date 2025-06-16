import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import api from '@/services/api';
import { useStore } from '@/stores/store';

interface Child {
  id: string;
  ci: string;
  full_name: string;
}

export const ChildrenManager = () => {
  const [ci, setCi] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState<Child[]>([]);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  const { toast } = useToast();

  // Initial fetch of students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/client/students');
        if (response.data && response.data.data) {
          setStudents(response.data.data);
          console.log('Students loaded:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los alumnos",
          variant: "destructive",
        });
      }
    };

    fetchStudents();
  }, [toast]);

  // Handle student search
  useEffect(() => {
    if (!isSearching) return;

    const searchStudent = async () => {
      if (!ci.trim()) {
        toast({
          title: "Error",
          description: "Por favor ingresa un número de cédula",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }

      try {
        // Check if student is already in the list
        if (students.some(child => child.ci === ci)) {
          toast({
            title: "Error",
            description: "Este alumno ya ha sido agregado",
            variant: "destructive",
          });
          setIsSearching(false);
          return;
        }

        const response = await api.get(`api/client/students/${ci}`);
        
        if (response.data && response.data.data) {
          const newStudent = {
            id: response.data.data.id,
            ci: response.data.data.ci,
            full_name: response.data.data.full_name,
          };
          
          setStudents(prevStudents => [...prevStudents, newStudent]);
          setCi('');
          toast({
            title: "Éxito",
            description: "Alumno encontrado correctamente",
          });
        }
      } catch (error) {
        console.error('Error searching student:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Hubo un error al buscar el alumno",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    };

    searchStudent();
  }, [isSearching, ci, students, toast]);


  const removeChild = (id: string) => {
    setStudents(prevStudents => prevStudents.filter(child => child.id !== id));
    toast({
      title: "Éxito",
      description: "Alumno removido correctamente",
    });
  };

  const saveStudents = async () => {
    setIsSaving(true);
    try {
      const response = await api.post('api/client/students', {
        data: students.map((child) => ({
          id: child.id,
          ci: child.ci,
          full_name: child.full_name,
        })),
      });

      console.log('Save response:', response);

      setUser(response.data.data);
      
      // Update user data properly without replacing the entire store
      // if (user) {
      //   try {
      //     const userResponse = await api.get('api/user');
      //     if (userResponse.data) {
      //       // Preserve existing user structure while updating with new data
      //       setUser(userResponse.data);
      //     }
      //   } catch (error) {
      //     console.error('Error refreshing user data:', error);
      //   }
      // }

      toast({
        title: "Éxito",
        description: "Alumnos guardados correctamente",
      });
    } catch (error) {
      console.error('Error saving students:', error);
      toast({
        title: "Error",
        description: "Hubo un error al guardar los alumnos",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            disabled={isSearching}
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
        {students.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay alumnos asociados a tu cuenta
          </div>
        ) : (
          students.map((child) => (
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
          ))
        )}

        <div className="pt-4">
          <Button 
            className="w-full" 
            onClick={saveStudents}
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
