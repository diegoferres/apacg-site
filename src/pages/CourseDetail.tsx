import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, Users, MapPin, Calendar, GraduationCap, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  // Datos de ejemplo del curso (en una app real vendría de una API)
  const course = {
    id: 1,
    slug: 'robotica-educativa-lego',
    title: 'Robótica Educativa con LEGO',
    academy: 'APAC',
    shortDescription: 'Curso de robótica educativa para niños usando tecnología LEGO',
    description: 'Curso completo de robótica educativa que desarrolla habilidades STEM en niños y adolescentes. Los estudiantes aprenderán conceptos fundamentales de programación, mecánica y electrónica a través de proyectos prácticos con tecnología LEGO. El curso está diseñado para fomentar la creatividad, el pensamiento lógico y las habilidades de resolución de problemas.',
    duration: '4 meses',
    startDate: '05/09/2025',
    endDate: '05/01/2026',
    location: 'APAC - Sede Central',
    schedule: 'Viernes 15:00-17:00 hs y 18:00-20:00 hs',
    maxCapacity: 20,
    minAge: 7,
    maxAge: 18,
    status: 'Activo',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop',
    groups: [
      {
        id: 1,
        name: 'Kids (7-9 años)',
        schedule: 'Martes y Jueves 16:00-17:30',
        capacity: 15,
        enrolled: 8,
        enrollment: 0,
        memberPrice: 350000,
        nonMemberPrice: 500000,
        description: 'Grupo diseñado especialmente para los más pequeños, con actividades adaptadas a su edad y nivel de desarrollo.'
      },
      {
        id: 2,
        name: 'Teens 1 (15-17 años)',
        schedule: 'Jueves 17:30-19:00, Viernes 17:45-19:15',
        capacity: 12,
        enrolled: 5,
        enrollment: 500000,
        memberPrice: 300000,
        nonMemberPrice: 400000,
        description: 'Para adolescentes avanzados que buscan profundizar en conceptos de programación y robótica.'
      },
      {
        id: 3,
        name: 'Teens 2 (10-14 años)',
        schedule: 'Martes y Miércoles 18:15-19:45',
        capacity: 10,
        enrolled: 3,
        enrollment: 500000,
        memberPrice: 300000,
        nonMemberPrice: 400000,
        description: 'Grupo intermedio perfecto para preadolescentes que quieren iniciarse en la robótica.'
      }
    ]
  };

  const handleEnroll = (groupId: number) => {
    const group = course.groups.find(g => g.id === groupId);
    if (group) {
      navigate('/inscripcion-curso', { 
        state: { 
          course: course,
          group: group,
          type: 'course'
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cursos')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Cursos
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero image */}
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <Badge className="mb-2 bg-primary text-primary-foreground">
                    {course.status}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
                  <p className="text-lg opacity-90">{course.academy}</p>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                </CardContent>
              </Card>

              {/* Course Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Duración</p>
                        <p className="text-sm text-muted-foreground">{course.duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Período</p>
                        <p className="text-sm text-muted-foreground">
                          {course.startDate} - {course.endDate}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Ubicación</p>
                        <p className="text-sm text-muted-foreground">{course.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Edad</p>
                        <p className="text-sm text-muted-foreground">
                          {course.minAge} - {course.maxAge} años
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grupos Disponibles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.groups.map((group, index) => (
                    <div key={group.id}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{group.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {group.schedule}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {group.enrolled}/{group.capacity} alumnos
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>

                        <div className="space-y-2">
                          {group.enrollment > 0 && (
                            <div className="flex justify-between">
                              <span className="text-sm">Matrícula:</span>
                              <span className="text-sm font-medium">
                                {formatPrice(group.enrollment)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-sm">Socios:</span>
                            <span className="text-sm font-medium">
                              {formatPrice(group.memberPrice)}/mes
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">No socios:</span>
                            <span className="text-sm font-medium">
                              {formatPrice(group.nonMemberPrice)}/mes
                            </span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleEnroll(group.id)}
                          className="w-full"
                          disabled={group.enrolled >= group.capacity}
                        >
                          {group.enrolled >= group.capacity ? 'Grupo Completo' : 'Inscribirse'}
                        </Button>
                      </div>
                      
                      {index < course.groups.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Info adicional */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Importante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Los materiales están incluidos en el precio del curso</p>
                  <p>• Se requiere pago de matrícula al momento de la inscripción</p>
                  <p>• Las mensualidades se cobran por adelantado</p>
                  <p>• Certificado de participación al finalizar el curso</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;