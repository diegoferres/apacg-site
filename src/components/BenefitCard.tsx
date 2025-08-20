import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Store, Tag, ChevronRight, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { formatPrice, formatDate } from '@/lib/utils';

export interface Benefit {
  id: string;
  slug: string;
  title: string;
  commerce: {
    id?: string;
    name: string;
  };
  description: string;
  category?: {
    id: string;
    name: string;
  };
  categories?: Array<{
    id: string;
    name: string;
  }>;
  start_date: string;
  end_date: string;
  claim_count?: number;
  cover?: {
    storage_path_full: string;
  };
}

interface BenefitCardProps {
  benefit: Benefit;
  delay?: number;
}

const removeHTMLTags = (text: string) => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || "";
};

const BenefitCard = ({ benefit, delay = 0 }: BenefitCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);


  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/beneficio/${benefit.slug}`} className="block">
    <Card 
        className={`overflow-hidden transition-all duration-500 transform hover:shadow-md hover:-translate-y-1 cursor-pointer ${
        isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'
      }`}
    >
      {benefit.cover && !imageError ? (
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <img
            src={benefit.cover?.storage_path_full}
            alt={benefit.title}
            className="w-full h-full object-cover object-center"
            onError={handleImageError}
          />
        </div>
      ) : (
        <div className="bg-muted/30 w-full aspect-[16/9] flex items-center justify-center">
          <Image className="h-12 w-12 text-muted-foreground/60" />
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2 bg-primary/5 text-xs font-medium">
            {benefit.category?.name || benefit.categories?.[0]?.name || 'Sin categoría'}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold line-clamp-2">{benefit.title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Store className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{benefit.commerce?.name}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Válido: {formatDate(benefit.start_date, { format: 'medium' })} - {formatDate(benefit.end_date, { format: 'medium' })}</span>
        </div>
        <p className="text-sm line-clamp-2 mt-2">{removeHTMLTags(benefit.description)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-end items-center border-t border-border/40">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center"
        >
            Ver más <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
};

export default BenefitCard;
