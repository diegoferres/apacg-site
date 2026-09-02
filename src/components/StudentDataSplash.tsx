import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, Users, AlertCircle, Lock, Eye, EyeOff, Mail, CreditCard, Phone } from "lucide-react";
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
  // El paso inicial del externo se decide acá y no en el efecto: si arranca en
  // 'students' y se corrige despues del pintado, alcanza a verse un frame del
  // cartel "No tienes estudiantes asociados", que para el es justo lo contrario
  // de lo que le queremos decir.
  const [currentStep, setCurrentStep] = useState<'contacto' | 'students' | 'membership' | 'password'>(
    useStore.getState().user?.member_origin === 'external' ? 'contacto' : 'students'
  );
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

  // Socios externos no tienen hijos ni membresia que pagar (estan exonerados): su unica
  // secuencia es contacto -> password, sin pasar por students ni membership.
  const isExternal = user?.member_origin === 'external';
  const yaTeniamosDatos = Boolean(user?.email || user?.member?.phone);

  // El paso del externo se fija una sola vez. No alcanza con el estado inicial porque en
  // una recarga el usuario todavia no esta en el store cuando se pinta la primera vez; y
  // no puede volver a fijarse en cada corrida del efecto porque le pisaria el avance a
  // 'password' apenas apreta Continuar.
  const pasoDeExternoFijado = useRef(false);

  // Lo que ya sabemos del socio se muestra para que lo confirme o lo corrija, en vez de
  // pedirselo en blanco: de varios ya tenemos el correo o el telefono, rescatados de sus
  // compras o de las listas del colegio. Se precarga una sola vez, cuando llega el usuario,
  // para no pisar lo que este escribiendo.
  const datosPrecargados = useRef(false);

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

  useEffect(() => {
    if (!user || datosPrecargados.current) return;
    datosPrecargados.current = true;
    if (user.email) setEmail(user.email);
    if (user.member?.phone) setPhone(user.member.phone);
  }, [user]);

  // Load existing students from user data and determine initial step
  useEffect(() => {
    if (isExternal) {
      if (!pasoDeExternoFijado.current) {
        pasoDeExternoFijado.current = true;
        setCurrentStep('contacto');
      }

      return;
    }

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

  // Paso 'contacto' (solo externos): valida email y telefono y pasa a 'password'.
  // El guardado real se hace junto con la contraseña, en updatePasswordAndEmail.
  const handleContactoContinue = () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    if (!phone || phone.trim() === '') {
      toast({
        title: "Error",
        description: "Por favor ingresa un teléfono",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep('password');
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
        name: user?.name || '',
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        ...(isExternal ? { phone: phone } : {}),
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
            {currentStep === 'contacto' ? (
              <>
                <Phone className="h-6 w-6 text-primary" />
                {yaTeniamosDatos ? 'Confirmá tus datos' : 'Tus datos de contacto'}
              </>
            ) : currentStep === 'students' ? (
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
          {currentStep === 'contacto' ? (
            <>
              <CardHeader className="text-center pb-4">
                <CardDescription className="text-base">
                  {yaTeniamosDatos
                    ? 'Estos son los datos que tenemos tuyos. Revisalos y corregí lo que haga falta: son los que APACG va a usar para contactarte.'
                    : 'Estos son los datos con los que APACG se va a contactar con vos.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contacto-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="contacto-email"
                      type="email"
                      placeholder="Ingresa tu correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contacto-phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </Label>
                    <Input
                      id="contacto-phone"
                      type="tel"
                      placeholder="Ingresa tu teléfono"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleContactoContinue}
                    disabled={isSaving || !email || !email.includes('@') || !phone || phone.trim() === ''}
                    size="lg"
                  >
                    Continuar
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
              </CardContent>
            </>
          ) : currentStep === 'students' ? (
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
                            
                            <div className="space-y-2">
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
                        <span className="text-sm font-medium text-muted-foreground">Estudiantes:</span>
                        <span className="font-medium">{localMembershipStatus.students_count}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Monto total pendiente:</span>
                        <span className="font-semibold text-lg">
                          {(() => {
                            let totalUnpaid = 0;
                            if (localMembershipStatus.student_payment_status) {
                              localMembershipStatus.student_payment_status.forEach((s: any) => {
                                totalUnpaid += (s.unpaid_years?.length || (!s.current_year_paid ? 1 : 0));
                              });
                            } else {
                              totalUnpaid = localMembershipStatus.students_count;
                            }
                            return new Intl.NumberFormat('es-PY', {
                              style: 'currency',
                              currency: 'PYG'
                            }).format(totalUnpaid * 60000);
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Estudiantes pendientes por año */}
                    {localMembershipStatus.student_payment_status &&
                     localMembershipStatus.student_payment_status.some((s: any) => s.unpaid_years?.length > 0 || !s.current_year_paid) && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                          Pagos Pendientes
                        </h4>
                        {localMembershipStatus.student_payment_status.map((student: any) => (
                          <div key={student.student_id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                              <span className="font-medium">{student.student_name}</span>
                            </div>
                            {student.unpaid_years && student.unpaid_years.length > 0 ? (
                              <div className="ml-6 space-y-1">
                                {student.unpaid_years.map((year: number) => (
                                  <div key={year} className="text-sm text-orange-700 flex items-center gap-1">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Pendiente {year}
                                  </div>
                                ))}
                              </div>
                            ) : !student.current_year_paid && (
                              <div className="ml-6 text-sm text-orange-700 flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Pago Pendiente
                              </div>
                            )}
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
                  {isExternal
                    ? 'Elegí una contraseña para entrar de ahora en adelante, en lugar de tu cédula.'
                    : 'Como es tu primera vez en el sistema, necesitas establecer un correo electrónico y una contraseña para poder recuperar tu cuenta fácilmente.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {isExternal ? (
                    // El externo ya dejo su correo en el paso anterior. Volver a pedirselo
                    // aca, ademas con otro nombre, hace dudar de si es el mismo dato.
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Te vamos a escribir a</span>
                      <span className="font-medium break-all">{email}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Correo electrónico
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ingresa tu correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Te permitirá recuperar tu cuenta si olvidas tu contraseña</p>
                    </div>
                  )}

                  <div className="space-y-2">
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

                  <div className="space-y-2">
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
                        if (isExternal) {
                          setCurrentStep('contacto');
                          return;
                        }

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
                  <p>
                    {isExternal
                      ? 'Con tu cédula y esta contraseña vas a entrar de ahora en adelante.'
                      : 'Tu correo electrónico y tu contraseña te permitirán acceder de forma segura y recuperar tu cuenta si es necesario.'}
                  </p>
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