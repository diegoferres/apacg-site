import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import { MapPin, Phone, Mail, Globe, ArrowLeft, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  user?: {
    email: string;
  };
  logo?: {
    storage_path_full: string;
  };
}

const CommerceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [commerce, setCommerce] = useState<CommerceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchCommerce = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`api/client/commerces/${slug}`);
        setCommerce(response.data.data);
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/comercios" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Comercios
          </Link>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {commerce.logo && !imageError ? (
              <div className="relative w-full h-96 overflow-hidden rounded-md">
                <img
                  src={commerce.logo?.storage_path_full}
                  alt={commerce.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            ) : (
              <div className="bg-muted/30 w-full h-96 flex items-center justify-center rounded-md">
                <Image className="h-16 w-16 text-muted-foreground/60" />
              </div>
            )}
            <h1 className="text-3xl font-bold mt-4">{commerce.name}</h1>
            <p className="text-muted-foreground mt-2">{commerce.description}</p>
          </div>

          <div>
            <div className="bg-secondary/10 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">{commerce.address}</p>
              </div>
              {commerce.phone && (
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">{commerce.phone}</p>
                </div>
              )}
              {commerce.email && (
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">{commerce.email}</p>
                </div>
              )}
              {commerce.website && (
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a href={commerce.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {commerce.website}
                  </a>
                </div>
              )}
            </div>

            {commerce.benefits && commerce.benefits.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Beneficios Disponibles</h2>
                <div className="grid grid-cols-1 gap-4">
                  {commerce.benefits.map((benefit) => (
                    <BenefitCard key={benefit.id} benefit={benefit} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CommerceDetail;
