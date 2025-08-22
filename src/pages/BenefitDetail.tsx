import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  Image,
  QrCode
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import api from '@/services/api';
import { useStore } from '@/stores/store';
import analytics from '@/services/analytics';

interface BenefitDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  redemption_details: string;
  commerce?: {
    id: string;
    name: string;
    slug: string;
  };
  categories?: [{
    id: string;
    name: string;
    slug: string;
  }];
  cover?: {
    storage_path_full: string;
  };
}

const BenefitDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [benefit, setBenefit] = useState<BenefitDetail | null>(null);
  const [relatedBenefits, setRelatedBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const { isLoggedIn } = useStore();

  useEffect(() => {
    const fetchBenefit = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`api/client/benefits/${slug}`);
        const benefitData = response.data.data;
        setBenefit(benefitData);
        
        // Track visualización del beneficio
        if (benefitData) {
          analytics.trackViewItem(
            benefitData.id,
            benefitData.name,
            'benefit',
            0
          );
        }
        
        // Fetch related benefits (same commerce + same category)
        await fetchRelatedBenefits(benefitData);
      } catch (error) {
        console.error('Error fetching benefit:', error);
        toast({
          title: "Error",
          description: "Failed to load benefit details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRelatedBenefits = async (currentBenefit: BenefitDetail) => {
      try {
        console.log('Fetching related benefits for:', currentBenefit);
        
        const response = await api.get('api/client/benefits', {
          params: { per_page: 30 }
        });
        
        const allBenefits = response.data.data.data;
        console.log('All benefits fetched:', allBenefits.length);
        
        const currentId = currentBenefit.id;
        const currentCommerceId = currentBenefit.commerce?.id;
        const currentCategoryIds = currentBenefit.categories?.map(c => c.id) || [];
        
        console.log('Filtering criteria:', {
          currentId,
          currentCommerceId,
          currentCategoryIds
        });
        
        // 1. Benefits from same commerce (max 3)
        const sameCommerce = allBenefits.filter((b: Benefit) => 
          b.id !== currentId && 
          b.commerce?.id === currentCommerceId
        ).slice(0, 3);
        
        console.log('Same commerce benefits:', sameCommerce.length);
        console.log('Same commerce benefits data:', sameCommerce);
        
        // 2. Benefits from same categories (max 3, excluding same commerce ones)
        const sameCategory = allBenefits.filter((b: Benefit) => {
          if (b.id === currentId || b.commerce?.id === currentCommerceId) {
            return false;
          }
          
          // Handle both single category and categories array
          const benefitCategoryIds = [];
          if (b.category?.id) benefitCategoryIds.push(b.category.id);
          if (b.categories) benefitCategoryIds.push(...b.categories.map(c => c.id));
          
          const hasMatchingCategory = benefitCategoryIds.some(catId => currentCategoryIds.includes(catId));
          
          if (hasMatchingCategory) {
            console.log('Matching category benefit:', b.title, 'categories:', benefitCategoryIds);
          }
          
          return hasMatchingCategory;
        }).slice(0, 3);
        
        console.log('Same category benefits:', sameCategory.length);
        console.log('Same category benefits data:', sameCategory);
        
        // 3. Combine and limit to 6 total
        const related = [...sameCommerce, ...sameCategory].slice(0, 6);
        console.log('Total related benefits:', related.length);
        console.log('Setting related benefits:', related);
        
        // If no related benefits found, show some random ones for testing
        if (related.length === 0) {
          console.log('No related benefits found, showing random ones for testing');
          const randomBenefits = allBenefits
            .filter((b: Benefit) => b.id !== currentId)
            .slice(0, 3);
          console.log('Random benefits for fallback:', randomBenefits.length);
          setRelatedBenefits(randomBenefits);
        } else {
          setRelatedBenefits(related);
        }
        
        // Additional debugging
        console.log('Related benefits state should be set to:', related.length || 'fallback', 'items');
      } catch (error) {
        console.error('Error fetching related benefits:', error);
        // Silent fail - don't show section if it fails
      }
    };

    fetchBenefit();
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

  if (!benefit) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center text-muted-foreground">
            Benefit not found.
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClaimBenefit = () => {
    // Track uso de beneficio en GA4
    if (benefit) {
      analytics.trackBenefitUse(
        benefit.id,
        benefit.name,
        benefit.commerce?.name || 'Comercio'
      );
    }
    
    if (isLoggedIn) {
      // Si está logueado, llevar directamente al perfil
      navigate('/perfil');
    } else {
      // Si no está logueado, ir al login con parámetro de redirección
      navigate('/login?returnTo=/perfil');
    }
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
            <Link to="/beneficios" className="hover:text-foreground transition-colors">Beneficios</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{benefit.name}</span>
          </nav>
          
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Benefit Image */}
            <div className="space-y-4">
              {benefit.cover && !imageError ? (
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={benefit.cover?.storage_path_full}
                    alt={benefit.name}
                    className="w-full h-96 object-cover"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ) : (
                <div className="relative h-96 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                    <p className="text-primary/80 font-medium">Sin imagen disponible</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Benefit Details */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(benefit.start_date, { format: 'medium' })} - {formatDate(benefit.end_date, { format: 'medium' })}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {benefit.name}
                </h1>
                <div 
                  className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: benefit.description }}
                />
              </div>
              
              <div className="space-y-4">
                {benefit.commerce && (
                  <div className="flex items-center text-muted-foreground">
                    <Tag className="h-5 w-5 mr-3 text-primary" />
                    <span>Ofrecido por: {benefit.commerce.name}</span>
                  </div>
                )}
                
                {benefit.categories && benefit.categories.length > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Tag className="h-5 w-5 mr-3 text-primary" />
                    <span>
                      Categorías: {benefit.categories.map((category) => category.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Call to Action Button */}
              <div className="pt-6">
                <Button 
                  onClick={handleClaimBenefit}
                  size="lg"
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Reclamar mi beneficio
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  {isLoggedIn 
                    ? "Ve a tu perfil para mostrar tu código QR de socio" 
                    : "Inicia sesión para acceder a tu código QR de socio"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefit Details */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Detalles de la Promoción</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {benefit.redemption_details}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Benefits Section */}
      {(() => {
        console.log('Rendering related benefits section. Length:', relatedBenefits.length);
        console.log('Related benefits data at render:', relatedBenefits);
        return relatedBenefits.length > 0;
      })() && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">
                Beneficios que te pueden interesar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBenefits.map((relatedBenefit) => (
                  <BenefitCard key={relatedBenefit.slug} benefit={relatedBenefit} />
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

export default BenefitDetail;
