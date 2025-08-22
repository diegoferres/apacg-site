import ReactGA from 'react-ga4';

// Tipos para eventos personalizados
interface EventParams {
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
  transport?: 'beacon' | 'xhr' | 'image';
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

  // Inicializar GA4
  initialize() {
    // Solo inicializar en producción o si hay un ID configurado
    const gaId = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-89V72T7N4S';
    
    if (!gaId || this.initialized) {
      return;
    }

    try {
      ReactGA.initialize(gaId, {
        gaOptions: {
          // Configuración adicional de GA4
          send_page_view: false, // Controlaremos manualmente los page views
        },
        gtagOptions: {
          // Modo debug en desarrollo
          debug_mode: import.meta.env.DEV,
        },
      });

      this.measurementId = gaId;
      this.initialized = true;

      // Enviar el primer page view
      this.trackPageView(window.location.pathname + window.location.search);

      console.log('Google Analytics 4 initialized with ID:', gaId);
    } catch (error) {
      console.error('Error initializing Google Analytics:', error);
    }
  }

  // Verificar si GA está inicializado
  isInitialized(): boolean {
    return this.initialized;
  }

  // Rastrear página vista
  trackPageView(path?: string) {
    if (!this.initialized) return;

    try {
      ReactGA.send({
        hitType: 'pageview',
        page: path || window.location.pathname + window.location.search,
        title: document.title,
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Rastrear evento personalizado
  trackEvent(eventName: string, parameters?: Record<string, any>) {
    if (!this.initialized) return;

    try {
      ReactGA.event(eventName, parameters);
    } catch (error) {
      console.error('Error tracking event:', error);
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

  // Búsqueda
  trackSearch(searchTerm: string) {
    this.trackEvent('search', {
      search_term: searchTerm,
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