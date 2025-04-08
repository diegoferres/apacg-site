
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import BenefitCard, { Benefit } from '@/components/BenefitCard';
import { Store, Tag, ArrowRight } from 'lucide-react';
import { api } from '@/services/api'; // Adjust the import path as necessary
import CommerceCard from '@/components/CommerceCard';
import { useStore } from '@/stores/store';


const Index = () => {
  const [filteredBenefits, setFilteredBenefits] = useState<Benefit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuredCommerces, setFeaturedCommerces] = useState<[]>([]); // Adjust type as necessary
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    // Simulate loading
    // const timer = setTimeout(() => {
    //   setIsLoaded(true);
    // }, 300);

    // return () => clearTimeout(timer);
    const fetchUser = async () => {
      try {
        const response = await api.get('api/user');
        setUser(response.data);
        console.log(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    const fetchBenefits = async () => {
      try {
        const response = await api.get('api/client/benefits/list');

        setFilteredBenefits(response.data.data.data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching benefits:', error);
      }
    }

    const fetchCommerces = async () => {
      try {
        const response = await api.get('api/client/commerces/list');

        // Assuming the response contains a list of featured stores
        // setFeaturedStores(response.data.data.data);
        setFeaturedCommerces(response.data.data.data);
        setIsLoaded(true);  
      } catch (error) {
        console.error('Error fetching commerces:', error);
      }
    }

    fetchUser();
    fetchBenefits();
    fetchCommerces();
  }, []);

  // const handleSearch = (term: string, categories: string[]) => {
  //   const results = mockBenefits.filter(benefit => {
  //     const matchesSearch = term === '' || 
  //       benefit.title.toLowerCase().includes(term.toLowerCase()) ||
  //       benefit.store.toLowerCase().includes(term.toLowerCase()) ||
  //       benefit.description.toLowerCase().includes(term.toLowerCase());
      
  //     const matchesCategory = categories.length === 0 || 
  //       categories.includes(benefit.category);
      
  //     return matchesSearch && matchesCategory;
  //   });
    
  //   setFilteredBenefits(results);
  // };

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
            
            {/* <SearchBar onSearch={handleSearch} /> */}
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
            {filteredBenefits.map((benefit, index) => (
              <BenefitCard 
                key={benefit.id} 
                benefit={benefit} 
                delay={100 + index * 50} 
              />
            ))}
          </div>
          
          {/* {filteredBenefits.length === 0 && (
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
          )} */}
        </div>
      </section>
      
      {/* Featured Stores Section */}
      <section className="py-12 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 animate-fade-up">
            Comercios Destacados
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCommerces.map((commerce, index) => (            
                <CommerceCard
                  commerce={commerce} 
                  delay={100 + index * 50}
                />
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
