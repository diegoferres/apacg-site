import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import analytics from '@/services/analytics';
import { generatePageTitle } from '@/utils/pageTitle';
import { useStore } from '@/stores/store';

interface RouteTrackerProps {
  userType?: 'guest' | 'member' | 'admin';
  contentData?: {
    title?: string;
    name?: string;
    commerce?: string;
    category?: string;
    type?: string;
  };
}

export const RouteTracker = ({ userType = 'guest', contentData }: RouteTrackerProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useStore();
  const previousPathRef = useRef<string>('');
  const pageStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Inicializar analytics si no está inicializado
    if (!analytics.isInitialized()) {
      analytics.initialize();
    }

    // Configurar propiedades del usuario si está logueado
    if (user) {
      analytics.setUserId(user.id);
      analytics.setUserProperties({
        user_type: user.member ? 'member' : 'guest',
        membership_status: user.member?.status,
        students_count: user.member?.students?.length || 0,
      });
    }

    const currentPath = location.pathname + location.search;
    const previousPath = previousPathRef.current;

    // Track tiempo en página anterior si hubo navegación
    if (previousPath && previousPath !== currentPath) {
      const timeSpent = Date.now() - pageStartTimeRef.current;
      analytics.trackTimeOnPage(timeSpent, previousPath);
    }

    // Generar título dinámico
    const title = generatePageTitle({
      path: location.pathname,
      searchParams,
      contentData,
      userType
    });

    // Track page view con título dinámico
    analytics.trackPageView({
      path: location.pathname,
      title,
      location: window.location.href,
      referrer: document.referrer,
      userType
    });

    // Track eventos específicos por ruta
    trackRouteSpecificEvents(location.pathname, searchParams, contentData);

    // Actualizar referencias para próxima navegación
    previousPathRef.current = currentPath;
    pageStartTimeRef.current = Date.now();

    // Actualizar título del documento
    document.title = title;

  }, [location.pathname, location.search, userType, contentData, searchParams, user]);

  return null;
};

// Función helper para eventos específicos por ruta
const trackRouteSpecificEvents = (
  pathname: string, 
  searchParams: URLSearchParams,
  contentData?: RouteTrackerProps['contentData']
) => {
  const search = searchParams.get('search');
  const categories = searchParams.get('categories');
  const page = searchParams.get('page');

  // Track búsquedas activas
  if (search && search.trim()) {
    const module = getModuleFromPath(pathname);
    analytics.trackSearch(search.trim(), module);
  }

  // Track filtros aplicados
  if (categories) {
    const categoryList = categories.split(',').filter(Boolean);
    if (categoryList.length > 0) {
      const module = getModuleFromPath(pathname);
      analytics.trackFilterApplied('category', categoryList, module);
    }
  }

  // Track cambios de página
  if (page && page !== '1') {
    const module = getModuleFromPath(pathname);
    analytics.trackPageChange(parseInt(page), 999, module); // 999 as placeholder for total pages
  }

  // Track visualización de contenido específico
  if (contentData) {
    trackContentView(pathname, contentData);
  }

  // Track eventos de conversión por ruta
  trackConversionEvents(pathname);
};

// Helper para determinar módulo desde path
const getModuleFromPath = (pathname: string): string => {
  if (pathname.startsWith('/beneficios') || pathname.startsWith('/beneficio/')) return 'benefits';
  if (pathname.startsWith('/comercios') || pathname.startsWith('/comercio/')) return 'commerces';
  if (pathname.startsWith('/eventos') || pathname.startsWith('/evento/')) return 'events';
  if (pathname.startsWith('/rifas') || pathname.startsWith('/rifa/')) return 'raffles';
  if (pathname.startsWith('/cursos') || pathname.startsWith('/curso/')) return 'courses';
  if (pathname.startsWith('/novedades') || pathname.startsWith('/novedad/')) return 'news';
  return 'general';
};

// Helper para track de visualización de contenido
const trackContentView = (pathname: string, contentData: RouteTrackerProps['contentData']) => {
  if (!contentData) return;

  const itemName = contentData.title || contentData.name || 'Unknown';
  const itemCategory = contentData.category || getModuleFromPath(pathname);

  if (pathname.startsWith('/beneficio/')) {
    analytics.trackViewItem(`benefit_${pathname.split('/').pop()}`, itemName, 'benefit');
  } else if (pathname.startsWith('/comercio/')) {
    analytics.trackViewItem(`commerce_${pathname.split('/').pop()}`, itemName, 'commerce');
  } else if (pathname.startsWith('/evento/')) {
    analytics.trackViewItem(`event_${pathname.split('/').pop()}`, itemName, 'event');
  } else if (pathname.startsWith('/rifa/')) {
    analytics.trackViewItem(`raffle_${pathname.split('/').pop()}`, itemName, 'raffle');
  } else if (pathname.startsWith('/curso/')) {
    analytics.trackViewItem(`course_${pathname.split('/').pop()}`, itemName, 'course');
  } else if (pathname.startsWith('/novedad/')) {
    analytics.trackViewItem(`news_${pathname.split('/').pop()}`, itemName, 'news');
  }
};

// Helper para eventos de conversión por ruta
const trackConversionEvents = (pathname: string) => {
  // Track páginas clave de conversión
  if (pathname === '/login') {
    analytics.trackEvent('visit_login_page');
  } else if (pathname === '/register') {
    analytics.trackEvent('visit_register_page');
  } else if (pathname === '/checkout') {
    analytics.trackEvent('visit_checkout_page');
  } else if (pathname === '/pago-membresia') {
    analytics.trackEvent('visit_membership_payment');
  } else if (pathname === '/inscripcion-alumnos') {
    analytics.trackEvent('visit_student_enrollment');
  } else if (pathname === '/pago-exitoso') {
    analytics.trackEvent('payment_success_page_view');
  }
};

export default RouteTracker;