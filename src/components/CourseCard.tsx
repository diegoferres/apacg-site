import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice, toNumber, formatDate, renderSafeHtml } from '@/lib/utils';

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  start_date_format: string;
  end_date_format: string;
  location: string;
  monthly_fee_member: number;
  monthly_fee_non_member: number;
  duration_months: number;
  formatted_duration?: string;
  age_range: string;
  commerce?: {
    name: string;
  };
  cover_image_url?: string;
  available_spots?: number;
  status?: string;
}

interface CourseCardProps {
  course: Course;
  delay?: number;
  showPricing?: boolean;
}

const CourseCard = ({ course, delay = 0, showPricing = true }: CourseCardProps) => {
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
    <Link to={`/curso/${course.slug}`} className="block">
      <Card 
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full ${
          delay > 0 ? (isVisible ? 'opacity-100' : 'opacity-0 translate-y-4') : ''
        }`}
        style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      >
        {course.cover_image_url ? (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={course.cover_image_url}
              alt={course.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
              <GraduationCap className="h-3 w-3 mr-1" />
              {course.formatted_duration || course.duration_months + 'm'}
            </Badge>
          </div>
        ) : (
          <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 text-primary/60 mx-auto mb-2" />
              <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                <GraduationCap className="h-3 w-3 mr-1" />
                {course.formatted_duration || course.duration_months + 'm'}
              </Badge>
            </div>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {course.commerce?.name || 'APAC'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {course.age_range}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </CardTitle>
          <div 
            className="text-muted-foreground text-sm line-clamp-2"
            dangerouslySetInnerHTML={renderSafeHtml(course.short_description || course.description)}
          />
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              {formatDate(course.start_date_format, { format: 'short' })} - {formatDate(course.end_date_format, { format: 'short' })}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              {course.location}
            </div>
          </div>
          
          {showPricing ? (
            <div className="flex items-center justify-between pt-4 mt-auto">
              <div>
                <span className="text-xs text-muted-foreground">Desde</span>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(toNumber(course.monthly_fee_member))}
                </p>
              </div>
              
              <Button asChild className="bg-primary hover:bg-primary/90">
                <span>Ver Detalles</span>
              </Button>
            </div>
          ) : (
            <div className="flex justify-end pt-4 mt-auto">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <span>Ver Detalles</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;