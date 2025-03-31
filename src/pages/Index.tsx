
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import { Store, Tag, ArrowRight } from 'lucide-react';

// Mock data for benefits
const mockBenefits: Benefit[] = [
  {
    id: '1',
    title: 'Reintegro 20% en restaurantes y cafeterías los fines de semana',
    store: 'Café Milano',
    description: 'Obtén un reintegro del 20% en todas tus compras durante los fines de semana pagando con tarjeta de crédito asociada.',
    category: 'Restaurantes',
    validFrom: '2023-09-01',
    validTo: '2023-12-31',
    usageCount: 128,
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952'
  },
  {
    id: '2',
    title: 'Descuento del 15% en libros y materiales educativos',
    store: 'Librería Central',
    description: 'Descuento especial para miembros en todos los libros y materiales educativos presentando credencial.',
    category: 'Educación',
    validFrom: '2023-10-01',
    validTo: '2024-03-31',
    usageCount: 87,
    image: 'https://images.unsplash.com/photo-1486718448742-163732cd1544'
  },
  {
    id: '3',
    title: '2x1 en entradas para funciones de teatro y cine',
    store: 'Teatro Municipal',
    description: 'Dos entradas por el precio de una para cualquier función de lunes a jueves presentando identificación.',
    category: 'Entretenimiento',
    validFrom: '2023-08-15',
    validTo: '2023-11-30',
    usageCount: 215,
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901'
  },
  {
    id: '4',
    title: 'Consulta médica gratuita para socios',
    store: 'Centro Médico Salud',
    description: 'Una consulta médica general gratuita por mes para socios activos. Reserva previa obligatoria.',
    category: 'Salud',
    validFrom: '2023-07-01',
    validTo: '2024-06-30',
    usageCount: 56,
    image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716'
  },
  {
    id: '5',
    title: 'Descuento del 30% en cursos de idiomas',
    store: 'Instituto de Idiomas Global',
    description: 'Importante descuento en la inscripción a cursos regulares de cualquier idioma.',
    category: 'Educación',
    validFrom: '2023-11-01',
    validTo: '2024-02-28',
    usageCount: 41,
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21'
  },
  {
    id: '6',
    title: 'Descuento del 10% en todos los productos',
    store: 'Tienda Deportiva Runner',
    description: 'Descuento especial en toda la tienda para miembros de la asociación. No acumulable con otras promociones.',
    category: 'Tiendas',
    validFrom: '2023-09-15',
    validTo: '2024-01-15',
    usageCount: 103
  }
];

// Mock data for featured stores
const featuredStores = [
  { id: 's1', name: 'Café Milano', category: 'Restaurantes', benefitCount: 3 },
  { id: 's2', name: 'Librería Central', category: 'Educación', benefitCount: 2 },
  { id: 's3', name: 'Teatro Municipal', category: 'Entretenimiento', benefitCount: 4 },
  { id: 's4', name: 'Centro Médico Salud', category: 'Salud', benefitCount: 1 }
];

const Index = () => {
  const [filteredBenefits, setFilteredBenefits] = useState<Benefit[]>(mockBenefits);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (term: string, categories: string[]) => {
    const results = mockBenefits.filter(benefit => {
      const matchesSearch = term === '' || 
        benefit.title.toLowerCase().includes(term.toLowerCase()) ||
        benefit.store.toLowerCase().includes(term.toLowerCase()) ||
        benefit.description.toLowerCase().includes(term.toLowerCase());
      
      const matchesCategory = categories.length === 0 || 
        categories.includes(benefit.category);
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredBenefits(results);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 relative hero-gradient overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12 animate-fade-up">
            <Badge variant="outline" className="mb-4 py-1 px-3 bg-primary/5">
              Asociación de Padres y Amigos del Colegio
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Encuentra los mejores <span className="text-primary">beneficios</span> para vos
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Accedé a descuentos exclusivos y promociones especiales en diferentes comercios y servicios como miembro de A.P.A.C. GOETHE.
            </p>
            
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold animate-fade-up">
              Beneficios Destacados
            </h2>
            <Button variant="ghost" asChild className="gap-1 animate-fade-up">
              <Link to="/beneficios">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBenefits.slice(0, 6).map((benefit, index) => (
              <BenefitCard 
                key={benefit.id} 
                benefit={benefit} 
                delay={100 + index * 50} 
              />
            ))}
          </div>
          
          {filteredBenefits.length === 0 && (
            <div className="text-center py-12 animate-fade-up">
              <p className="text-muted-foreground">No se encontraron beneficios con los criterios seleccionados.</p>
              <Button 
                variant="outline" 
                onClick={() => handleSearch('', [])} 
                className="mt-4"
              >
                Restablecer búsqueda
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Featured Stores Section */}
      <section className="py-12 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 animate-fade-up">
            Comercios Destacados
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStores.map((store, index) => (
              <Link 
                key={store.id} 
                to={`/comercio/${store.id}`}
                className={`block p-6 bg-background rounded-lg border border-border/40 transition-all duration-300 hover:shadow-md hover:-translate-y-1 transform ${
                  isLoaded ? 'opacity-100' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{store.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {store.category}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {store.benefitCount} {store.benefitCount === 1 ? 'beneficio' : 'beneficios'} disponibles
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
