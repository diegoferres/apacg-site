import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { GraduationCap, Clock, AlertTriangle, CheckCircle, CreditCard, Users } from "lucide-react";
import api from '@/services/api';
import { useStore } from '@/stores/store';
import { formatPrice } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CourseEnrollment {
  id: string;
  course: {
    id: string;
    title: string;
    commerce: {
      name: string;
    };
  };
  course_group?: {
    name: string;
  };
  enrollment_status: string;
  next_payment_due: string | null;
  payment_status_info: {
    status: string;
    status_description: string;
    badge_class: string;
    days_until_due?: number;
    amounts: {
      monthly_fee: number;
      late_fee: number;
      total_amount: number;
      has_late_fee: boolean;
      days_overdue: number;
    };
  };
}

interface Child {
  id: string;
  ci: string;
  full_name: string;
  course_enrollments?: CourseEnrollment[];
}

// Función utilitaria para calcular estadísticas de pagos
export const calculatePaymentStats = (students: Child[]) => {
  return students.reduce((acc, child) => {
    child.course_enrollments?.forEach(enrollment => {
      if (enrollment.payment_status_info?.status === 'vencido') {
        acc.overdue++;
        acc.totalOverdueAmount += enrollment.payment_status_info.amounts.total_amount;
      } else if (enrollment.payment_status_info?.status === 'proximo_vencer') {
        // Solo contar si está dentro de los 15 días (el backend ya maneja esta lógica)
        acc.upcoming++;
      }
    });
    return acc;
  }, { overdue: 0, upcoming: 0, totalOverdueAmount: 0 });
};

