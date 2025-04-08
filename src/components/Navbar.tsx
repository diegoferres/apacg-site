
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle, Menu, X, School } from 'lucide-react';
import { useStore } from '@/stores/store';
import { api } from '@/services/api';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // This would come from your authentication context in a real app
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Setting to true for demo
  const [isLoading, setIsLoading] = useState(true); // Loading state for user data
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const location = useLocation();

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
    
    // fetchUser();
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
            <div className="flex items-center gap-2 text-primary">
              <School className="h-8 w-8" />
              <span className="font-bold text-xl hidden sm:inline">A.P.A.C. GOETHE</span>
            </div>
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
            {user &&user.id ? (
              <Button 
                asChild 
                variant={location.pathname === "/perfil" ? "default" : "ghost"} 
                className="gap-1"
              >
                <Link to="/perfil">
                  <UserCircle className="h-5 w-5 mr-1" />
                  Mi Perfil
                </Link>
              </Button>
            ) : (
              <Button 
                asChild 
                variant={location.pathname === "/login" ? "default" : "ghost"} 
                className="gap-1"
              >
                <Link to="/login">
                  <UserCircle className="h-5 w-5 mr-1" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
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
              {isLoggedIn ? (
                <Button 
                  asChild 
                  variant="default" 
                  className="w-full"
                >
                  <Link to="/perfil" onClick={() => setIsMenuOpen(false)}>
                    <UserCircle className="h-5 w-5 mr-2" />
                    Mi Perfil
                  </Link>
                </Button>
              ) : (
                <Button 
                  asChild 
                  variant="default" 
                  className="w-full"
                >
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <UserCircle className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
