
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Store, Tag, ChevronRight, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export interface Commerce {
  id: string;
  slug: string;
  name: string;
  address: string;
  description: string;
  claim_count?: number;
  logo?: {
    storage_path_full: string;
  };
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

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link 
      key={commerce.slug} 
      to={`/comercio/${commerce.slug}`}
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
          </div>
          
          <div className="text-sm text-muted-foreground">
            {commerce.claim_count} {commerce.claim_count === 1 ? 'beneficio' : 'beneficios'} disponibles
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CommerceCard;
