import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Store, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate, removeHTMLTags } from '@/lib/utils';
import analytics from '@/services/analytics';

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
  position?: number;
  listName?: string;
}

const BenefitCard = ({ benefit, delay = 0, position = 0, listName = 'benefits_list' }: BenefitCardProps) => {
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

  const handleClick = () => {
    // Track item click for analytics
    analytics.trackItemClick(
      benefit.id,
      benefit.title,
      'benefit',
      position,
      listName
    );
  };

  return (
    <Link to={`/beneficio/${benefit.slug}`} className="block" onClick={handleClick}>
      <Card
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full ${
          isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'
        }`}
      >
        {benefit.cover && !imageError ? (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={benefit.cover?.storage_path_full}
              alt={benefit.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white text-xs">
              {benefit.category?.name || benefit.categories?.[0]?.name || 'Sin categoría'}
            </Badge>
          </div>
        ) : (
          <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <Image className="h-12 w-12 text-primary/60" />
            <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white text-xs">
              {benefit.category?.name || benefit.categories?.[0]?.name || 'Sin categoría'}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
            {benefit.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {removeHTMLTags(benefit.description)}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col flex-1">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Store className="h-4 w-4 mr-2 text-primary" />
              {benefit.commerce?.name}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>{formatDate(benefit.start_date, { format: 'short' })} - {formatDate(benefit.end_date, { format: 'short' })}</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-auto">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <span>Ver Detalles</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BenefitCard;
