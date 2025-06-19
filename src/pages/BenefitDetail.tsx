import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Image 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import api from '@/services/api';
import { format } from 'date-fns';

interface BenefitDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  redemption_details: string;
  commerce?: {
    name: string;
  };
  categories?: [{
    name: string;
  }];
  cover?: {
    storage_path_full: string;
  };
}

const BenefitDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [benefit, setBenefit] = useState<BenefitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchBenefit = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`api/client/benefits/${slug}`);
        setBenefit(response.data.data);
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

  const formatDateSafe = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === 'No definido' || dateString.trim() === '') {
      return 'No definido';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'No definido';
      }
      return format(date, 'dd/MM/yyyy');
    } catch {
      return 'No definido';
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
                  {formatDateSafe(benefit.start_date)} - {formatDateSafe(benefit.end_date)}
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
      
      <Footer />
    </div>
  );
};

export default BenefitDetail;
