import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/utils';

const enrollmentSchema = z.object({
  studentName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  studentCi: z.string().min(6, 'La cédula debe tener al menos 6 caracteres')
});

type EnrollmentForm = z.infer<typeof enrollmentSchema>;

const CourseEnrollment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course, group } = location.state || {};

  const form = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      studentName: '',
      studentCi: ''
    }
  });

  if (!course || !group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">
              No se pudo cargar la información del curso.
            </p>
            <Button onClick={() => navigate('/cursos')}>
              Volver a Cursos
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const onSubmit = (data: EnrollmentForm) => {
    // Navegar al checkout con la información del estudiante y el curso
    navigate('/checkout', {
      state: {
        type: 'course',
        course: course,
        group: group,
        student: data,
        items: [
          {
            id: group.id,
            name: `${course.title} - ${group.name}`,
            description: group.schedule,
            price: group.memberPrice, // Por defecto precio de socio, se puede ajustar en checkout
            quantity: 1,
            image: course.image,
            type: 'course'
          }
        ]
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Datos del Estudiante</h1>
              <p className="text-muted-foreground">
                Complete los datos del estudiante que se inscribirá al curso
              </p>
            </div>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.academy}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Grupo seleccionado:</span>
                    <Badge>{group.name}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Horario:</span>
                    <span className="text-sm text-muted-foreground">{group.schedule}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Matrícula:</span>
                    <span className="font-bold">{formatPrice(group.enrollment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Mensualidad (socios):</span>
                    <span className="font-bold">{formatPrice(group.memberPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Mensualidad (no socios):</span>
                    <span className="font-bold">{formatPrice(group.nonMemberPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Estudiante</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="studentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo del estudiante</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Juan Pérez"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studentCi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cédula de identidad del estudiante</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: 12345678"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button type="submit" className="w-full" size="lg">
                        Continuar al Checkout
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Important Info */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 text-primary">Información importante:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Los datos del estudiante son necesarios para generar el certificado</li>
                  <li>• Se requiere el pago de matrícula para confirmar la inscripción</li>
                  <li>• Las mensualidades se cobran por adelantado cada mes</li>
                  <li>• El estudiante debe cumplir con el rango de edad del grupo seleccionado</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseEnrollment;