import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, formatDate } from '@/lib/utils';
import { Clock, Users, Calendar, MapPin } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  slug?: string;
  commerce?: { name: string };
  formatted_duration: string;
  start_date_format: string;
  end_date_format: string;
  monthly_fee_member: number;
  monthly_fee_non_member: number;
  enrollment_fee_member: number;
  enrollment_fee_non_member: number;
  requires_enrollment_fee: boolean;
  location?: string;
}

interface Group {
  id: number;
  name: string;
  schedule: string;
  capacity: number;
  confirmed_enrollments_count: number;
  enrollment_fee_member?: number;
  enrollment_fee_non_member?: number;
  monthly_fee_member?: number;
  monthly_fee_non_member?: number;
  description?: string;
  location?: string;
}

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  group: Group | null;
}

const CourseEnrollmentModal = ({ isOpen, onClose, course, group }: CourseEnrollmentModalProps) => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isMember, setIsMember] = useState(false);

  // Helper function to safely convert to number
  const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^\d.-]/g, '');
      const num = parseFloat(cleanValue);
      return isNaN(num) ? 0 : num;
    }
    
    // For other types, try Number conversion
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Calcular precios según si es grupo específico o curso general
  const getEnrollmentFee = (): number => {
    if (group) {
      // Si el grupo tiene su propio precio, usarlo; si no, usar el del curso
      const groupFee = isMember ? group.enrollment_fee_member : group.enrollment_fee_non_member;
      if (groupFee !== null && groupFee !== undefined) {
        return toNumber(groupFee);
      }
    }
    // Usar siempre el precio del curso como fallback
    return isMember 
      ? toNumber(course.enrollment_fee_member) 
      : toNumber(course.enrollment_fee_non_member);
  };

  const getMonthlyFee = (): number => {
    if (group) {
      // Si el grupo tiene su propio precio, usarlo; si no, usar el del curso
      const groupFee = isMember ? group.monthly_fee_member : group.monthly_fee_non_member;
      if (groupFee !== null && groupFee !== undefined) {
        return toNumber(groupFee);
      }
    }
    // Usar siempre el precio del curso como fallback
    return isMember 
      ? toNumber(course.monthly_fee_member) 
      : toNumber(course.monthly_fee_non_member);
  };

  const enrollmentFee = getEnrollmentFee();
  const monthlyPrice = getMonthlyFee();
  const totalCost = (course.requires_enrollment_fee ? enrollmentFee : 0) + monthlyPrice;

  // Debug logging (temporal)
  console.log('Course price debugging:', {
    course: {
      enrollment_fee_member: course.enrollment_fee_member,
      enrollment_fee_non_member: course.enrollment_fee_non_member,
      monthly_fee_member: course.monthly_fee_member,
      monthly_fee_non_member: course.monthly_fee_non_member,
      requires_enrollment_fee: course.requires_enrollment_fee
    },
    group: group ? {
      enrollment_fee_member: group.enrollment_fee_member,
      enrollment_fee_non_member: group.enrollment_fee_non_member,
      monthly_fee_member: group.monthly_fee_member,
      monthly_fee_non_member: group.monthly_fee_non_member
    } : null,
    calculated: {
      enrollmentFee,
      monthlyPrice,
      totalCost,
      isMember
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim() || !studentId.trim()) {
      return;
    }

    // Navigate to checkout with enrollment data
    // Preparar datos para el checkout
    const checkoutData = {
      type: 'course' as const,
      eventId: course.id,
      eventSlug: course.slug || `curso-${course.id}`,
      eventTitle: course.title,
      courseGroupId: group?.id || null,
      studentData: {
        name: studentName,
        cedula: studentId,
        is_member: isMember
      },
      totalAmount: totalCost,
      totalTickets: 1
    };
    
    // Guardar datos en localStorage para el checkout
    localStorage.setItem('checkout_data', JSON.stringify(checkoutData));
    
    navigate('/checkout');
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscripción al Curso</DialogTitle>
          <DialogDescription>
            Completa los datos del alumno para continuar con la inscripción
          </DialogDescription>
        </DialogHeader>

        {/* Course Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.commerce?.name || 'APAC'}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">{group?.name || 'Inscripción General'}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{group?.schedule || 'Consultar horarios'}</span>
                  </div>
                  {(group?.location || course.location) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{group?.location || course.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 col-span-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{course.start_date_format} - {course.end_date_format}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Nombre del Alumno</Label>
              <Input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nombre completo"
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Cédula</Label>
              <Input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Número de cédula"
                required
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Inscripción</Label>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="memberType"
                  checked={isMember}
                  onChange={() => setIsMember(true)}
                  className="text-primary"
                />
                <span className="text-sm font-medium">Socio</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="memberType"
                  checked={!isMember}
                  onChange={() => setIsMember(false)}
                  className="text-primary"
                />
                <span className="text-sm font-medium">No Socio</span>
              </label>
            </div>
          </div>

          {/* Cost Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Resumen de Costos</h4>
                {course.requires_enrollment_fee && enrollmentFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Matrícula:</span>
                    <span>{formatPrice(enrollmentFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Mensualidad ({isMember ? 'Socio' : 'No Socio'}):</span>
                  <span>{formatPrice(monthlyPrice)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total a pagar hoy:</span>
                  <span>{formatPrice(isNaN(totalCost) ? 0 : totalCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!studentName.trim() || !studentId.trim()}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Continuar al Checkout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseEnrollmentModal;