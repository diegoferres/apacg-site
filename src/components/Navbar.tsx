
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '/logo.png';
import { Button } from '@/components/ui/button';
import { UserCircle, Menu, X, LogOut } from 'lucide-react';
import { useStore } from '@/stores/store';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';
import CartDrawer from '@/components/CartDrawer';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  // El navbar es fixed, asi que las paginas tienen que reservar su alto. En vez de que cada
  // una hardcodee un valor (que se desfasa cuando el navbar cambia de alto: al scrollear, con
  // sesion iniciada, o si el contenido envuelve en pantallas angostas), publicamos el alto real
  // en --navbar-h y las paginas lo consumen.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publicar = () => {
      document.documentElement.style.setProperty('--navbar-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    };
    publicar();
    // border-box: el alto cambia tambien por el padding (py-3 -> py-4 en md, py-2 al scrollear),
    // y el content-box por si solo no refleja ese cambio.
    const ro = new ResizeObserver(publicar);
    ro.observe(el, { box: 'border-box' });
    window.addEventListener('resize', publicar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', publicar);
    };
  }, []);

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

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `font-medium transition-colors ${
      isActiveLink(path)
        ? 'text-primary'
        : 'text-foreground/90 hover:text-foreground'
    }`;

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
      ref={headerRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'glass-navbar py-2 shadow-sm' : 'py-3 md:py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 animate-fade-in shrink-0">
            <div className="flex items-center gap-2 text-primary">
              <img src={logoImg} alt="Logo" className="h-11 w-10 md:h-14 md:w-12" />
            </div>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={navLinkClass('/')}>
              Inicio
            </Link>
            <Link to="/beneficios" className={navLinkClass('/beneficios')}>
              Beneficios
            </Link>
            <Link to="/comercios" className={navLinkClass('/comercios')}>
              Comercios
            </Link>
            <Link to="/eventos" className={navLinkClass('/eventos')}>
              Eventos
            </Link>
            <Link to="/rifas" className={navLinkClass('/rifas')}>
              Rifas
            </Link>
            <Link to="/cursos" className={navLinkClass('/cursos')}>
              Cursos
            </Link>
            <Link to="/novedades" className={navLinkClass('/novedades')}>
              Novedades
            </Link>
            <Link to="/productos" className={navLinkClass('/productos')}>
              Tienda
            </Link>
            <CartDrawer />
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
          <div className="md:hidden flex min-w-0 items-center gap-1">
            <CartDrawer />
            {user && user.id ? (
              <>
                <Button
                  asChild
                  variant={location.pathname === "/perfil" ? "default" : "ghost"}
                  className="min-w-0 gap-1 px-2"
                >
                  {/* El nombre se trunca: si envuelve, el navbar crece y empuja el contenido
                      de todas las paginas hacia abajo. */}
                  <Link to="/perfil" className="flex min-w-0 items-center">
                    <UserCircle className="h-5 w-5 shrink-0" />
                    <span className="ml-1 max-w-[5.5rem] truncate text-sm">
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
              <Link to="/" className={`${navLinkClass('/')} py-2`} onClick={() => setIsMenuOpen(false)}>
                Inicio
              </Link>
              <Link to="/beneficios" className={`${navLinkClass('/beneficios')} py-2`} onClick={() => setIsMenuOpen(false)}>
                Beneficios
              </Link>
              <Link to="/comercios" className={`${navLinkClass('/comercios')} py-2`} onClick={() => setIsMenuOpen(false)}>
                Comercios
              </Link>
              <Link to="/eventos" className={`${navLinkClass('/eventos')} py-2`} onClick={() => setIsMenuOpen(false)}>
                Eventos
              </Link>
              <Link to="/rifas" className={`${navLinkClass('/rifas')} py-2`} onClick={() => setIsMenuOpen(false)}>
                Rifas
              </Link>
              <Link to="/cursos" className={`${navLinkClass('/cursos')} py-2`} onClick={() => setIsMenuOpen(false)}>
                Cursos
              </Link>
              <Link to="/novedades" className={`${navLinkClass('/novedades')} py-2`} onClick={() => setIsMenuOpen(false)}>
                Novedades
              </Link>
              <Link to="/productos" className={`${navLinkClass('/productos')} py-2`} onClick={() => setIsMenuOpen(false)}>
                Tienda
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
