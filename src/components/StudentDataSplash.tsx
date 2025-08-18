import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, Users, AlertCircle, Lock, Eye, EyeOff, Mail, CreditCard } from "lucide-react";
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
  membershipStatus?: any;
  onRefreshMembershipStatus?: () => Promise<any>;
}

export const StudentDataSplash = ({ isOpen, onDataComplete, membershipStatus, onRefreshMembershipStatus }: StudentDataSplashProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStep, setCurrentStep] = useState<'students' | 'membership' | 'password'>('students');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localMembershipStatus, setLocalMembershipStatus] = useState(membershipStatus);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const { toast } = useToast();

  // Navigate to Profile with membership tab
  const handleGoToPayment = () => {
    // Navigate to profile using React Router
    // DON'T call onDataComplete() - let the splash hide/show based on route
    navigate('/perfil?tab=membership');
  };

  // Skip membership step and continue to password setup (if needed)
  const handleSkipMembership = () => {
    const setupCompleted = user?.setup_completed || false;
    if (setupCompleted) {
      // If setup is already complete, just close
      onDataComplete();
    } else {
      // Move to password step for first-time setup
      setCurrentStep('password');
    }
  };

  // Sync membership status with props
  useEffect(() => {
    setLocalMembershipStatus(membershipStatus);
  }, [membershipStatus]);

  // Load existing students from user data and determine initial step
  useEffect(() => {
    if (isOpen && user?.member?.students) {
      const userStudents = user.member.students.map(student => ({
        id: student.id,
        ci: student.ci || '',
        full_name: student.full_name
      }));
      setStudents(userStudents);
      console.log('StudentDataSplash - Loaded user students:', userStudents);
      
      // Determine initial step based on user setup status, student data, and membership status
      const allStudentsHaveCI = userStudents.every(student => student.ci && student.ci.trim() !== '');
      const hasStudentsCompleted = userStudents.length > 0 && allStudentsHaveCI;
      const setupCompleted = user.setup_completed || false;
      const membershipActive = localMembershipStatus?.is_active_member || false;
      
      console.log('StudentDataSplash - Step determination:', {
        hasStudentsCompleted,
        membershipActive,
        setupCompleted,
        localMembershipStatus
      });
      
      // Step priority:
      // 1. Students data (if incomplete) 
      // 2. Membership payment (if students complete but membership inactive)
      // 3. Password setup (if students complete, membership active, but setup incomplete)
      if (!hasStudentsCompleted) {
        setCurrentStep('students');
      } else if (hasStudentsCompleted && !membershipActive && localMembershipStatus) {
        setCurrentStep('membership');
      } else if (hasStudentsCompleted && (membershipActive || !localMembershipStatus) && !setupCompleted) {
        setCurrentStep('password');
      } else {
        // Fallback to students step
        setCurrentStep('students');
      }
    }
  }, [isOpen, user, localMembershipStatus]);

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
        description: "Datos de estudiantes completados correctamente.",
      });

      // Determine next step after saving students data
      // First, refresh membership status to check if payment is needed
      if (onRefreshMembershipStatus) {
        const updatedMembershipStatus = await onRefreshMembershipStatus();
        setLocalMembershipStatus(updatedMembershipStatus);
        
        // If membership is inactive, go to membership step
        if (updatedMembershipStatus && !updatedMembershipStatus.is_active_member) {
          setCurrentStep('membership');
          return;
        }
      }
      
      // If membership is active (or we couldn't check), check setup
      const setupCompleted = user?.setup_completed || false;
      if (setupCompleted) {
        // If setup is already complete, just close
        onDataComplete();
      } else {
        // Move to password step for first-time setup
        setCurrentStep('password');
      }
      
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

  const updatePasswordAndEmail = async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post('api/client/profile/update-credentials', {
        email: email,
        password: password,
        password_confirmation: confirmPassword,
      });

      // Update user data in store to reflect setup completion
      if (user) {
        const updatedUser = {
          ...user,
          email: email,
          setup_completed: true
        };
        setUser(updatedUser);
      }

      toast({
        title: "¡Perfecto!",
        description: "Email y contraseña actualizados correctamente. Ya puedes usar todas las funciones del sistema.",
      });

      // Close the splash and continue
      onDataComplete();
      
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast({
        title: "Error",
        description: "Hubo un error al actualizar los datos",
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
  const canProceedToPassword = allStudentsHaveCI && students.length > 0;

  // Don't show splash when user is on profile page (they're trying to pay)
  const shouldShowSplash = isOpen && location.pathname !== '/perfil';

  return (
    <Dialog open={shouldShowSplash} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            {currentStep === 'students' ? (
              <>
                <Users className="h-6 w-6 text-primary" />
                ¡Bienvenido, {user?.name}!
              </>
            ) : currentStep === 'membership' ? (
              <>
                <CreditCard className="h-6 w-6 text-primary" />
                Membresía Requerida
              </>
            ) : (
              <>
                <Lock className="h-6 w-6 text-primary" />
                Establece tu contraseña
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          {currentStep === 'students' ? (
            <>
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
            </>
          ) : currentStep === 'membership' ? (
            <>
              <CardHeader className="text-center pb-4">
                <CardDescription className="text-base">
                  Para acceder a todos los beneficios del sistema APAC, debes mantener tu membresía al día.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {localMembershipStatus ? (
                  <div className="space-y-4">
                    {/* Estado de membresía */}
                    <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                        <div>
                          <h3 className="font-medium text-orange-800">
                            Membresía Inactiva
                          </h3>
                          <p className="text-sm text-orange-700">
                            {localMembershipStatus.reason}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Información de pago */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Año actual:</span>
                        <span className="font-medium">{localMembershipStatus.current_year}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Estudiantes:</span>
                        <span className="font-medium">{localMembershipStatus.students_count}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Monto a pagar:</span>
                        <span className="font-semibold text-lg">
                          {(() => {
                            const unpaidCount = localMembershipStatus.student_payment_status
                              ? localMembershipStatus.student_payment_status.filter(s => !s.current_year_paid).length
                              : localMembershipStatus.students_count;
                            return new Intl.NumberFormat('es-PY', {
                              style: 'currency',
                              currency: 'PYG'
                            }).format(unpaidCount * 60000);
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Estudiantes pendientes */}
                    {localMembershipStatus.student_payment_status && 
                     localMembershipStatus.student_payment_status.filter(s => !s.current_year_paid).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                          Estudiantes Pendientes de Pago {localMembershipStatus.current_year}
                        </h4>
                        {localMembershipStatus.student_payment_status
                          .filter(student => !student.current_year_paid)
                          .map((student) => (
                          <div key={student.student_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                              <span className="font-medium">{student.student_name}</span>
                            </div>
                            <div className="text-sm text-orange-700 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              Pago Pendiente
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 space-y-3">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90" 
                        onClick={handleGoToPayment}
                        size="lg"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Ir a Pagar Membresía
                      </Button>
                      
                      <div className="text-center space-y-2">
                        {!user?.setup_completed && (
                          <Button
                            variant="outline"
                            onClick={handleSkipMembership}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Completar configuración primero
                          </Button>
                        )}
                        
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium">No se pudo cargar el estado de membresía</p>
                    <p className="text-sm">Por favor, intenta nuevamente más tarde</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  <p>Sin una membresía activa no podrás acceder a beneficios, comercios, rifas, cursos y otras funciones exclusivas.</p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-4">
                <CardDescription className="text-base">
                  Como es tu primera vez en el sistema, necesitas establecer un email y contraseña para poder recuperar tu cuenta fácilmente.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email de Recuperación
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ingresa tu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Te permitirá recuperar tu cuenta si olvidas tu contraseña</p>
                  </div>

                  <div>
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mínimo 6 caracteres</p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={updatePasswordAndEmail}
                    disabled={isSaving || !email || !email.includes('@') || !password || password.length < 6 || password !== confirmPassword}
                    size="lg"
                  >
                    {isSaving ? "Actualizando..." : "Completar Configuración"}
                  </Button>
                  
                  <div className="text-center space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        // Determine the previous step based on current conditions
                        const allStudentsHaveCI = students.every(student => student.ci && student.ci.trim() !== '');
                        const membershipActive = localMembershipStatus?.is_active_member || false;
                        
                        if (allStudentsHaveCI && !membershipActive && localMembershipStatus) {
                          // If students are complete but membership is inactive, go back to membership
                          setCurrentStep('membership');
                        } else {
                          // Otherwise go back to students
                          setCurrentStep('students');
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      disabled={isSaving}
                    >
                      Volver atrás
                    </Button>
                    
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-muted-foreground hover:text-foreground"
                        disabled={isSaving}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        No ahora, continuar como invitado
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  <p>Tu email y contraseña te permitirán acceder de forma segura y recuperar tu cuenta si es necesario.</p>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDataSplash;