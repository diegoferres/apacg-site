import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import { formatPrice } from '@/lib/utils';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import EventPurchaseModal from '@/components/EventPurchaseModal';
import api from '@/services/api';

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  date: string;
  date_format: string;
  time: string;
  location: string;
  price_from: number;
  cover: {
    storage_path_full: string;
  };
}



const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const itemsPerPage = 6;

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    setCurrentPage(page);
    
    // En el futuro, aquí se haría la llamada al API
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('api/client/events', {
          params: { page }
        });
        const eventsData = response.data.data.data;
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        setTotalPages(Math.ceil(response.data.data.last_page || 1));
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los eventos. Intente nuevamente más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [searchParams, toast]);

  // Helper function to strip HTML tags for short descriptions
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const handleSearch = (term: string, categories: string[]) => {
    let results = [...(events || [])];
    
    if (term) {
      const searchTerm = term.toLowerCase();
      results = results.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredEvents(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when searching
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'No definido' || dateString.trim() === '') {
      return 'No definido';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'No definido';
      }
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'No definido';
    }
  };



  const handleBuyTickets = (event: Event) => {

    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="pt-28 pb-8 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Eventos</span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Eventos Disponibles
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Descubre y participa en los eventos especiales organizados por A.P.A.C. GOETHE.
          </p>
          
          <SearchBar onSearch={handleSearch} categories={[]} />
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-96 bg-muted/30 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredEvents?.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents?.map((event) => (
              <Link key={event.id} to={`/evento/${event.slug}`} className="block">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                {event.cover ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.cover?.storage_path_full}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(event.date)}
                    </Badge>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <Ticket className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                      <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(event.date_format)}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {stripHtml(event.shortDescription)}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {event.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    {event.time} hrs
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Desde</span>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(event.price_from)}
                      </p>
                    </div>
                    
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={(e) => e.stopPropagation()}
                    >
                        Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron eventos con los criterios seleccionados.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => handlePageChange(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <PaginationItem key={page}>...</PaginationItem>;
                  }
                  return null;
                })}
                
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>
      
      <Footer />
      
      {selectedEvent && (
        <EventPurchaseModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Events;
