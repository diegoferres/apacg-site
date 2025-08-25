import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, toNumber, formatDate } from '@/lib/utils';
import analytics from '@/services/analytics';

export interface Raffle {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description?: string;
  end_date: string;
  price: number;
  cover?: {
    storage_path_full: string;
  };
}

interface RaffleCardProps {
  raffle: Raffle;
  delay?: number;
  position?: number;
  listName?: string;
}

const removeHTMLTags = (text: string) => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || "";
};

const RaffleCard = ({ raffle, delay = 0, position = 0, listName = 'raffles_list' }: RaffleCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [delay]);

  const handleClick = () => {
    // Track item click for analytics
    analytics.trackItemClick(
      raffle.id.toString(),
      raffle.title,
      'raffle',
      position,
      listName
    );
  };

  return (
    <Link to={`/rifa/${raffle.slug}`} className="block" onClick={handleClick}>
      <Card 
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer ${
          delay > 0 ? (isVisible ? 'opacity-100' : 'opacity-0 translate-y-4') : ''
        }`}
        style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      >
        {raffle.cover ? (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={raffle.cover?.storage_path_full}
              alt={raffle.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(raffle.end_date, { format: 'short' })}
            </Badge>
          </div>
        ) : (
          <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <div className="text-center">
              <Ticket className="h-12 w-12 text-primary/60 mx-auto mb-2" />
              <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(raffle.end_date, { format: 'short' })}
              </Badge>
            </div>
          </div>
        )}
        
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(raffle.end_date, { format: 'short' })}
            </Badge>
          </div>
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
            {raffle.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {removeHTMLTags(raffle.short_description)}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span>Sortea el {formatDate(raffle.end_date, { format: 'short' })}</span>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div>
              <span className="text-xs text-muted-foreground">Precio</span>
              <p className="text-xl font-bold text-primary">
                {formatPrice(toNumber(raffle.price))}
              </p>
            </div>
            
            <Button asChild className="bg-primary hover:bg-primary/90">
              <span>Ver Detalles</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RaffleCard;