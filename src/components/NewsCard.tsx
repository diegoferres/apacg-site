import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import analytics from '@/services/analytics';

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  date_format?: string;
  cover?: {
    storage_path_full: string;
  };
  content?: string;
}

interface NewsCardProps {
  newsItem: NewsItem;
  delay?: number;
  showButton?: boolean;
  position?: number;
  listName?: string;
}

const removeHTMLTags = (text: string) => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || "";
};

const NewsCard = ({ newsItem, delay = 0, showButton = true, position = 0, listName = 'news_list' }: NewsCardProps) => {
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
      newsItem.id.toString(),
      newsItem.title,
      'news',
      position,
      listName
    );
  };

  return (
    <Link to={`/novedad/${newsItem.slug}`} className="block" onClick={handleClick}>
      <Card 
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer ${
          delay > 0 ? (isVisible ? 'opacity-100' : 'opacity-0 translate-y-4') : ''
        }`}
        style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      >
        {newsItem.cover ? (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={newsItem.cover?.storage_path_full}
              alt={newsItem.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
              <Calendar className="h-3 w-3 mr-1" />
              {newsItem.date_format || formatDate(newsItem.date, { format: 'short' })}
            </Badge>
          </div>
        ) : (
          <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-primary/60 mx-auto mb-2" />
              <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                <Calendar className="h-3 w-3 mr-1" />
                {newsItem.date_format || formatDate(newsItem.date, { format: 'short' })}
              </Badge>
            </div>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
            {newsItem.title}
          </CardTitle>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {removeHTMLTags(newsItem.excerpt)}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          {showButton ? (
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <span>Leer Más</span>
            </Button>
          ) : (
            <span className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm">
              Leer más
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default NewsCard;