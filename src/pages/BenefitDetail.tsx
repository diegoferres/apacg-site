
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Store, 
  Tag, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Users,
  Image 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import { api } from '@/services/api';

// Interface for the benefit detail
interface BenefitDetail {
  id: string;
  title: string;
  description: string;
  terms_and_conditions: string;
  start_date: string;
  end_date: string;
  claim_count: number;
  cover?: {
    storage_path_full: string;
  };
  category: {
    name: string;
  };
  commerce: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const BenefitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [benefit, setBenefit] = useState<BenefitDetail | null>(null);
  const [similarBenefits, setSimilarBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchBenefit = async (id: string) => {
      try {
        const response = await api.get(`api/client/benefits/${id}`);
        const data = response.data.data;
        setBenefit(data);
      } catch (error) {
        console.error('Error fetching benefit:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBenefit(id);
  }, [id]);

  useEffect(() => {
    const fetchMoreBenefits = async () => {
      try {
        if (benefit && benefit.commerce && benefit.commerce.id) {
          const response = await api.get(`api/client/benefits/more/${benefit.commerce.id}`, {
            params: {
              id: benefit.id,
            }
          });
          const data = response.data.data;
          setSimilarBenefits(data);
        }
      } catch (error) {
        console.error('Error fetching more benefits:', error);
      }
    };

    if (benefit?.commerce?.id) {
      fetchMoreBenefits();
    }
  }, [benefit]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const isBenefitActive = (): boolean => {
    if (!benefit) return false;
    
    const now = new Date();
    const from = new Date(benefit.start_date);
    const to = new Date(benefit.end_date);
    return now >= from && now <= to;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (isLoading) {
    // Loading state
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-8 w-full max-w-4xl px-4">
            <div className="h-12 bg-secondary rounded-lg"></div>
            <div className="h-24 bg-secondary rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-secondary rounded-lg"></div>
              <div className="h-8 bg-secondary rounded-lg w-3/4"></div>
              <div className="h-8 bg-secondary rounded-lg w-1/2"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!benefit) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Beneficio no encontrado</h2>
            <Button asChild>
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 animate-fade-up">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link to="/" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Inicio
              </Link>
            </Button>
            
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-primary/5">
                {benefit.category.name}
              </Badge>
              {isBenefitActive() ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" /> Activo
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertCircle className="h-3 w-3 mr-1" /> Finalizado
                </Badge>
              )}
            </div>
            
            {benefit.cover && !imageError ? (
              <div className="w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden">
                <img
                  src={benefit.cover.storage_path_full}
                  alt={benefit.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            ) : (
              <div className="w-full h-64 md:h-80 mb-6 rounded-lg bg-muted/30 flex items-center justify-center">
                <Image className="h-16 w-16 text-muted-foreground/60" />
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {benefit.title}
            </h1>
            
            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center">
                <Store className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{benefit.commerce.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Válido: {formatDate(benefit.start_date)} - {formatDate(benefit.end_date)}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{benefit.claim_count} personas usaron este beneficio</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                <p className="text-muted-foreground whitespace-pre-line mb-4">
                  {benefit.description}
                </p>
                
                <Separator className="my-6" />
                
                <h3 className="text-lg font-medium">Términos y Condiciones</h3>
                <p className="text-muted-foreground whitespace-pre-line mb-4">
                  {benefit.terms_and_conditions}
                </p>
              </Card>
            </div>
            
            <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Información del Comercio</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Ubicación</h3>
                    <p className="text-sm text-muted-foreground">{benefit.commerce.address}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Contacto</h3>
                    <p className="text-sm text-muted-foreground">Tel: {benefit.commerce.phone}</p>
                    <p className="text-sm text-muted-foreground">Email: {benefit.commerce.email}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center mb-3">
                  <p className="text-sm text-muted-foreground mb-3">¿Tienes dudas sobre este beneficio?</p>
                  <Button className="w-full">Contactar a la Asociación</Button>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Similar Benefits Section */}
          <div className="mt-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold mb-6">Beneficios similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarBenefits.map((benefit, index) => (
                <BenefitCard key={benefit.id} benefit={benefit} delay={100 + index * 50} />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BenefitDetail;