export const ChildrenManager = () => {
  const [students, setStudents] = useState<Child[]>([]);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  const { toast } = useToast();

  // Initial fetch of students with enrollment info
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/client/students?include=course_enrollments');
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


  const getPaymentStatusBadge = (status: string, daysUntilDue?: number) => {
    switch (status) {
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-white hover:text-red-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Vencido
        </Badge>;
      case 'proximo_vencer':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-white hover:text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Vence en {daysUntilDue || 0} días
        </Badge>;
      case 'al_dia':
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-white hover:text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Al día
        </Badge>;
      default:
        return <Badge variant="outline" className="hover:bg-white">Sin configurar</Badge>;
    }
  };

  const handlePayCourse = async (enrollment: CourseEnrollment, child: Child) => {
    try {
      setProcessingPayment(enrollment.id);
      

      // Crear orden usando el endpoint general con datos de mensualidad
      const orderResponse = await api.post('/api/client/sales/create-order', {
        type: 'course_monthly_payment',
        item_id: enrollment.course.id,
        enrollment_id: enrollment.id,
        student_data: {
          name: child.full_name,
          cedula: child.ci,
          is_member: true // Asumiendo que es miembro ya que está inscrito
        },
        customer_data: {
          name: user?.member?.first_name + ' ' + user?.member?.last_name || user?.name,
          email: user?.email,
          phone: user?.member?.phone || '',
          cedula: user?.member?.document_number || ''
        },
        payment_amounts: {
          monthly_fee: enrollment.payment_status_info.amounts.monthly_fee,
          late_fee: enrollment.payment_status_info.amounts.late_fee,
          total_amount: enrollment.payment_status_info.amounts.total_amount,
          has_late_fee: enrollment.payment_status_info.amounts.has_late_fee
        }
      });

      if (orderResponse.data.success) {
        const { checkout_data, order_number } = orderResponse.data.data;
        
        // Preparar datos para la página de pago
        const paymentData = {
          type: 'course_monthly_payment',
          enrollment_id: enrollment.id,
          orderNumber: order_number,
          studentName: child.full_name,
          courseName: enrollment.course.title,
          groupName: enrollment.course_group?.name,
          totalAmount: enrollment.payment_status_info.amounts.total_amount,
          monthlyFee: enrollment.payment_status_info.amounts.monthly_fee,
          lateFee: enrollment.payment_status_info.amounts.late_fee,
          hasLateFee: enrollment.payment_status_info.amounts.has_late_fee,
          customerData: {
            name: user?.member?.first_name + ' ' + user?.member?.last_name || user?.name,
            email: user?.email,
            phone: user?.member?.phone || '',
            cedula: user?.member?.document_number || ''
          }
        };

        // Guardar datos en localStorage y navegar a payment
        localStorage.setItem('payment_data', JSON.stringify({
          ...paymentData,
          checkout_data
        }));
        
        navigate('/pago');
      } else {
        throw new Error(orderResponse.data.message || 'Error creando orden de pago');
      }
    } catch (error) {
      console.error('Error creating course payment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo procesar el pago. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No configurado';
    try {
      return new Date(dateString).toLocaleDateString('es-PY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Calcular estadísticas de pagos
  const paymentStats = calculatePaymentStats(students);

  return (
    <div className="space-y-6">
      {/* Alert de pagos vencidos */}
      {paymentStats.overdue > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atención:</strong> Tienes {paymentStats.overdue} {paymentStats.overdue === 1 ? 'pago vencido' : 'pagos vencidos'} 
            por un total de {formatPrice(paymentStats.totalOverdueAmount)}. 
            Los pagos vencidos pueden incluir multas por mora.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert de pagos próximos a vencer */}
      {paymentStats.upcoming > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Tienes {paymentStats.upcoming} {paymentStats.upcoming === 1 ? 'pago' : 'pagos'} próximo(s) a vencer. 
            Paga a tiempo para evitar multas por mora.
          </AlertDescription>
        </Alert>
      )}


      <div className="space-y-4">
        {students.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay alumnos asociados a tu cuenta
          </div>
        ) : (
          students.map((child) => (
            <Card key={child.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {child.full_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">CI: {child.ci}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {child.course_enrollments && child.course_enrollments.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Inscripciones Activas</h4>
                    {child.course_enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <p className="font-medium">{enrollment.course.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.course.commerce?.name}
                            </p>
                            <div className="flex items-center gap-2">
                              {getPaymentStatusBadge(
                                enrollment.payment_status_info?.status || 'sin_configurar',
                                enrollment.payment_status_info?.days_until_due
                              )}
                            </div>
                            {enrollment.course_group?.name && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {enrollment.course_group.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {enrollment.payment_status_info && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Próximo vencimiento</p>
                                <p className="text-sm font-medium">
                                  {formatDate(enrollment.next_payment_due)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Cuota mensual</p>
                                <p className="text-sm font-medium">
                                  {formatPrice(enrollment.payment_status_info.amounts?.monthly_fee || 0)}
                                </p>
                              </div>
                            </div>

                            {enrollment.payment_status_info.amounts?.has_late_fee && (
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Multa ({enrollment.payment_status_info.amounts.days_overdue} días)</p>
                                  <p className="text-sm font-medium text-destructive">
                                    {formatPrice(enrollment.payment_status_info.amounts.late_fee)}
                                  </p>
                                </div>
                              </div>
                            )}

                            {enrollment.payment_status_info.amounts?.total_amount > enrollment.payment_status_info.amounts?.monthly_fee && (
                              <div className="md:col-span-3 pt-2 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">Total a pagar:</p>
                                  <p className="text-lg font-bold">
                                    {formatPrice(enrollment.payment_status_info.amounts.total_amount)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Botón de pago para estados vencido o próximo a vencer */}
                        {enrollment.payment_status_info && 
                         (enrollment.payment_status_info.status === 'vencido' || 
                          enrollment.payment_status_info.status === 'proximo_vencer') && (
                          <div className="pt-3 mt-3 border-t border-border/50">
                            <Button 
                              className="w-full"
                              variant={enrollment.payment_status_info.status === 'vencido' ? 'destructive' : 'default'}
                              onClick={() => handlePayCourse(enrollment, child)}
                              disabled={processingPayment === enrollment.id}
                            >
                              {processingPayment === enrollment.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Procesando...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pagar Cuota {formatPrice(enrollment.payment_status_info.amounts.total_amount)}
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    No hay inscripciones activas para este alumno
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}

      </div>
    </div>
  );
};
