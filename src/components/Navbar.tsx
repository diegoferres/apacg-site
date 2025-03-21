
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle, Menu, X } from 'lucide-react';
import logoImage from '/lovable-uploads/12783fe6-2c65-4ec3-8910-9ab84189c032.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled ? 'glass py-2 shadow-sm' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 animate-fade-in">
            <img 
              src={logoImage} 
              alt="A.P.A.C. GOETHE" 
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-foreground/90 hover:text-foreground font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link 
              to="/beneficios" 
              className="text-foreground/90 hover:text-foreground font-medium transition-colors"
            >
              Beneficios
            </Link>
            <Link 
              to="/comercios" 
              className="text-foreground/90 hover:text-foreground font-medium transition-colors"
            >
              Comercios
            </Link>
            <Button asChild variant="ghost" className="gap-1">
              <Link to="/login">
                <UserCircle className="h-5 w-5 mr-1" />
                Iniciar Sesión
              </Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground p-2 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full py-4 animate-fade-in">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/beneficios" 
                className="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Beneficios
              </Link>
              <Link 
                to="/comercios" 
                className="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Comercios
              </Link>
              <Button asChild variant="default" className="w-full">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <UserCircle className="h-5 w-5 mr-2" />
                  Iniciar Sesión
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
