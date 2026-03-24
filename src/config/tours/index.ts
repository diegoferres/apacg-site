import type { DriveStep } from 'driver.js';

export const homeTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Bienvenido, Socio',
      description: 'Ahora que estás logueado, te mostramos las secciones donde podés aprovechar tus beneficios exclusivos.',
    },
  },
  {
    element: '#beneficios-section',
    popover: {
      title: 'Beneficios Exclusivos',
      description: 'Aquí encontrarás todos los descuentos y beneficios disponibles para socios activos en comercios adheridos.',
      side: 'top',
    },
  },
  {
    element: '#eventos-section',
    popover: {
      title: 'Eventos',
      description: 'Enterate de todos los eventos organizados por APACG. Podés comprar tus entradas directamente desde la web.',
      side: 'top',
    },
  },
  {
    element: '#cursos-section',
    popover: {
      title: 'Cursos',
      description: 'Explora los cursos disponibles para inscribir a tus hijos. Podés ver horarios, precios y realizar la inscripción online.',
      side: 'top',
    },
  },
  {
    element: '#rifas-section',
    popover: {
      title: 'Rifas',
      description: 'Participá en las rifas activas. Podés comprar tus números y seguir los sorteos desde aquí.',
      side: 'top',
    },
  },
  {
    element: '#comercios-section',
    popover: {
      title: 'Comercios Adheridos',
      description: 'Conocé todos los comercios que ofrecen descuentos especiales a socios de APACG.',
      side: 'top',
    },
  },
  {
    element: '#novedades-section',
    popover: {
      title: 'Novedades',
      description: 'Mantenete al día con las últimas noticias y novedades de la asociación.',
      side: 'top',
    },
  },
];

export const loginTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Iniciar Sesión',
      description: 'Para acceder a tu perfil de socio, carnet digital y beneficios exclusivos, necesitás iniciar sesión.',
    },
  },
  {
    element: '[data-tour="login-email"]',
    popover: {
      title: 'Tu Correo Electrónico',
      description: 'Ingresá el correo electrónico con el que te registraste como socio de APACG.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="login-password"]',
    popover: {
      title: 'Tu Contraseña',
      description: 'Ingresá tu contraseña. Si es tu primera vez, usá la contraseña que te enviaron por email.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="login-submit"]',
    popover: {
      title: 'Iniciar Sesión',
      description: 'Hacé click aquí para ingresar. Una vez dentro podrás ver tu carnet digital y el estado de tu membresía.',
      side: 'top',
    },
  },
  {
    element: '[data-tour="login-cedula"]',
    popover: {
      title: 'También podés usar tu Cédula',
      description: 'Si preferís, podés iniciar sesión con tu número de cédula en lugar del correo electrónico.',
      side: 'top',
    },
  },
];

export const profileTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Tu Perfil de Socio',
      description: 'Bienvenido a tu perfil. Acá vas a encontrar tu carnet digital, el estado de tu membresía y toda tu información como socio de APACG.',
    },
  },
  {
    element: '[data-tour="profile-card"]',
    popover: {
      title: 'Tu Carnet Digital con QR',
      description: 'Este es tu carnet de socio con código QR. Mostralo en los comercios adheridos para que validen tu membresía y te apliquen los descuentos.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="profile-membership"]',
    popover: {
      title: 'Estado de tu Membresía',
      description: 'Acá ves si tu membresía está activa y al día. Si tenés pagos pendientes, podés realizarlos directamente desde esta sección.',
      side: 'left',
    },
  },
];

export const benefitsTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Beneficios para Socios',
      description: 'Explorá todos los descuentos y beneficios exclusivos que tenés como socio activo de APACG.',
    },
  },
  {
    element: '[data-tour="benefits-search"]',
    popover: {
      title: 'Buscá Beneficios',
      description: 'Usá el buscador para encontrar beneficios por nombre, categoría o comercio.',
      side: 'bottom',
    },
  },
  {
    element: '[data-tour="benefits-list"]',
    popover: {
      title: 'Lista de Beneficios',
      description: 'Cada tarjeta muestra el descuento, el comercio que lo ofrece y los detalles. Hacé click para ver más información.',
      side: 'top',
    },
  },
];

export const eventsTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Eventos APACG',
      description: 'Aquí encontrarás todos los eventos organizados por la asociación.',
    },
  },
  {
    element: '[data-tour="events-list"]',
    popover: {
      title: 'Próximos Eventos',
      description: 'Cada evento muestra la fecha, lugar y precio. Hacé click en un evento para ver detalles y comprar entradas.',
      side: 'top',
    },
  },
];

export const rafflesTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Rifas APACG',
      description: 'Participá en las rifas de la asociación y ganá premios increíbles.',
    },
  },
  {
    element: '[data-tour="raffles-list"]',
    popover: {
      title: 'Rifas Disponibles',
      description: 'Cada rifa muestra el premio, precio del número y fecha de cierre. Hacé click para comprar tus números.',
      side: 'top',
    },
  },
];

export const coursesTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Cursos Disponibles',
      description: 'Explorá los cursos y talleres disponibles para inscribir a tus hijos.',
    },
  },
  {
    element: '[data-tour="courses-list"]',
    popover: {
      title: 'Lista de Cursos',
      description: 'Cada curso muestra horarios, edades, precios diferenciados para socios y la opción de inscribirse directamente.',
      side: 'top',
    },
  },
];
