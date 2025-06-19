
import { useState } from 'react';
import { X, MapPin, Calendar, Clock, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface TicketType {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  priceFrom: number;
  ticketTypes: TicketType[];
}

interface EventPurchaseModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const EventPurchaseModal = ({ event, isOpen, onClose }: EventPurchaseModalProps) => {
  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `Gs. ${price.toLocaleString('es-ES')}`;
  };

  const updateTicketQuantity = (ticketId: number, change: number) => {
    const currentQuantity = selectedTickets[ticketId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    const ticketType = event.ticketTypes.find(t => t.id === ticketId);
    
    if (ticketType && newQuantity <= ticketType.stock) {
      setSelectedTickets(prev => ({
        ...prev,
        [ticketId]: newQuantity
      }));
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticketType = event.ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticketType ? ticketType.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handleProceedToPay = async () => {
    if (getTotalTickets() === 0) {
      toast({
        title: "Selecciona al menos una entrada",
        description: "Debes seleccionar al menos una entrada para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simular proceso de pago
    setTimeout(() => {
      toast({
        title: "¡Compra exitosa!",
        description: `Has comprado ${getTotalTickets()} entrada(s) para ${event.title}. Recibirás un correo de confirmación.`
      });
      setIsLoading(false);
      onClose();
      setSelectedTickets({});
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Event Info */}
          <div className="md:col-span-1">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                <span>{event.time} hrs</span>
              </div>
              
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          
          {/* Ticket Selection */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Selecciona tus entradas</h3>
            
            <div className="space-y-4 mb-6">
              {event.ticketTypes.map((ticketType) => (
                <Card key={ticketType.id} className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{ticketType.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticketType.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(ticketType.price)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {ticketType.stock} disponibles
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketQuantity(ticketType.id, -1)}
                          disabled={!selectedTickets[ticketType.id]}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">
                          {selectedTickets[ticketType.id] || 0}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTicketQuantity(ticketType.id, 1)}
                          disabled={(selectedTickets[ticketType.id] || 0) >= ticketType.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Purchase Summary */}
            {getTotalTickets() > 0 && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de compra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                      if (quantity === 0) return null;
                      const ticketType = event.ticketTypes.find(t => t.id === parseInt(ticketId));
                      if (!ticketType) return null;
                      
                      return (
                        <div key={ticketId} className="flex justify-between text-sm">
                          <span>{quantity}x {ticketType.name}</span>
                          <span>{formatPrice(ticketType.price * quantity)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleProceedToPay}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                    >
                      {isLoading ? "Procesando..." : "Proceder al Pago"}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Al continuar, aceptas nuestros{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        términos y condiciones
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventPurchaseModal;
