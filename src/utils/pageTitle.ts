// Sistema inteligente de títulos para GA4 tracking

interface PageTitleOptions {
  path: string;
  searchParams?: URLSearchParams;
  contentData?: {
    title?: string;
    name?: string;
    commerce?: string;
    category?: string;
    type?: string;
  };
  userType?: 'guest' | 'member' | 'admin';
}

export const generatePageTitle = (options: PageTitleOptions): string => {
  const { path, searchParams, contentData, userType } = options;
  const baseSite = 'APACG';
  
  // Función helper para capitalizar
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  
  // Rutas estáticas principales
  const staticRoutes: Record<string, string> = {
    '/': 'Inicio',
    '/beneficios': 'Beneficios',
    '/comercios': 'Comercios',
    '/eventos': 'Eventos',
    '/rifas': 'Rifas',
    '/cursos': 'Cursos',
    '/novedades': 'Novedades',
    '/login': 'Iniciar Sesión',
    '/register': 'Registro',
    '/perfil': 'Mi Perfil',
    '/pago-membresia': 'Pago de Membresía',
    '/inscripcion-alumnos': 'Inscripción de Alumnos',
    '/checkout': 'Checkout',
    '/pago': 'Procesando Pago',
    '/pago-exitoso': 'Pago Exitoso',
    '/reset-password': 'Recuperar Contraseña',
  };

  // Si es una ruta estática
  if (staticRoutes[path]) {
    let title = staticRoutes[path];
    
    // Agregar contexto de búsqueda/filtros si existe
    if (searchParams) {
      const search = searchParams.get('search');
      const categories = searchParams.get('categories');
      const page = searchParams.get('page');
      
      if (search && search.trim()) {
        title += ` - Búsqueda: "${search.trim()}"`;
      }
      
      if (categories) {
        const categoryList = categories.split(',').map(cat => capitalize(cat)).join(', ');
        title += ` - Categoría: ${categoryList}`;
      }
      
      if (page && page !== '1') {
        title += ` - Página ${page}`;
      }
    }
    
    // Agregar indicador de tipo de usuario
    if (userType === 'member') {
      title += ' - Miembro';
    }
    
    return `${title} - ${baseSite}`;
  }
  
  // Rutas dinámicas con slug
  if (path.startsWith('/beneficio/') && contentData) {
    const benefitName = contentData.title || contentData.name || 'Beneficio';
    const commerce = contentData.commerce ? ` - ${contentData.commerce}` : '';
    return `${benefitName}${commerce} - Beneficio - ${baseSite}`;
  }
  
  if (path.startsWith('/comercio/') && contentData) {
    const commerceName = contentData.name || contentData.title || 'Comercio';
    return `${commerceName} - Comercio - ${baseSite}`;
  }
  
  if (path.startsWith('/evento/') && contentData) {
    const eventName = contentData.title || contentData.name || 'Evento';
    return `${eventName} - Evento - ${baseSite}`;
  }
  
  if (path.startsWith('/rifa/') && contentData) {
    const raffleName = contentData.title || contentData.name || 'Rifa';
    return `${raffleName} - Rifa - ${baseSite}`;
  }
  
  if (path.startsWith('/curso/') && contentData) {
    const courseName = contentData.title || contentData.name || 'Curso';
    return `${courseName} - Curso - ${baseSite}`;
  }
  
  if (path.startsWith('/novedad/') && contentData) {
    const newsTitle = contentData.title || contentData.name || 'Novedad';
    return `${newsTitle} - Novedad - ${baseSite}`;
  }
  
  // Rutas especiales
  if (path.startsWith('/checkout/confirm/')) {
    return `Confirmación de Pago - ${baseSite}`;
  }
  
  // 404 y rutas no encontradas
  if (path === '*' || !path) {
    return `Página no encontrada - ${baseSite}`;
  }
  
  // Fallback genérico
  const pathSegments = path.split('/').filter(Boolean);
  const pageTitle = pathSegments.map(segment => 
    capitalize(segment.replace(/-/g, ' '))
  ).join(' - ');
  
  return `${pageTitle} - ${baseSite}`;
};

// Hook personalizado para manejar títulos
export const usePageTitle = (
  path: string,
  searchParams?: URLSearchParams,
  contentData?: PageTitleOptions['contentData'],
  userType?: PageTitleOptions['userType']
) => {
  const title = generatePageTitle({
    path,
    searchParams,
    contentData,
    userType
  });
  
  // Actualizar el título del documento
  if (typeof document !== 'undefined') {
    document.title = title;
  }
  
  return title;
};

// Función para generar metadatos SEO adicionales
export const generatePageMetadata = (title: string, path: string, contentData?: PageTitleOptions['contentData']) => {
  const baseDescription = 'Disfruta de descuentos exclusivos y promociones especiales en diferentes comercios y servicios como miembro de A.P.A.C. GOETHE.';
  
  let description = baseDescription;
  let keywords = 'descuentos, promociones, comercios, servicios, A.P.A.C. GOETHE';
  
  // Descripciones específicas por sección
  if (path.includes('beneficio')) {
    description = contentData?.name 
      ? `Aprovecha el beneficio "${contentData.name}" como miembro de APACG. ${baseDescription}`
      : `Descubre beneficios exclusivos para miembros de APACG. ${baseDescription}`;
    keywords += ', beneficios, descuentos comercios';
  } else if (path.includes('evento')) {
    description = contentData?.title 
      ? `Participa en "${contentData.title}" organizado por APACG. ${baseDescription}`
      : `Conoce los próximos eventos de APACG. ${baseDescription}`;
    keywords += ', eventos, actividades, comunidad';
  } else if (path.includes('curso')) {
    description = contentData?.title 
      ? `Inscríbete en el curso "${contentData.title}" de APACG. ${baseDescription}`
      : `Descubre los cursos disponibles en APACG. ${baseDescription}`;
    keywords += ', cursos, educación, capacitación';
  } else if (path.includes('rifa')) {
    description = contentData?.title 
      ? `Participa en la rifa "${contentData.title}" de APACG. ${baseDescription}`
      : `Conoce las rifas activas de APACG. ${baseDescription}`;
    keywords += ', rifas, sorteos, premios';
  }
  
  return {
    title,
    description,
    keywords
  };
};