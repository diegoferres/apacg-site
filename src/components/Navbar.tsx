
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserCircle, Menu, X, LogOut } from 'lucide-react';
import { useStore } from '@/stores/store';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
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

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await api.get('api/user');
  //       setUser(response.data);
  //       console.log(user);
  //     } catch (error) {
  //       console.error('Error fetching user:', error);
  //     }
  //   }

  //   if(!user) {
  //     fetchUser();
  //   }
  // }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Si falla (401, 404, etc), igual limpiamos la sesión local
      console.error('Error during logout:', error);
    } finally {
      // Siempre limpiamos el estado local y redirigimos
      setUser(null);
      localStorage.removeItem('auth_token');
      navigate('/');
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'glass-navbar py-2 shadow-sm' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 animate-fade-in">
            <div className="flex items-center gap-2 text-primary">
              <img src="/favicon-96x96.png" alt="Logo" className="h-14 w-12" />
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
            <Link
              to="/eventos"
              className="text-foreground/90 hover:text-foreground font-medium transition-colors"
            >
              Eventos
            </Link>
            <Link
              to="/rifas"
              className="text-foreground/90 hover:text-foreground font-medium transition-colors"
            >
              Rifas
            </Link>
            <Link
              to="/cursos"
              className="text-foreground/90 hover:text-foreground font-medium transition-colors"
            >
              Cursos
            </Link>
            <Link
              to="/novedades"
              className="text-foreground/90 hover:text-foreground font-medium transition-colors"
            >
              Novedades
            </Link>
            {user &&user.id ? (
              <>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
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

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            {user && user.id ? (
              <>
                <Button
                  asChild
                  variant={location.pathname === "/perfil" ? "default" : "ghost"}
                  className="gap-1"
                >
                  <Link to="/perfil" className="flex items-center">
                    <UserCircle className="h-5 w-5" />
                    <span className="ml-1 text-sm">
                      {user.name?.split(' ')[0] || 'Perfil'}
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button
                asChild
                variant={location.pathname === "/login" ? "default" : "ghost"}
                size="icon"
              >
                <Link to="/login">
                  <UserCircle className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <button
              className="text-foreground p-2 focus:outline-none"
              onClick={toggleMenu}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-navbar absolute top-full left-0 w-full py-4 animate-fade-in">
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
              <Link
                to="/eventos"
                className="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Eventos
              </Link>
              <Link
                to="/rifas"
                className="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Rifas
              </Link>
              <Link
                to="/cursos"
                className="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cursos
              </Link>
              <Link
                to="/novedades"
                className="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Novedades
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
