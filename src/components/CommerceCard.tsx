
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { removeHTMLTags } from '@/lib/utils';
import analytics from '@/services/analytics';

export interface Commerce {
  id: string;
  slug: string;
  name: string;
  address: string;
  description: string;
  claim_count?: number;
  benefits_count?: number; // Now includes both benefits and courses from backend
  courses_count?: number; // Still available for internal use
  benefits?: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  courses?: Array<{
    id: number;
    slug: string;
    title: string;
  }>;
  logo?: {
    storage_path_full: string;
  };
}

interface CommerceCardProps {
  commerce: Commerce;
  delay?: number;
  position?: number;
  listName?: string;
}

const CommerceCard = ({ commerce, delay = 0, position = 0, listName = 'commerces_list' }: CommerceCardProps) => {
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
      commerce.id,
      commerce.name,
      'commerce',
      position,
      listName
    );
  };

  return (
    <Link 
      key={commerce.slug} 
      to={`/comercio/${commerce.slug}`}
      onClick={handleClick}
    >
      <Card
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full ${
          isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'
        }`}
      >
        {commerce.logo && !imageError ? (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={commerce.logo?.storage_path_full}
              alt={commerce.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : (
          <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <Image className="h-12 w-12 text-primary/60" />
          </div>
        )}
        <CardHeader className="pb-3">
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">{commerce.name}</h3>
          <p className="text-muted-foreground text-sm">
            {(() => {
              const totalCount = commerce.benefits_count ?? commerce.benefits?.length ?? 0;
              if (totalCount === 0) return 'Sin beneficios disponibles';
              return `${totalCount} ${totalCount === 1 ? 'beneficio disponible' : 'beneficios disponibles'}`;
            })()}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
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

export default CommerceCard;
