
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface Raffle {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  drawDate: string;
  drawTime: string;
  drawLocation: string | null;
  isOnline: boolean;
  price: number;
  image: string | null;
}

// Mock data para rifas
const mockRaffles: Raffle[] = [
  {
    id: 1,
    title: "Rifa Benéfica Colegio Goethe",
    description: "Participa en nuestra rifa anual para ayudar a recaudar fondos para mejoras en la infraestructura escolar. Los premios incluyen electrodomésticos de última generación, un viaje familiar a Europa, experiencias gastronómicas en los mejores restaurantes de la ciudad, y vouchers de compras. Tu participación contribuye directamente al desarrollo educativo de nuestros estudiantes, permitiendo la adquisición de nuevos equipos de laboratorio, mejoras en las aulas y espacios recreativos, y la implementación de programas educativos innovadores que beneficiarán a toda la comunidad estudiantil.",
    shortDescription: "Rifa anual para mejoras en la infraestructura escolar",
    drawDate: "2024-08-30",
    drawTime: "20:00",
    drawLocation: "Auditorio Principal Colegio Goethe",
    isOnline: false,
    price: 5000,
    image: null
  },
  {
    id: 2,
    title: "Rifa Virtual Día del Maestro",
    description: "Celebramos el Día del Maestro con una rifa especial virtual que reconoce la dedicación y esfuerzo de nuestros docentes. Los fondos recaudados serán destinados a la compra de material didáctico actualizado, tecnología educativa de vanguardia, y programas de capacitación profesional para nuestros maestros. Los premios incluyen tablets de última generación, bibliotecas de libros especializados, cursos de capacitación en metodologías innovadoras, y experiencias educativas. Este sorteo se realizará completamente en línea, con transmisión en vivo para que toda la comunidad pueda participar del evento.",
    shortDescription: "Rifa virtual en celebración del Día del Maestro",
    drawDate: "2024-09-11",
    drawTime: "19:00",
    drawLocation: null,
    isOnline: true,
    price: 3000,
    image: null
  },
  {
    id: 3,
    title: "Gran Rifa de Fin de Año",
    description: "Nuestra tradicional rifa de fin de año llega con los mejores premios del año. Esta es la rifa más esperada por toda la comunidad del Colegio Goethe, donde los premios incluyen electrodomésticos de última generación como smart TVs, refrigeradores inteligentes, equipos de sonido premium, un viaje familiar todo incluido a destinos internacionales, experiencias gastronómicas en restaurantes gourmet, y vouchers para compras en las mejores tiendas. Los fondos recaudados apoyan las actividades extracurriculares, programas deportivos, becas estudiantiles para el próximo año lectivo, y proyectos de mejora continua de nuestras instalaciones educativas.",
    shortDescription: "Rifa tradicional con los mejores premios del año",
    drawDate: "2024-12-15",
    drawTime: "21:00",
    drawLocation: "Salón de Actos Colegio Goethe",
    isOnline: false,
    price: 8000,
    image: null
  }
];

const RaffleDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const raffle = mockRaffles.find(r => r.id === parseInt(id || ''));
  
  if (!raffle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-12 text-center">
          <h1 className="text-2xl font-bold">Rifa no encontrada</h1>
          <Button asChild className="mt-4">
            <Link to="/rifas">Volver a Rifas</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `Gs. ${price.toLocaleString('es-ES')}`;
  };

  const updateQuantity = (change: number) => {
    const newQuantity = Math.max(0, quantity + change);
    setQuantity(newQuantity);
  };

  const getTotalPrice = () => {
    return raffle.price * quantity;
  };

  const handlePurchase = async () => {
    if (quantity === 0) {
      toast({
        title: "Selecciona al menos un número",
        description: "Debes seleccionar al menos un número para participar en la rifa.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simular proceso de compra
    setTimeout(() => {
      toast({
        title: "¡Compra exitosa!",
        description: `Has comprado ${quantity} número(s) para ${raffle.title}. Recibirás un correo de confirmación.`
      });
      setIsLoading(false);
      setQuantity(0);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/rifas" className="hover:text-foreground transition-colors">Rifas</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{raffle.title}</span>
          </nav>
          
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/rifas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Rifas
            </Link>
          </Button>
          
          {/* Header Card with Raffle Info */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(raffle.drawDate)}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    {raffle.title}
                  </h1>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <span>Sortea el {formatDate(raffle.drawDate)} a las {raffle.drawTime} hrs</span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <span className="truncate">Lugar de sorteo: {raffle.isOnline ? "Online" : raffle.drawLocation}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Raffle Description */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Acerca de la Rifa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {raffle.description}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Purchase Section */}
            <div className="space-y-6">
              
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Participar en la Rifa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg hover:border-primary/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">Número de Rifa</h4>
                        <span className="text-xl md:text-2xl font-bold text-primary">
                          {formatPrice(raffle.price)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 justify-center sm:justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(-1)}
                          disabled={quantity === 0}
                          className="h-8 w-8"
                        >
                          -
                        </Button>
                        
                        <span className="w-8 text-center font-semibold">
                          {quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(1)}
                          className="h-8 w-8"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Purchase Button */}
                  {quantity > 0 && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl md:text-2xl font-bold text-primary">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                      
                      <Button
                        onClick={handlePurchase}
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                      >
                        {isLoading ? "Procesando..." : "Comprar ahora"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default RaffleDetail;
