import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import IndependentSearchBar from '@/components/IndependentSearchBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard, { Course } from '@/components/CourseCard';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { GraduationCap } from 'lucide-react';
import api from '@/services/api';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
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

  const fetchCourses = async (search: string = '', page: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = { 
        page: page,
        per_page: 12,
        sort_by: 'start_date',
        sort_order: 'asc'
      };
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get('api/client/courses', { params });
      const data = response.data.data;
      setCourses(data.data || []);
      setTotalPages(data.last_page || 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    const search = searchParams.get('search') || '';
    
    setCurrentPage(page);
    
    fetchCourses(search, page);
  }, [searchParams]);
  
  // Search functionality is now handled by IndependentSearchBar
  
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
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
          
          <IndependentSearchBar 
            placeholder="Buscar cursos..."
            showCategoryFilter={false}
            module="courses"
          />
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
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {courses.map((course, index) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  delay={100 + index * 50}
                  showPricing={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron cursos</h3>
              <p className="text-muted-foreground">
                {searchParams.get('search') ? 
                  `No se encontraron cursos que contengan "${searchParams.get('search')}".` :
                  'No se encontraron cursos disponibles.'
                }
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