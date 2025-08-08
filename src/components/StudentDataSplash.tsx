import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, Users, AlertCircle } from "lucide-react";
import api from '@/services/api';
import { useStore } from '@/stores/store';

interface Student {
  id: string;
  ci: string | null;
  full_name: string;
}

interface StudentDataSplashProps {
  isOpen: boolean;
  onDataComplete: () => void;
}

export const StudentDataSplash = ({ isOpen, onDataComplete }: StudentDataSplashProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const logout = useStore((state) => state.logout);

  const { toast } = useToast();

  // Load existing students from user data
  useEffect(() => {
    if (isOpen && user?.member?.students) {
      const userStudents = user.member.students.map(student => ({
        id: student.id,
        ci: student.ci || '',
        full_name: student.full_name
      }));
      setStudents(userStudents);
      console.log('StudentDataSplash - Loaded user students:', userStudents);
    }
  }, [isOpen, user]);

  const updateStudentCI = (studentId: string, newCI: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, ci: newCI }
        : student
    ));
  };

  const saveStudentsData = async () => {
    // Validate all students have CI
    const studentsWithoutCI = students.filter(student => !student.ci || student.ci.trim() === '');
    if (studentsWithoutCI.length > 0) {
      toast({
        title: "Error",
        description: `Debes completar la cédula de: ${studentsWithoutCI.map(s => s.full_name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post('api/client/students', {
        data: students.map((student) => ({
          id: student.id,
          ci: student.ci,
          full_name: student.full_name,
        })),
      });

      console.log('Save response:', response);

      // Update user data with the completed students
      setUser(response.data.data);
      
      toast({
        title: "¡Perfecto!",
        description: "Datos de estudiantes completados correctamente. Ya puedes usar todas las funciones del sistema.",
      });

      // Close the splash and continue
      onDataComplete();
      
    } catch (error) {
      console.error('Error saving students:', error);
      toast({
        title: "Error",
        description: "Hubo un error al guardar los datos",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint (same as Profile.tsx)
      await api.post('/logout');
      
      // Clear frontend state  
      setUser(null);
      logout(); // Also use store's logout method
      localStorage.removeItem('user');
      
      // Close the splash first
      onDataComplete();
      
      // Show success message
      toast({
        title: "Sesión cerrada",
        description: "Ahora puedes continuar navegando como invitado",
      });
      
    } catch (error) {
      console.error('Error en el logout:', error);
      
      // Even if backend call fails, clear frontend state
      setUser(null);
      logout(); // Also use store's logout method  
      localStorage.removeItem('user');
      onDataComplete();
      
      toast({
        title: "Sesión cerrada",
        description: "Ahora puedes continuar navegando como invitado",
      });
    }
  };

  const allStudentsHaveCI = students.every(student => student.ci && student.ci.trim() !== '');
  const studentsWithoutCI = students.filter(student => !student.ci || student.ci.trim() === '');

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            ¡Bienvenido, {user?.name}!
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <CardDescription className="text-base">
              Para acceder a todos los beneficios del sistema APAC, necesitas completar las cédulas de tus hijos estudiantes.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-medium">No tienes estudiantes asociados</p>
                <p className="text-sm">Contacta con la administración para asociar tus hijos</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Completa las cédulas de tus {students.length} hijo{students.length !== 1 ? 's' : ''}:
                  </div>
                  
                  {students.map((student) => (
                    <Card key={student.id} className={`${!student.ci || student.ci.trim() === '' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            {(!student.ci || student.ci.trim() === '') && (
                              <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Cédula requerida
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`ci-${student.id}`}>Cédula de Identidad</Label>
                          <Input
                            id={`ci-${student.id}`}
                            placeholder="Ingresa la cédula"
                            value={student.ci || ''}
                            onChange={(e) => updateStudentCI(student.id, e.target.value)}
                            className={!student.ci || student.ci.trim() === '' ? 'border-red-300' : 'border-green-300'}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={saveStudentsData}
                    disabled={isSaving || !allStudentsHaveCI}
                    size="lg"
                  >
                    {isSaving ? "Guardando..." : `Completar datos (${studentsWithoutCI.length} pendientes)`}
                  </Button>
                  
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      No ahora, continuar como invitado
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              <p>Si no completas este paso ahora, no podrás acceder a beneficios, comercios, rifas, cursos y otras funciones exclusivas para miembros.</p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDataSplash;