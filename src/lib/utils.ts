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
  amount: number,
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

  // Validar que el amount es un número válido
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    return `${symbol} 0`
  }

  // Los guaraníes no usan decimales debido a la inflación
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: showDecimals ? 0 : 0,
    maximumFractionDigits: showDecimals ? 0 : 0
  }).format(Math.round(amount))

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
export function formatPrice(amount: number): string {
  return formatGuaraniPrice(amount, { symbol: '₲' })
}

/**
 * Formatea una fecha de manera segura evitando problemas de timezone
 * @param dateString - La fecha en formato ISO string, d-m-Y H:i:s, o null/undefined
 * @param options - Opciones de formateo
 * @returns La fecha formateada en español o "No definido" si es inválida
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

  if (!dateString || dateString === 'No definido' || dateString.trim() === '') {
    return 'No definido';
  }

  try {
    let date: Date;
    
    // Intentar diferentes formatos de fecha
    // Formato 1: "19-06-2025 20:36:52" (d-m-Y H:i:s)
    const dmyMatch = dateString.match(/(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/);
    if (dmyMatch) {
      const [_, day, month, year, hours = '0', minutes = '0', seconds = '0'] = dmyMatch;
      date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );
    } 
    // Formato 2: "2025-06-19 20:36:52" o "2025-06-19T20:36:52" (Y-m-d H:i:s o ISO)
    else {
      const ymdMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}):(\d{2}))?/);
      if (ymdMatch) {
        const [_, year, month, day, hours = '0', minutes = '0', seconds = '0'] = ymdMatch;
        date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );
      } else {
        // Intentar parsear como fecha ISO estándar
        date = new Date(dateString);
      }
    }
    
    if (isNaN(date.getTime())) {
      return 'No definido';
    }

    // Formatear según las opciones
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: format === 'long' ? 'long' : format === 'short' ? 'short' : '2-digit',
    };

    if (includeYear) {
      formatOptions.year = 'numeric';
    }

    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      formatOptions.hour12 = false; // 24-hour format
    }

    return includeTime ? date.toLocaleString('es-ES', formatOptions) : date.toLocaleDateString('es-ES', formatOptions);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'No definido';
  }
}
