import ReactGA from 'react-ga4';

// Extender window para gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Tipos para eventos personalizados
interface EventParams {
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  transport?: 'beacon' | 'xhr' | 'image';
}

interface PageViewData {
  path: string;
  title: string;
  location: string;
  referrer?: string;
  userId?: string;
  userType?: string;
}

interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  currency?: string;
}

interface UserProperties {
  user_type?: 'member' | 'guest' | 'student';
  membership_status?: string;
  member_category?: string;
  students_count?: number;
}

class Analytics {
  private initialized = false;
  private measurementId: string = '';
  private debugMode = false;
  private eventQueue: Array<{ name: string; params: Record<string, unknown>; timestamp: number }> = [];

  // Inicializar GA4
  initialize() {
    const gaId = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-89V72T7N4S';
    this.debugMode = import.meta.env.DEV || window.location.hostname.includes('test');
    
    if (!gaId || this.initialized) {
      this.log('GA4 already initialized or no ID provided');
      return;
    }

    try {
      // Verificar si gtag está disponible
      if (typeof window.gtag === 'undefined') {
        this.log('Warning: gtag not found, initializing with react-ga4 only');
      }

      ReactGA.initialize(gaId, {
        gaOptions: {
          send_page_view: false, // Control manual de page views
        },
        gtagOptions: {
          debug_mode: this.debugMode,
        },
      });

      this.measurementId = gaId;
      this.initialized = true;

      this.log('Google Analytics 4 initialized successfully with ID:', gaId);
      this.log('Debug mode:', this.debugMode);
      
      // Procesar eventos en cola si los hay
      this.processEventQueue();
    } catch (error) {
      console.error('Error initializing Google Analytics:', error);
    }
  }

  // Sistema de logging condicional
  private log(...args: unknown[]) {
    if (this.debugMode) {
      console.log('[GA4]', ...args);
    }
  }

  // Procesar cola de eventos
  private processEventQueue() {
    if (this.eventQueue.length > 0) {
      this.log(`Processing ${this.eventQueue.length} queued events`);
      this.eventQueue.forEach(({ name, params }) => {
        this.trackEvent(name, params);
      });
      this.eventQueue = [];
    }
  }

  // Verificar si GA está inicializado
  isInitialized(): boolean {
    return this.initialized;
  }

  // Rastrear página vista con método híbrido
  trackPageView(pageData?: Partial<PageViewData>) {
    const data = {
      path: pageData?.path || window.location.pathname + window.location.search,
      title: pageData?.title || document.title,
      location: pageData?.location || window.location.href,
      referrer: pageData?.referrer || document.referrer,
      ...pageData
    };

    if (!this.initialized) {
      this.log('GA4 not initialized, queueing page view');
      this.eventQueue.push({
        name: 'page_view',
        params: data,
        timestamp: Date.now()
      });
      return;
    }

    try {
      // Método 1: gtag directo (preferido para page views)
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', this.measurementId, {
          page_title: data.title,
          page_location: data.location,
          page_path: data.path,
          custom_map: {
            dimension1: data.userType || 'guest'
          }
        });
        
