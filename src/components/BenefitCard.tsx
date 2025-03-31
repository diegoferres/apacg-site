
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Store, Tag, ChevronRight, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface Benefit {
  id: string;
  title: string;
  store: string;
  description: string;
  category: string;
  validFrom: string;
  validTo: string;
  usageCount?: number;
  image?: string; // Added image property
}

interface BenefitCardProps {
  benefit: Benefit;
  delay?: number;
}

const BenefitCard = ({ benefit, delay = 0 }: BenefitCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-500 transform hover:shadow-md hover:-translate-y-1 ${
        isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="relative w-full h-48 overflow-hidden bg-muted/30">
        {benefit.image && !imageError ? (
          <>
            <img
              src={benefit.image}
              alt={benefit.title}
              className={`w-full h-full object-contain ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ transition: 'opacity 0.3s ease' }}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse">
                  <Image className="h-10 w-10 text-muted-foreground/60" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image className="h-12 w-12 text-muted-foreground/60" />
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2 bg-primary/5 text-xs font-medium">
            {benefit.category}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold line-clamp-2">{benefit.title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Store className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{benefit.store}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Válido: {formatDate(benefit.validFrom)} - {formatDate(benefit.validTo)}</span>
        </div>
        <p className="text-sm line-clamp-2 mt-2">{benefit.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center border-t border-border/40">
        {benefit.usageCount !== undefined && (
          <span className="text-xs text-muted-foreground">
            {benefit.usageCount} personas usaron este beneficio
          </span>
        )}
        <Button asChild variant="ghost" size="sm" className="ml-auto">
          <Link to={`/beneficio/${benefit.id}`} className="flex items-center">
            Ver más <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BenefitCard;
