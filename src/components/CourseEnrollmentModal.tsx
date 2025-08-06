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
import { formatPrice } from '@/lib/utils';
import { Clock, Users, Calendar } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  academy: string;
  duration: string;
  startDate: string;
  endDate: string;
}

interface Group {
  id: number;
  name: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  enrollment: number;
  memberPrice: number;
  nonMemberPrice: number;
  description: string;
}

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  group: Group;
}

const CourseEnrollmentModal = ({ isOpen, onClose, course, group }: CourseEnrollmentModalProps) => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isMember, setIsMember] = useState(false);

  const monthlyPrice = isMember ? group.memberPrice : group.nonMemberPrice;
  const totalCost = group.enrollment + monthlyPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim() || !studentId.trim()) {
      return;
    }

    // Navigate to checkout with enrollment data
    navigate('/checkout', { 
      state: { 
        items: [{
          id: `course-${course.id}-group-${group.id}`,
          type: 'course',
          title: `${course.title} - ${group.name}`,
          subtitle: course.academy,
          image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
          quantity: 1,
          unitPrice: totalCost,
          details: {
            course: course,
            group: group,
            studentName: studentName,
            studentId: studentId,
            isMember: isMember,
            enrollment: group.enrollment,
            monthlyPrice: monthlyPrice
          }
        }],
        totalAmount: totalCost
      } 
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
                <p className="text-sm text-muted-foreground">{course.academy}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">{group.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{group.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{group.enrolled}/{group.capacity} alumnos</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{course.startDate} - {course.endDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">Nombre del Alumno</Label>
            <Input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ingresa el nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Cédula del Alumno</Label>
            <Input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Ingresa el número de cédula"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Inscripción</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="memberType"
                  checked={isMember}
                  onChange={() => setIsMember(true)}
                  className="text-primary"
                />
                <span className="text-sm">Socio</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="memberType"
                  checked={!isMember}
                  onChange={() => setIsMember(false)}
                  className="text-primary"
                />
                <span className="text-sm">No Socio</span>
              </label>
            </div>
          </div>

          {/* Cost Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Resumen de Costos</h4>
                {group.enrollment > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Matrícula:</span>
                    <span>{formatPrice(group.enrollment)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Mensualidad ({isMember ? 'Socio' : 'No Socio'}):</span>
                  <span>{formatPrice(monthlyPrice)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total a pagar hoy:</span>
                  <span>{formatPrice(totalCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!studentName.trim() || !studentId.trim()}>
              Continuar al Checkout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseEnrollmentModal;