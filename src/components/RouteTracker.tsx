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
  // Selectores granulares de Zustand — devuelven primitivos estables, no el objeto user entero.
  // Antes el dep `user` causaba re-fire del useEffect (y page_view duplicado) cada vez que el
  // store actualizaba referencia, aunque no cambiaran los campos relevantes.
  const userId = useStore((s) => s.user?.id);
  const isMember = useStore((s) => !!s.user?.member);
  const membershipStatus = useStore((s) => s.user?.member?.status);
  const studentsCount = useStore((s) => s.user?.member?.students?.length ?? 0);

  const previousPathRef = useRef<string>('');
  const pageStartTimeRef = useRef<number>(Date.now());

  // Effect 1 — identificación del usuario.
  // Se dispara solo cuando los datos del user realmente cambian (no en cada navegación).
  useEffect(() => {
    if (!analytics.isInitialized()) {
      analytics.initialize();
    }
    if (userId) {
      analytics.setUserId(userId);
      analytics.setUserProperties({
        user_type: isMember ? 'member' : 'guest',
        membership_status: membershipStatus,
        students_count: studentsCount,
      });
    }
  }, [userId, isMember, membershipStatus, studentsCount]);

  // Effect 2 — page tracking.
  // Solo depende de la ruta y los flags pasados como prop. NO depende de `user` —
  // cambiar status de membresía no causa page_view fantasma.
  useEffect(() => {
    if (!analytics.isInitialized()) {
      analytics.initialize();
    }

    const currentPath = location.pathname + location.search;
    const previousPath = previousPathRef.current;

    if (previousPath && previousPath !== currentPath) {
      const timeSpent = Date.now() - pageStartTimeRef.current;
      analytics.trackTimeOnPage(timeSpent, previousPath);
    }

    const title = generatePageTitle({
      path: location.pathname,
      searchParams,
      contentData,
      userType,
    });

    analytics.trackPageView({
      path: location.pathname,
      title,
      location: window.location.href,
      referrer: document.referrer,
      userType,
    });

    trackRouteSpecificEvents(location.pathname, searchParams, contentData);

    previousPathRef.current = currentPath;
    pageStartTimeRef.current = Date.now();
    document.title = title;
    // Dep `contentData` puede ser objeto inline del parent → re-fire por nueva ref aunque
    // el contenido no cambie. Hoy ningún caller pasa contentData, así que no es activo.
    // Si en el futuro algún caller lo pasa, conviene extraer primitivos (contentData?.title, etc.)
  }, [location.pathname, location.search, userType, contentData, searchParams]);

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