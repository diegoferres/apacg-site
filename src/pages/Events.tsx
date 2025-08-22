import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndependentSearchBar from '@/components/IndependentSearchBar';
import EventCard, { Event } from '@/components/EventCard';
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
import analytics from '@/services/analytics';




const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();


  const fetchEvents = async (search: string = '', page: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page };
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get('api/client/events', { params });
      
      setEvents(response.data.data.data);
      setTotalPages(response.data.data.last_page || 1);
      
      // Track visualización de lista de eventos
      if (response.data.data.data && response.data.data.data.length > 0) {
        analytics.trackEvent('view_item_list', {
          item_list_name: 'Eventos',
          item_list_id: 'events_page',
          items: response.data.data.data.slice(0, 5).map((event: any) => ({
            item_id: event.id,
            item_name: event.title,
            item_category: 'event'
          }))
        });
        
        // Track búsqueda si hay término
        if (search && search.trim()) {
          analytics.trackSearch(search.trim());
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos. Intente nuevamente más tarde.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    const search = searchParams.get('search') || '';
    
    setCurrentPage(page);
    
    fetchEvents(search, page);
  }, [searchParams, toast]);


  // Search functionality is now handled by IndependentSearchBar

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
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
          
          <IndependentSearchBar 
            placeholder="Buscar eventos..."
            showCategoryFilter={false}
            module="events"
          />
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
          ) : events?.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {events?.map((event, index) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  delay={100 + index * 100}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchParams.get('search') ? 
                  `No se encontraron eventos que contengan "${searchParams.get('search')}".` :
                  'No se encontraron eventos disponibles.'
                }
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
