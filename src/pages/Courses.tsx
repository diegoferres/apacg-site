import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Clock, Users, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { formatPrice, toNumber } from '@/lib/utils';
import api from '@/services/api';

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  // API data structure
  const mockCourses = [
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

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    setCurrentPage(page);
    
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('api/client/courses', {
          params: { 
            page: page,
            per_page: 12,
            sort_by: 'start_date',
            sort_order: 'asc'
          }
        });
        const data = response.data.data;
        setCourses(data.data || []);
        setFilteredCourses(data.data || []);
        setTotalPages(data.last_page || 1);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
        setFilteredCourses([]);
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [searchParams]);
  
  const handleSearch = (term: string, categories: string[]) => {
    let results = [...courses];
    
    if (term) {
      const searchTerm = term.toLowerCase();
      results = results.filter(course => 
        course.title?.toLowerCase().includes(searchTerm) ||
        course.commerce?.name?.toLowerCase().includes(searchTerm) ||
        course.short_description?.toLowerCase().includes(searchTerm) ||
        course.description?.toLowerCase().includes(searchTerm) ||
        course.location?.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredCourses(results);
  };
  
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="pt-28 pb-8 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Cursos</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Todos los Cursos
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Desarrolla nuevas habilidades con nuestros cursos especializados disponibles para toda la familia.
          </p>
          
          <SearchBar onSearch={handleSearch} categories={[]} />
        </div>
      </section>
      
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-96 bg-muted/30 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {course.cover_image_url ? (
                    <img 
                      src={course.cover_image_url} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-primary/60" />
                    </div>
                  )}
                  <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                    {course.status === 'active' ? 'Activo' : course.status}
                  </Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <p className="text-sm text-primary font-medium">{course.commerce?.name || 'APAC'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.short_description || course.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.formatted_duration || course.duration_months + ' meses'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{course.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{course.start_date_format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{course.age_range}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Precio mensual:</p>
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Socios</span>
                        <span className="text-primary font-bold">
                          {formatPrice(toNumber(course.monthly_fee_member))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">No socios</span>
                        <span className="text-muted-foreground">
                          {formatPrice(toNumber(course.monthly_fee_non_member))}
                        </span>
                      </div>
                      {course.available_spots !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.available_spots} cupos disponibles
                        </p>
                      )}
                    </div>
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
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron cursos</h3>
              <p className="text-muted-foreground">
                No se encontraron cursos con los criterios seleccionados.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;