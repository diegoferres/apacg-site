
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Mock data para rifas
const mockRaffles = [
  {
    id: 1,
    title: "Rifa Benéfica Colegio Goethe",
    description: "Participa en nuestra rifa anual para ayudar a recaudar fondos para mejoras en la infraestructura escolar. Los premios incluyen electrodomésticos, viajes y experiencias únicas. Tu participación contribuye directamente al desarrollo educativo de nuestros estudiantes.",
    shortDescription: "Rifa anual para mejoras en la infraestructura escolar",
    drawDate: "2024-08-30",
    drawTime: "20:00",
    drawLocation: "Auditorio Principal Colegio Goethe",
    isOnline: false,
    price: 5000
  },
  {
    id: 2,
    title: "Rifa Virtual Día del Maestro",
    description: "Celebramos el Día del Maestro con una rifa especial virtual. Los fondos recaudados serán destinados a la compra de material didáctico y tecnología educativa para nuestros docentes. Premios incluyen tablets, libros y cursos de capacitación.",
    shortDescription: "Rifa virtual en celebración del Día del Maestro",
    drawDate: "2024-09-11",
    drawTime: "19:00",
    drawLocation: null,
    isOnline: true,
    price: 3000
  },
  {
    id: 3,
    title: "Gran Rifa de Fin de Año",
    description: "Nuestra tradicional rifa de fin de año con los mejores premios del año. Incluye electrodomésticos de última generación, un viaje familiar y experiencias gastronómicas. Los fondos recaudados apoyan las actividades extracurriculares y becas estudiantiles para el próximo año lectivo.",
    shortDescription: "Rifa tradicional con los mejores premios del año",
    drawDate: "2024-12-15",
    drawTime: "21:00",
    drawLocation: "Salón de Actos Colegio Goethe",
    isOnline: false,
    price: 8000
  }
];

const Raffles = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `Gs. ${price.toLocaleString('es-ES')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Rifas</span>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Rifas Disponibles
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Participa en nuestras rifas benéficas y ayuda a A.P.A.C. GOETHE mientras ganas increíbles premios
            </p>
          </div>
        </div>
      </section>

      {/* Raffles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockRaffles.map((raffle) => (
              <Card key={raffle.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(raffle.drawDate)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                    {raffle.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {raffle.shortDescription}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>Sortea el {formatDate(raffle.drawDate)} a las {raffle.drawTime} hrs</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    <span>Lugar de sorteo: {raffle.isOnline ? "Online" : raffle.drawLocation}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Precio</span>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(raffle.price)}
                      </p>
                    </div>
                    
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to={`/rifa/${raffle.id}`}>
                        Ver Detalles
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Raffles;
