import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio en guaraníes paraguayos (PYG)
 * @param amount - El monto a formatear
 * @param options - Opciones de formateo
 * @returns El precio formateado con el símbolo de guaraní
 */
export function formatGuaraniPrice(
  amount: number | string,
  options: {
    symbol?: '₲' | 'Gs.' | 'Gs'
    showDecimals?: boolean
    locale?: string
  } = {}
): string {
  const {
    symbol = '₲',
    showDecimals = false,
    locale = 'es-PY'
  } = options

  // Convertir string a número si es necesario
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Validar que el amount es un número válido
  if (typeof numericAmount !== 'number' || isNaN(numericAmount) || numericAmount < 0) {
    return `${symbol} 0`
  }

  // Los guaraníes no usan decimales debido a la inflación
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: showDecimals ? 0 : 0,
    maximumFractionDigits: showDecimals ? 0 : 0
  }).format(Math.round(numericAmount))

  return `${symbol} ${formattedAmount}`
}

/**
 * Convierte un valor a número de forma segura, manejando null, undefined y strings
 * @param value - El valor a convertir
 * @returns El número convertido o 0 si no es válido
 */
export function toNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  
  // If it's already a number, return it
  if (typeof value === 'number') return value;
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
  }
  
  // For other types, try Number conversion
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Renderiza HTML de forma segura para contenido de texto enriquecido
 * @param htmlContent - El contenido HTML a renderizar
 * @returns Objeto con __html para dangerouslySetInnerHTML
 */
export function renderSafeHtml(htmlContent: string): { __html: string } {
  if (!htmlContent) return { __html: '' };
  
  // Sanitizar HTML manteniendo tags seguros
  let cleanHtml = htmlContent
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remover iframes
    .replace(/<object[^>]*>.*?<\/object>/gi, '') // Remover object
    .replace(/<embed[^>]*>/gi, '') // Remover embed
    .replace(/<applet[^>]*>.*?<\/applet>/gi, '') // Remover applet
    .replace(/<meta[^>]*>/gi, '') // Remover meta tags
    .replace(/<link[^>]*>/gi, '') // Remover link tags
    .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remover style tags
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+\s*=/gi, ''); // Remover event handlers
  
  // Permitir solo tags HTML seguros
  const allowedTags = [
    'p', 'div', 'span', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'mark',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'a', 'img',
    'blockquote', 'q', 'cite', 'code', 'pre',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'sup', 'sub', 'small', 'del', 'ins', 'kbd', 'var', 'samp'
  ];
  
  // Remover atributos peligrosos de tags permitidos
  allowedTags.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*)>`, 'gi');
    cleanHtml = cleanHtml.replace(regex, (match, attributes) => {
      // Limpiar atributos peligrosos pero mantener los seguros
      const cleanedAttrs = attributes
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remover event handlers
        .replace(/javascript:/gi, '') // Remover javascript: en hrefs
        .replace(/style\s*=\s*["'][^"']*["']/gi, (styleMatch: string) => {
          // Permitir estilos seguros pero remover javascript
          if (styleMatch.toLowerCase().includes('javascript') || 
              styleMatch.toLowerCase().includes('expression')) {
            return '';
          }
          return styleMatch;
        });
      return `<${tag}${cleanedAttrs}>`;
    });
  });
  
  return { __html: cleanHtml };
}

/**
 * Formatea un precio usando el formato estándar del sistema
 * @param amount - El monto a formatear
 * @returns El precio formateado
 */
/**
 * Remueve tags HTML de un string, retornando solo el texto plano
 */
export const removeHTMLTags = (text: string): string => {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || "";
};

export function formatPrice(amount: number | string): string {
  return formatGuaraniPrice(amount, { symbol: '₲' })
}

/**
 * Formatea una fecha respetando timezone Paraguay (UTC-4).
 *
 * Reglas:
 * - Backend Laravel serializa timestamps en UTC con sufijo `Z` (ej. "2026-06-02T00:29:00.000000Z").
 * - Si `includeTime`, convertimos a hora local de Paraguay (`America/Asuncion`).
 * - Si NO `includeTime` (date-only), mostramos los componentes UTC tal cual los guardó el admin
 *   (sino una fecha guardada como "2026-06-26" UTC se vería como "25/06/2026" en PY).
 * - Formato legacy `d-m-Y H:i:s` se asume ya en hora Paraguay → preservamos componentes via UTC.
 *
 * @param dateString - Fecha ISO 8601, "Y-m-d H:i:s", "d-m-Y H:i:s", o null/undefined
 * @param options - Opciones de formateo
 * @returns Fecha formateada en español o "No definido" si es inválida
 */
export function formatDate(
  dateString: string | null | undefined,
  options: {
    format?: 'long' | 'short' | 'medium'
    includeYear?: boolean
    includeTime?: boolean
  } = {}
): string {
  const { format = 'long', includeYear = true, includeTime = false } = options;

  if (!dateString || dateString === 'No definido' || (typeof dateString === 'string' && dateString.trim() === '')) {
    return 'No definido';
  }

  try {
    let date: Date;
    // `legacyLocal=true` indica que el input ya viene formateado en hora Paraguay.
    // Para preservar los componentes tal cual, construimos como UTC y formateamos en UTC.
    let legacyLocal = false;

    // Formato legacy: "19-06-2025 20:36:52" (d-m-Y H:i:s, hora Paraguay)
    const dmyMatch = String(dateString).match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/);
    if (dmyMatch) {
      const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = dmyMatch;
      date = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds),
      ));
      legacyLocal = true;
    } else {
      // ISO 8601, "Y-m-d H:i:s" sin TZ, o "Y-m-d" date-only.
      const normalized = String(dateString).trim().replace(' ', 'T');
      const hasTime = normalized.includes('T');
      const hasTz = /[Zz]|[+-]\d{2}:?\d{2}$/.test(normalized);
      // Si tiene componente de hora pero no TZ → asumir UTC (convención Laravel).
      // Si es date-only ("2026-06-26") → new Date() lo interpreta como UTC midnight por spec.
      // Si tiene TZ → confiamos en el parse nativo.
      date = hasTime && !hasTz ? new Date(normalized + 'Z') : new Date(normalized);
    }

    if (isNaN(date.getTime())) {
      return 'No definido';
    }

    // Timezone para display:
    // - Datetime "real" (includeTime, no legacy) → hora Paraguay
    // - Date-only o legacy → preservar componentes UTC (= calendar date que guardó el admin)
    const displayTimezone = legacyLocal || !includeTime ? 'UTC' : 'America/Asuncion';

    const formatOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: format === 'long' ? 'long' : format === 'short' ? 'short' : '2-digit',
      timeZone: displayTimezone,
    };

    if (includeYear) {
      formatOptions.year = 'numeric';
    }

    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      formatOptions.hour12 = false;
    }

    const formatted = includeTime
      ? date.toLocaleString('es-ES', formatOptions)
      : date.toLocaleDateString('es-ES', formatOptions);

    if (format === 'short') {
      return formatted.replace(/\./g, '');
    }

    return formatted;
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'No definido';
  }
}
