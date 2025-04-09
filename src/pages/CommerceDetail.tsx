
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Store, MapPin, Phone, Mail, ExternalLink, Image, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CommerceDetail {
  id: string;
  name: string;
  description?: string;
  logo?: {
    storage_path_full: string;
  };
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  benefits?: Benefit[];
}

const CommerceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [commerce, setCommerce] = useState<CommerceDetail | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCommerceDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch commerce details
        const response = await api.get(`api/client/commerces/${id}`);
        setCommerce(response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching commerce details:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del comercio. Intente nuevamente más tarde.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchCommerceDetails();
  }, [id, toast]);

  useEffect(() => {
    const fetchBenefits = async () => {
      if (!commerce) return;
      
      try {
        // Fetch benefits for the commerce
        const response = await api.get(`api/client/commerces/${commerce.id}/benefits`);
        setBenefits(response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching benefits:', error);
      }
    };

    fetchBenefits();

  }, [commerce]);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-8 w-full max-w-6xl px-4">
            <div className="h-32 bg-muted/30 rounded-lg"></div>
            <div className="h-64 bg-muted/30 rounded-lg"></div>
            <div className="h-96 bg-muted/30 rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!commerce) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col p-4">
          <h2 className="text-2xl font-bold mb-4">Comercio no encontrado</h2>
          <p className="text-muted-foreground mb-6">El comercio que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link to="/comercios">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Comercios
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-28 pb-16 container mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild size="sm" className="mb-4">
            <Link to="/comercios">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Comercios
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 flex-shrink-0">
              <Card className="overflow-hidden">
                {commerce.logo && !imageError ? (
                  <div className="relative w-full h-64 overflow-hidden">
                    <img
                      src={commerce.logo.storage_path_full}
                      alt={commerce.name}
                      className="w-full h-full object-contain p-4"
                      onError={handleImageError}
                    />
                  </div>
                ) : (
                  <div className="bg-muted/30 w-full h-64 flex items-center justify-center">
                    <Store className="h-16 w-16 text-muted-foreground/60" />
                  </div>
                )}
              </Card>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{commerce.name}</h1>
              
              {commerce.description && (
                <div className="mt-4 mb-6 text-muted-foreground">
                  <p>{commerce.description}</p>
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                {commerce.address && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{commerce.address}</span>
                  </div>
                )}
                {commerce.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{commerce.phone}</span>
                  </div>
                )}
                {commerce?.user?.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{commerce?.user?.email}</span>
                  </div>
                )}
                {commerce.website && (
                  <div className="flex items-center text-sm">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <a href={commerce.website} target="_blank" rel="noopener noreferrer" 
                      className="text-primary hover:underline">
                      {commerce.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Beneficios disponibles</h2>
          
          {benefits && benefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits?.map((benefit, index) => (
                <BenefitCard 
                  key={benefit.id} 
                  benefit={benefit} 
                  delay={100 + index * 50}
                />
              ))}
            </div>
          ) : (
             <div className="text-center py-12 bg-muted/10 rounded-lg">
              <p className="text-muted-foreground">Este comercio aún no tiene beneficios disponibles.</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CommerceDetail;