        this.log('Page view tracked via gtag:', data);
      } else {
        // Método 2: react-ga4 como fallback
        ReactGA.send({
          hitType: 'pageview',
          page: data.path,
          title: data.title,
          location: data.location
        });
        
        this.log('Page view tracked via react-ga4:', data);
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
      
      // Retry con react-ga4
      try {
        ReactGA.send({
          hitType: 'pageview',
          page: data.path,
          title: data.title
        });
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
  }

  // Rastrear evento personalizado con método híbrido
  trackEvent(eventName: string, parameters?: Record<string, unknown>) {
    if (!this.initialized) {
      this.log('GA4 not initialized, queueing event:', eventName);
      this.eventQueue.push({
        name: eventName,
        params: parameters,
        timestamp: Date.now()
      });
      return;
    }

    try {
      // Método 1: gtag directo (más confiable)
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', eventName, parameters);
        this.log('Event tracked via gtag:', eventName, parameters);
      } else {
        // Método 2: react-ga4 como fallback
        ReactGA.event(eventName, parameters);
        this.log('Event tracked via react-ga4:', eventName, parameters);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
      
      // Retry con react-ga4
      try {
        ReactGA.event(eventName, parameters);
      } catch (retryError) {
        console.error('Event retry failed:', retryError);
      }
    }
  }

  // === EVENTOS ESPECÍFICOS DE INTERACCIÓN ===

  // Tracking de búsquedas
  trackSearch(searchTerm: string, module: string, resultsCount?: number) {
    this.trackEvent('search', {
      search_term: searchTerm,
      content_type: module,
      results_count: resultsCount,
      search_location: window.location.pathname
    });
  }

  // Tracking de filtros aplicados
  trackFilterApplied(filterType: string, filterValues: string[], module: string) {
    this.trackEvent('filter_applied', {
      filter_type: filterType,
      filter_values: filterValues.join(','),
      content_type: module,
      filter_location: window.location.pathname
    });
  }

  // Tracking de clicks en cards/items
  trackItemClick(itemId: string, itemName: string, itemType: string, position: number, listName?: string) {
    this.trackEvent('select_content', {
      content_type: itemType,
      item_id: itemId,
      item_name: itemName,
      item_position: position,
      item_list_name: listName || `${itemType}_list`
    });
  }

  // Tracking de paginación
  trackPageChange(newPage: number, totalPages: number, module: string) {
    this.trackEvent('page_change', {
      page_number: newPage,
      total_pages: totalPages,
      content_type: module,
      page_location: window.location.pathname
    });
  }

  // Tracking de tiempo en página (para análisis de engagement)
  trackTimeOnPage(timeSpent: number, pagePath: string) {
    // Solo trackear si el tiempo es significativo (más de 10 segundos)
    if (timeSpent > 10000) {
      this.trackEvent('page_engagement', {
        engagement_time_msec: timeSpent,
        page_path: pagePath,
        engagement_category: timeSpent > 60000 ? 'high' : timeSpent > 30000 ? 'medium' : 'low'
      });
    }
  }

  // Configurar propiedades del usuario
  setUserProperties(properties: UserProperties) {
    if (!this.initialized) return;

    try {
      ReactGA.gtag('set', 'user_properties', properties);
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  // Establecer ID de usuario (para tracking cross-device)
  setUserId(userId: string | number) {
    if (!this.initialized) return;

    try {
      ReactGA.gtag('config', this.measurementId, {
        user_id: userId.toString(),
      });
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  // === EVENTOS DE CONVERSIÓN ===

  // Registro de usuario
  trackSignUp(method: string = 'email') {
    this.trackEvent('sign_up', { method });
  }

  // Login de usuario
  trackLogin(method: string = 'email') {
    this.trackEvent('login', { method });
  }

  // Inicio de checkout
  trackBeginCheckout(value: number, items: EcommerceItem[], currency: string = 'PYG') {
    this.trackEvent('begin_checkout', {
      value,
      currency,
      items,
    });
  }

  // Compra completada
  trackPurchase(transactionId: string, value: number, items: EcommerceItem[], currency: string = 'PYG') {
    this.trackEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  }

  // === EVENTOS DE INTERACCIÓN ===

  // Ver item (beneficio, comercio, evento, etc)
  trackViewItem(itemId: string, itemName: string, itemCategory: string, value?: number) {
    this.trackEvent('view_item', {
      currency: 'PYG',
      value: value || 0,
      items: [{
        item_id: itemId,
        item_name: itemName,
        item_category: itemCategory,
      }],
    });
  }

  // Seleccionar contenido
  trackSelectContent(contentType: string, itemId: string) {
    this.trackEvent('select_content', {
      content_type: contentType,
      item_id: itemId,
    });
  }

  // Compartir
  trackShare(method: string, contentType: string, itemId: string) {
    this.trackEvent('share', {
      method,
      content_type: contentType,
      item_id: itemId,
    });
  }

  // === EVENTOS ESPECÍFICOS DE APACG ===

  // Inscripción a curso
  trackCourseEnrollment(courseId: string, courseName: string, value: number) {
    this.trackEvent('course_enrollment', {
      course_id: courseId,
      course_name: courseName,
      value,
      currency: 'PYG',
    });
  }

  // Compra de tickets para evento
  trackTicketPurchase(eventId: string, eventName: string, quantity: number, value: number) {
    this.trackEvent('ticket_purchase', {
      event_id: eventId,
      event_name: eventName,
      quantity,
      value,
      currency: 'PYG',
    });
  }

  // Inscripción a sorteo
  trackRaffleEntry(raffleId: string, raffleName: string) {
    this.trackEvent('raffle_entry', {
      raffle_id: raffleId,
      raffle_name: raffleName,
    });
  }

  // Uso de beneficio
  trackBenefitUse(benefitId: string, benefitName: string, commerceName: string) {
    this.trackEvent('benefit_use', {
      benefit_id: benefitId,
      benefit_name: benefitName,
      commerce_name: commerceName,
    });
  }

  // Agregar estudiante
  trackAddStudent(studentCount: number) {
    this.trackEvent('add_student', {
      student_count: studentCount,
    });
  }

  // === EVENTOS DE FORMULARIO ===

  // Envío de formulario genérico
  trackFormSubmit(formName: string, formId?: string) {
    this.trackEvent('form_submit', {
      form_name: formName,
      form_id: formId,
    });
  }

  // Error en formulario
  trackFormError(formName: string, errorMessage: string) {
    this.trackEvent('form_error', {
      form_name: formName,
      error_message: errorMessage,
    });
  }

  // === TIMING EVENTS ===

  // Medir tiempo en página
  trackTiming(category: string, variable: string, value: number, label?: string) {
    if (!this.initialized) return;

    try {
      ReactGA.gtag('event', 'timing_complete', {
        name: variable,
        value,
        event_category: category,
        event_label: label,
      });
    } catch (error) {
      console.error('Error tracking timing:', error);
    }
  }

  // === EXCEPCIONES ===

  // Rastrear errores/excepciones
  trackException(description: string, fatal: boolean = false) {
    if (!this.initialized) return;

    try {
      ReactGA.gtag('event', 'exception', {
        description,
        fatal,
      });
    } catch (error) {
      console.error('Error tracking exception:', error);
    }
  }
}

// Exportar instancia única
const analytics = new Analytics();
export default analytics;