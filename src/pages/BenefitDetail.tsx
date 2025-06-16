import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  image?: {
    storage_path_full: string;
  };
}

const BenefitDetail = () => {
  const { slug } = useParams<{ slug: string }>();
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/beneficios" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Beneficios
          </Link>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {benefit.image && !imageError ? (
              <div className="relative w-full h-96 overflow-hidden rounded-md">
                <img
                  src={benefit.image?.storage_path_full}
                  alt={benefit.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            ) : (
              <div className="bg-muted/30 w-full h-96 flex items-center justify-center rounded-md">
                <Image className="h-16 w-16 text-muted-foreground/60" />
              </div>
            )}
            <h1 className="text-3xl font-bold mt-4">{benefit.name}</h1>
            <p className="text-muted-foreground mt-2">{benefit.description}</p>
            <div className="flex items-center gap-2 mt-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">
                {format(new Date(benefit.start_date), 'dd/MM/yyyy')} - {format(new Date(benefit.end_date), 'dd/MM/yyyy')}
              </p>
            </div>
            {benefit.commerce && (
              <div className="flex items-center gap-2 mt-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">Ofrecido por: {benefit.commerce.name}</p>
              </div>
            )}
            {benefit.categories && benefit.categories.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">
                  Categorías:{' '}
                  {benefit.categories.map((category) => category.name).join(', ')}
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="bg-secondary/10 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Detalles de la Promoción</h2>
              <p className="text-sm">{benefit.redemption_details}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BenefitDetail;
