import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Store, Calendar, GraduationCap, Ticket, Building2, FileText } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  sectionId: string;
}

const navItems: NavItem[] = [
  {
    id: 'beneficios',
    label: 'Beneficios',
    icon: Store,
    sectionId: 'beneficios-section'
  },
  {
    id: 'eventos',
    label: 'Eventos',
    icon: Calendar,
    sectionId: 'eventos-section'
  },
  {
    id: 'cursos',
    label: 'Cursos',
    icon: GraduationCap,
    sectionId: 'cursos-section'
  },
  {
    id: 'rifas',
    label: 'Rifas',
    icon: Ticket,
    sectionId: 'rifas-section'
  },
  {
    id: 'comercios',
    label: 'Comercios',
    icon: Building2,
    sectionId: 'comercios-section'
  },
  {
    id: 'novedades',
    label: 'Noticias',
    icon: FileText,
    sectionId: 'novedades-section'
  }
];

const QuickNav = () => {
  const [activeSection, setActiveSection] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 120; // Account for sticky header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const centerActiveButton = (activeId: string) => {
    const container = scrollContainerRef.current;
    const button = buttonRefs.current[activeId];
    
    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      const containerCenter = containerRect.width / 2;
      const buttonCenter = buttonRect.left - containerRect.left + buttonRect.width / 2;
      
      const scrollLeft = container.scrollLeft + buttonCenter - containerCenter;
      
      // Ensure we don't scroll beyond boundaries
      const maxScroll = container.scrollWidth - container.clientWidth;
      const finalScrollLeft = Math.max(0, Math.min(scrollLeft, maxScroll));
      
      container.scrollTo({
        left: finalScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for header

      for (const item of navItems) {
        const section = document.getElementById(item.sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            if (activeSection !== item.id) {
              setActiveSection(item.id);
              // Small delay to ensure DOM updates before centering
              setTimeout(() => centerActiveButton(item.id), 100);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 md:hidden">
      <div className="container mx-auto px-4 py-3">
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                ref={(el) => buttonRefs.current[item.id] = el}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => scrollToSection(item.sectionId)}
                className="flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all duration-200"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Fade edges for horizontal scroll */}
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-background/95 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background/95 to-transparent pointer-events-none" />
    </div>
  );
};

export default QuickNav;