
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Store, Tag, ChevronRight, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface Commerce {
  id: string;
  name: string;
  claim_count?: number;
  logo: {
    storage_path_full: string;
  }
}

interface CommerceCardProps {
  commerce: Commerce;
  delay?: number;
}

const removeHTMLTags = (text: string) => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || "";
};

const CommerceCard = ({ commerce, delay = 0 }: CommerceCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  return (
    <Link 
      key={commerce.id} 
      to={`/comercio/${commerce.id}`}
    >
      <Card 
        className={`overflow-hidden transition-all duration-500 transform hover:shadow-md hover:-translate-y-1 ${
          isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'
        }`}
      >
        {commerce.logo && !imageError ? (
          <div className="relative w-full h-48 overflow-hidden">
            <img
              src={commerce.logo?.storage_path_full}
              alt={commerce.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="bg-muted/30 w-full h-48 flex items-center justify-center">
            <Image className="h-12 w-12 text-muted-foreground/60" />
          </div>
        )}
        <CardHeader className="p-4 pb-2">
          <h3 className="text-lg font-semibold line-clamp-2">{commerce.name}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{commerce.name}</h3>
            {/* <Badge variant="secondary" className="text-xs">
              {commerce.}
            </Badge> */}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {commerce.claim_count} {commerce.claim_count === 1 ? 'beneficio' : 'beneficios'} disponibles
          </div>
        </CardContent>
        {/* <CardFooter className="p-4 pt-2 flex justify-between items-center border-t border-border/40">
          {benefit.claim_count !== undefined && (
            <span className="text-xs text-muted-foreground">
              {benefit.claim_count} personas usaron este beneficio
            </span>
          )}
          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link to={`/beneficio/${benefit.id}`} className="flex items-center">
              Ver más <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardFooter> */}
      </Card>
    </Link>
  );
};

export default CommerceCard;
