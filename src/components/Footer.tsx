
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-secondary/50 border-t border-border/40 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold">A.P.A.C. GOETHE</h3>
            <p className="text-muted-foreground text-sm">
              Asociación dedicada a proporcionar beneficios exclusivos para sus miembros a través de alianzas con comercios y establecimientos.
            </p>
          </div>
          
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Inicio
              </Link>
              <Link to="/beneficios" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Beneficios
              </Link>
              <Link to="/comercios" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Comercios
              </Link>
              <Link to="/login" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Iniciar Sesión
              </Link>
            </nav>
          </div>
          
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <nav className="flex flex-col space-y-3">
              <Link to="/terminos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/contacto" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Contacto
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="border-t border-border/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {currentYear} A.P.A.C. GOETHE. Todos los derechos reservados.</p>
          <p className="mt-4 md:mt-0 flex items-center">
            <span className="font-bold">Desarrollado por</span> <a className='font-bold ml-1' target='_blank' href="https://180softlab.com">180SoftLab</a> 
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
