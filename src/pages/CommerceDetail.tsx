
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import CourseCard, { Course } from '@/components/CourseCard';
import { MapPin, Phone, Mail, Globe, ArrowLeft, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface CommerceDetail {
  id: string;
  slug: string;
  name: string;
  address: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  benefits?: Benefit[];
  courses?: Course[];
  user?: {
    email: string;
  };
  logo?: {
    storage_path_full: string;
  };
}

const CommerceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [commerce, setCommerce] = useState<CommerceDetail | null>(null);
  const [relatedBenefits, setRelatedBenefits] = useState<Benefit[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchCommerce = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`api/client/commerces/${slug}`);
        setCommerce(response.data.data);
        
        // Fetch more benefits and courses from the SAME commerce (for related section)
        const commerceId = response.data.data.id;
        const commerceName = response.data.data.name;
        
        // Fetch all benefits from this commerce (for related section)
        try {
          const benefitsResponse = await api.get('api/client/benefits', {
            params: { per_page: 20 }
          });
          // Filter to get ONLY benefits from THIS commerce
          const sameComerceeBenefits = benefitsResponse.data.data.data.filter(
            (benefit: Benefit) => benefit.commerce?.id === commerceId
          );
          // Exclude the ones already shown in main section and take max 3
          const currentBenefitIds = response.data.data.benefits?.map((b: Benefit) => b.id) || [];
          const additionalBenefits = sameComerceeBenefits.filter(
            (benefit: Benefit) => !currentBenefitIds.includes(benefit.id)
          ).slice(0, 3);
          setRelatedBenefits(additionalBenefits);
        } catch (error) {
          console.error('Error fetching related benefits:', error);
        }
        
        // Fetch all courses from this commerce (for related section)
        try {
          const coursesResponse = await api.get('api/client/courses', {
            params: { per_page: 20 }
          });
          // Filter to get ONLY courses from THIS commerce
          const sameCommerceCourses = coursesResponse.data.data.data.filter(
            (course: Course) => course.commerce?.name === commerceName || course.commerce?.id === commerceId
          );
          // Exclude the ones already shown in main section and take max 3
          const currentCourseIds = response.data.data.courses?.map((c: Course) => c.id) || [];
          const additionalCourses = sameCommerceCourses.filter(
            (course: Course) => !currentCourseIds.includes(course.id)
          ).slice(0, 3);
          setRelatedCourses(additionalCourses);
        } catch (error) {
          console.error('Error fetching related courses:', error);
        }
      } catch (error) {
        console.error('Error fetching commerce:', error);
        toast({
          title: "Error",
          description: "Failed to load commerce details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommerce();
  }, [slug, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="animate-pulse bg-muted/30 rounded-md h-64 w-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!commerce) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center text-muted-foreground">
            Commerce not found.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/comercios" className="hover:text-foreground transition-colors">Comercios</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{commerce.name}</span>
          </nav>
          
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Commerce Logo */}
            <div className="space-y-4">
              {commerce.logo && !imageError ? (
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={commerce.logo?.storage_path_full}
                    alt={commerce.name}
                    className="w-full h-96 object-cover"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ) : (
                <div className="relative h-96 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                    <p className="text-primary/80 font-medium">Sin logo disponible</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Commerce Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {commerce.name}
                </h1>
                <div 
                  className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: commerce.description }}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>{commerce.address}</span>
                </div>
                
                {commerce.phone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-5 w-5 mr-3 text-primary" />
                    <span>{commerce.phone}</span>
                  </div>
                )}
                
                {commerce.email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-5 w-5 mr-3 text-primary" />
                    <span>{commerce.email}</span>
                  </div>
                )}
                
                {commerce.website && (
                  <div className="flex items-center text-muted-foreground">
                    <Globe className="h-5 w-5 mr-3 text-primary" />
                    <a href={commerce.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {commerce.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      {commerce.benefits && commerce.benefits.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Beneficios Disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commerce.benefits.map((benefit) => (
                  <BenefitCard key={benefit.slug} benefit={benefit} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Courses Section */}
      {commerce.courses && commerce.courses.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Cursos Disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commerce.courses.map((course) => (
                  <CourseCard key={course.slug} course={course} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Related Benefits and Courses Section */}
      {(relatedBenefits.length > 0 || relatedCourses.length > 0) && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">
                Más de {commerce?.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBenefits.map((benefit) => (
                  <BenefitCard key={benefit.slug} benefit={benefit} />
                ))}
                {relatedCourses.map((course) => (
                  <CourseCard key={course.slug} course={course} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  );
};

export default CommerceDetail;
