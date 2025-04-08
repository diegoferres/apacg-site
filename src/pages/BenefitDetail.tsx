
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

// Mock data for single benefit details
const mockBenefitDetails = {
  id: '1',
  title: 'Reintegro 20% en restaurantes y cafeterías los fines de semana',
  store: 'Café Milano',
  description: 'Obtén un reintegro del 20% en todas tus compras durante los fines de semana pagando con tarjeta de crédito asociada.',
  fullDescription: `
    Disfruta de un reintegro del 20% en todas tus consumiciones realizadas los fines de semana en Café Milano. 
    Este beneficio está disponible para todos los socios activos de A.P.A.C. GOETHE y aplica a consumiciones en el local.
    
    Para acceder al reintegro, deberás pagar con la tarjeta de crédito asociada a tu cuenta de socio. El monto será acreditado 
    automáticamente en tu próximo resumen de cuenta.
  `,
  category: 'Restaurantes',
  validFrom: '2023-09-01',
  validTo: '2023-12-31',
  usageCount: 128,
  location: 'Av. Principal 1234, Ciudad',
  requirements: [
    'Ser socio activo de A.P.A.C. GOETHE',
    'Presentar credencial de socio al momento de pagar',
    'Pagar con tarjeta de crédito asociada a la cuenta'
  ],
  terms: [
    'Válido solo los días sábados y domingos',
    'Máximo reintegro mensual: $5000',
    'No acumulable con otras promociones',
    'No válido para eventos especiales o feriados'
  ],
  image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952'
};

// Similar benefits mock data
const similarBenefits: Benefit[] = [
  {
    id: '3',
    title: '2x1 en entradas para funciones de teatro y cine',
    store: 'Teatro Municipal',
    description: 'Dos entradas por el precio de una para cualquier función de lunes a jueves presentando identificación.',
    category: 'Entretenimiento',
    validFrom: '2023-08-15',
    validTo: '2023-11-30',
    usageCount: 215,
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901'
  },
  {
    id: '4',
    title: 'Consulta médica gratuita para socios',
    store: 'Centro Médico Salud',
    description: 'Una consulta médica general gratuita por mes para socios activos. Reserva previa obligatoria.',
    category: 'Salud',
    validFrom: '2023-07-01',
    validTo: '2024-06-30',
    usageCount: 56,
    image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716'
  },
  {
    id: '5',
    title: 'Descuento del 30% en cursos de idiomas',
    store: 'Instituto de Idiomas Global',
    description: 'Importante descuento en la inscripción a cursos regulares de cualquier idioma.',
    category: 'Educación',
    validFrom: '2023-11-01',
    validTo: '2024-02-28',
    usageCount: 41,
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21'
  }
];

const BenefitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [benefit, setBenefit] = useState([]);
  const [similarBenefits, setSimilarBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Simulate loading data
    // const timer = setTimeout(() => {
      setIsLoading(true);
      // In a real app, we would fetch the benefit by id
      // For example:
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
      // For now, we'll just use the mock data
    // }, 800);

    // return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    const fetchMoreBenefits = async () => {
      try {
        const response = await api.get(`api/client/benefits/more/${benefit?.commerce?.id}`, {
          params: {
            id: benefit.id,
          }
        });
        const data = response.data.data;
        setSimilarBenefits(data);
      } catch (error) {
        console.error('Error fetching more benefits:', error);
      }
    };

    if (benefit?.commerce?.id) {
      fetchMoreBenefits();
    }
  }, [benefit?.commerce?.id, benefit.id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const isBenefitActive = (): boolean => {
    const now = new Date();
    const from = new Date(benefit?.start_date);
    const to = new Date(benefit?.end_date);
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
                {benefit?.category?.name}
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
                  src={benefit?.cover?.storage_path_full}
                  alt={benefit?.title}
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
              {benefit?.title}
            </h1>
            
            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center">
                <Store className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{benefit?.commerce?.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Válido: {formatDate(benefit.start_date)} - {formatDate(benefit?.end_date)}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{benefit?.claim_count} personas usaron este beneficio</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                <p className="text-muted-foreground whitespace-pre-line mb-4">
                  {benefit?.description}
                </p>
                
                <Separator className="my-6" />
                
                {/* <h3 className="text-lg font-medium mb-3">Requisitos</h3>
                <ul className="space-y-2 mb-6">
                  {benefit?.terms_and_conditions?.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul> */}
                
                <h3 className="text-lg font-medium">Términos y Condiciones</h3>
                <p className="text-muted-foreground whitespace-pre-line mb-4">
                  {benefit?.terms_and_conditions}
                </p>
                {/* <ul className="space-y-2">
                  {benefit.terms_and_conditions?.map((term, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul> */}
              </Card>
            </div>
            
            <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Información del Comercio</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Ubicación</h3>
                    <p className="text-sm text-muted-foreground">{benefit?.commerce?.address}</p>
                  </div>
                  {/* <div>
                    <h3 className="font-medium mb-1">Horario</h3>
                    <p className="text-sm text-muted-foreground">Lun - Vie: 9:00 - 20:00</p>
                    <p className="text-sm text-muted-foreground">Sáb - Dom: 10:00 - 22:00</p>
                  </div> */}
                  <div>
                    <h3 className="font-medium mb-1">Contacto</h3>
                    <p className="text-sm text-muted-foreground">Tel: {benefit?.commerce?.phone}</p>
                    <p className="text-sm text-muted-foreground">Email: {benefit?.commerce?.email}</p>
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
