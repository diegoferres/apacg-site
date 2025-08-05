import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, Users, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo de cursos
  const courses = [
    {
      id: 1,
      slug: 'robotica-educativa-lego',
      title: 'Robótica Educativa con LEGO',
      academy: 'APAC',
      shortDescription: 'Curso de robótica educativa para niños usando tecnología LEGO',
      duration: '4 meses',
      startDate: '05/09/2025',
      endDate: '05/01/2026',
      location: 'APAC - Sede Central',
      minAge: 7,
      maxAge: 18,
      status: 'Activo',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
      groups: [
        {
          id: 1,
          name: 'Kids (7-9 años)',
          schedule: 'Martes y Jueves 16:00-17:30',
          capacity: 15,
          enrollment: 0,
          memberPrice: 350000,
          nonMemberPrice: 500000
        },
        {
          id: 2,
          name: 'Teens 1 (15-17 años)',
          schedule: 'Jueves 17:30-19:00, Viernes 17:45-19:15',
          capacity: 12,
          enrollment: 500000,
          memberPrice: 300000,
          nonMemberPrice: 400000
        }
      ]
    },
    {
      id: 2,
      slug: 'programacion-python',
      title: 'Programación en Python',
      academy: 'APAC',
      shortDescription: 'Aprende programación desde cero con Python',
      duration: '6 meses',
      startDate: '15/09/2025',
      endDate: '15/03/2026',
      location: 'APAC - Sede Central',
      minAge: 12,
      maxAge: 18,
      status: 'Activo',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
      groups: [
        {
          id: 1,
          name: 'Básico (12-15 años)',
          schedule: 'Lunes y Miércoles 17:00-18:30',
          capacity: 20,
          enrollment: 0,
          memberPrice: 400000,
          nonMemberPrice: 600000
        }
      ]
    }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.academy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Cursos Disponibles
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desarrolla nuevas habilidades con nuestros cursos especializados
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                    {course.status}
                  </Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <p className="text-sm text-primary font-medium">{course.academy}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.shortDescription}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{course.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{course.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{course.minAge}-{course.maxAge} años</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Grupos disponibles:</p>
                    {course.groups.slice(0, 2).map((group) => (
                      <div key={group.id} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{group.name}</span>
                          <span className="text-primary font-bold">
                            Desde {formatPrice(group.memberPrice)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs">{group.schedule}</p>
                      </div>
                    ))}
                    {course.groups.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{course.groups.length - 2} grupos más
                      </p>
                    )}
                  </div>

                  <Button asChild className="w-full">
                    <Link to={`/curso/${course.slug}`}>
                      Ver Detalles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron cursos</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'No hay cursos disponibles en este momento.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Courses;