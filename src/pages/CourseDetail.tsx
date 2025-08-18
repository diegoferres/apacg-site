import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseEnrollmentModal from '@/components/CourseEnrollmentModal';
import { Clock, Users, MapPin, Calendar, GraduationCap, ArrowLeft } from 'lucide-react';
import { formatPrice, toNumber, renderSafeHtml, formatDate } from '@/lib/utils';
import api from '@/services/api';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [enrollmentGroup, setEnrollmentGroup] = useState<any>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      try {
        const response = await api.get(`api/client/courses/${slug}`);
        setCourse(response.data.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        // Redirigir a 404 o mostrar error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  // Mock data structure for reference
  const mockCourse = {
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

  const handleEnroll = (groupId: number | null) => {
    if (groupId === null) {
      // Inscripción general (sin grupo específico)
      setEnrollmentGroup(null);
      setIsEnrollmentModalOpen(true);
    } else if (course?.groups) {
      const group = course.groups.find((g: any) => g.id === groupId);
      if (group) {
        setEnrollmentGroup(group);
        setIsEnrollmentModalOpen(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando curso...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Curso no encontrado</h1>
            <p className="text-muted-foreground mb-6">El curso que buscas no existe o no está disponible.</p>
            <Button onClick={() => navigate('/cursos')}>Volver a Cursos</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                {course.cover_image_url ? (
                  <div className="aspect-video">
                    <img 
                      src={course.cover_image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <Badge className="mb-2 bg-primary text-primary-foreground">
                        {course.status === 'active' ? 'Activo' : course.status}
                      </Badge>
                      <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
                      <p className="text-lg opacity-90">{course.commerce?.name || 'APAC'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center relative">
                    <GraduationCap className="h-16 w-16 text-primary/60" />
                    <div className="absolute bottom-4 left-4">
                      <Badge className="mb-2 bg-primary text-primary-foreground">
                        {course.status === 'active' ? 'Activo' : course.status}
                      </Badge>
                      <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
                      <p className="text-lg opacity-90">{course.commerce?.name || 'APAC'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={renderSafeHtml(course.description)}
                  />
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
                        <p className="text-sm text-muted-foreground">{course.formatted_duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Período</p>
                        <p className="text-sm text-muted-foreground">
                          {course.start_date_format} - {course.end_date_format}
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
                          {course.age_range}
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
                  <CardTitle>
                    {course.groups && course.groups.length > 0 ? 'Grupos Disponibles' : 'Información de Inscripción'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.groups && course.groups.length > 0 ? (
                    // Mostrar grupos específicos
                    course.groups.map((group: any, index: number) => (
                      <div key={group.id}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{group.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {group.schedule}
                              </p>
                              {group.age_range && (
                                <p className="text-xs text-muted-foreground">
                                  {group.age_range}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {group.confirmed_enrollments_count}/{group.capacity} alumnos
                            </Badge>
                          </div>

                          {group.description && (
                            <p className="text-sm text-muted-foreground">
                              {group.description}
                            </p>
                          )}

                          <div className="space-y-2">
                            {(group.enrollment_fee_member > 0 || group.enrollment_fee_non_member > 0) && (
                              <div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Matrícula socios:</span>
                                  <span className="text-sm font-medium">
                                    {formatPrice(toNumber(group.enrollment_fee_member))}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Matrícula no socios:</span>
                                  <span className="text-sm font-medium">
                                    {formatPrice(toNumber(group.enrollment_fee_non_member))}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm">Socios:</span>
                              <span className="text-sm font-medium">
                                {formatPrice(toNumber(group.monthly_fee_member) !== 0 ? toNumber(group.monthly_fee_member) : toNumber(course.monthly_fee_member))}/mes
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">No socios:</span>
                              <span className="text-sm font-medium">
                                {formatPrice(toNumber(group.monthly_fee_non_member) !== 0 ? toNumber(group.monthly_fee_non_member) : toNumber(course.monthly_fee_non_member))}/mes
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {group.available_spots} cupos disponibles
                            </p>
                          </div>

                          <Button 
                            onClick={() => handleEnroll(group.id)}
                            className="w-full"
                            disabled={group.is_full}
                          >
                            {group.is_full ? 'Grupo Completo' : 'Inscribirse'}
                          </Button>
                        </div>
                        
                        {index < course.groups.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))
                  ) : (
                    // Mostrar información del curso principal cuando no hay grupos
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">Inscripción General</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.schedule}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {course.confirmed_enrollments_count || 0}/{course.capacity} alumnos
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {course.requires_enrollment_fee && (
                          <div>
                            <div className="flex justify-between">
                              <span className="text-sm">Matrícula socios:</span>
                              <span className="text-sm font-medium">
                                {formatPrice(toNumber(course.enrollment_fee_member))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Matrícula no socios:</span>
                              <span className="text-sm font-medium">
                                {formatPrice(toNumber(course.enrollment_fee_non_member))}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm">Socios:</span>
                          <span className="text-sm font-medium">
                            {formatPrice(toNumber(course.monthly_fee_member))}/mes
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">No socios:</span>
                          <span className="text-sm font-medium">
                            {formatPrice(toNumber(course.monthly_fee_non_member))}/mes
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {course.available_spots} cupos disponibles
                        </p>
                      </div>

                      <Button 
                        onClick={() => handleEnroll(null)}
                        className="w-full"
                        disabled={!course.is_available}
                      >
                        {!course.is_available ? 'No Disponible' : 'Inscribirse'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>


            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Enrollment Modal */}
      <CourseEnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        course={course}
        group={enrollmentGroup}
      />
    </div>
  );
};

export default CourseDetail;