import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatPrice, formatDate, renderSafeHtml } from '@/lib/utils';
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
  QrCode,
  ChevronDown,
  ChevronUp
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
  const [showFullDescription, setShowFullDescription] = useState(false);

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
          description: "No se pudieron cargar los detalles del beneficio. Intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRelatedBenefits = async (currentBenefit: BenefitDetail) => {
      try {
        const response = await api.get('api/client/benefits', {
          params: { per_page: 30 }
        });

        const allBenefits = response.data.data.data;
        const currentId = currentBenefit.id;
        const currentCommerceId = currentBenefit.commerce?.id;
        const currentCategoryIds = currentBenefit.categories?.map(c => c.id) || [];

        // 1. Benefits from same commerce (max 3)
        const sameCommerce = allBenefits.filter((b: Benefit) =>
          b.id !== currentId &&
          b.commerce?.id === currentCommerceId
        ).slice(0, 3);

        // 2. Benefits from same categories (max 3, excluding same commerce ones)
        const sameCategory = allBenefits.filter((b: Benefit) => {
          if (b.id === currentId || b.commerce?.id === currentCommerceId) {
            return false;
          }

          const benefitCategoryIds = [];
          if (b.category?.id) benefitCategoryIds.push(b.category.id);
          if (b.categories) benefitCategoryIds.push(...b.categories.map(c => c.id));

          return benefitCategoryIds.some(catId => currentCategoryIds.includes(catId));
        }).slice(0, 3);

        // 3. Combine and limit to 6 total
        const related = [...sameCommerce, ...sameCategory].slice(0, 6);

        if (related.length === 0) {
          const randomBenefits = allBenefits
            .filter((b: Benefit) => b.id !== currentId)
            .slice(0, 3);
          setRelatedBenefits(randomBenefits);
        } else {
          setRelatedBenefits(related);
        }
      } catch (error) {
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
            Beneficio no encontrado.
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
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
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
          
          {/* Imagen del beneficio */}
          {benefit.cover && !imageError ? (
            <div className="relative overflow-hidden rounded-lg mb-8">
              <img
                src={benefit.cover?.storage_path_full}
                alt={benefit.name}
                className="w-full aspect-video object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center mb-8">
              <div className="text-center">
                <Image className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                <p className="text-primary/80 font-medium">Sin imagen disponible</p>
              </div>
            </div>
          )}

          {/* Título y badges */}
          <div className="mb-6">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(benefit.start_date, { format: 'medium' })} - {formatDate(benefit.end_date, { format: 'medium' })}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {benefit.name}
            </h1>
          </div>

          {/* Descripción + CTA lado a lado en desktop */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Descripción (2/3 del ancho) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Mobile: ver más/ver menos */}
              <div className="lg:hidden">
                <div
                  className={`text-muted-foreground leading-relaxed prose prose-sm max-w-none overflow-hidden transition-all ${showFullDescription ? '' : 'max-h-32'}`}
                  dangerouslySetInnerHTML={renderSafeHtml(benefit.description)}
                />
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="flex items-center gap-1 text-primary text-sm font-medium mt-2 hover:opacity-80"
                >
                  {showFullDescription ? (
                    <><ChevronUp className="h-4 w-4" /> Ver menos</>
                  ) : (
                    <><ChevronDown className="h-4 w-4" /> Ver más</>
                  )}
                </button>
              </div>

              {/* Desktop: descripción completa */}
              <div
                className="hidden lg:block text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={renderSafeHtml(benefit.description)}
              />

              <div className="space-y-3 pt-2">
                {benefit.commerce && (
                  <div className="flex items-center text-muted-foreground">
                    <Tag className="h-5 w-5 mr-3 text-primary" />
                    <span>Ofrecido por: {benefit.commerce.name}</span>
                  </div>
                )}
                {benefit.categories && benefit.categories.length > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Tag className="h-5 w-5 mr-3 text-primary" />
                    <span>Categorías: {benefit.categories.map((category) => category.name).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA (1/3 del ancho, sticky en desktop) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={handleClaimBenefit}
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                    >
                      <QrCode className="h-5 w-5 mr-2" />
                      Reclamar mi beneficio
                    </Button>
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      {isLoggedIn
                        ? "Ve a tu perfil para mostrar tu código QR de socio"
                        : "Inicia sesión para acceder a tu código QR de socio"
                      }
                    </p>
                  </CardContent>
                </Card>
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
      {relatedBenefits.length > 0 && (
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
