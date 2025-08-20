import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  date: string;
  date_format?: string;
  end_date?: string;
  end_date_format?: string;
  time: string;
  location: string;
  price_from: number;
  is_informational: boolean;
  cover?: {
    storage_path_full: string;
  };
}

interface EventCardProps {
  event: Event;
  delay?: number;
}

const removeHTMLTags = (text: string) => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || "";
};

const EventCard = ({ event, delay = 0 }: EventCardProps) => {
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

  return (
    <Link to={`/evento/${event.slug}`} className="block">
      <Card 
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full ${
          delay > 0 ? (isVisible ? 'opacity-100' : 'opacity-0 translate-y-4') : ''
        }`}
        style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      >
        {event.cover ? (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={event.cover?.storage_path_full}
              alt={event.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
              <Calendar className="h-3 w-3 mr-1" />
              {event.date_format || formatDate(event.date, { format: 'short' })}
              {event.end_date_format && ` - ${event.end_date_format}`}
              {!event.end_date_format && event.end_date && ` - ${formatDate(event.end_date, { format: 'short' })}`}
            </Badge>
          </div>
        ) : (
          <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <div className="text-center">
              <Ticket className="h-12 w-12 text-primary/60 mx-auto mb-2" />
              <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                <Calendar className="h-3 w-3 mr-1" />
                {event.date_format || formatDate(event.date, { format: 'short' })}
                {event.end_date_format && ` - ${event.end_date_format}`}
                {!event.end_date_format && event.end_date && ` - ${formatDate(event.end_date, { format: 'short' })}`}
              </Badge>
            </div>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
            {event.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {removeHTMLTags(event.description)}
          </p>
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              {event.time} hrs
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              {event.location}
            </div>
          </div>
          
          <div className={`flex items-center pt-4 mt-auto ${event.is_informational ? 'justify-end' : 'justify-between'}`}>
            {!event.is_informational && (
              <div>
                <span className="text-xs text-muted-foreground">Desde</span>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(event.price_from)}
                </p>
              </div>
            )}
            
            <Button asChild className="bg-primary hover:bg-primary/90">
              <span>Ver Detalles</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;