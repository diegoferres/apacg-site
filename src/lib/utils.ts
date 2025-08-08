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
  
  // Limpiar HTML básico - en producción se debería usar una librería como DOMPurify
  const cleanHtml = htmlContent
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remover iframes
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+\s*=/gi, ''); // Remover event handlers
  
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
 * @param dateString - La fecha en formato ISO string o null/undefined
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
    // Check if it's a full datetime string (includes time)
    const datetimeMatch = dateString.match(/(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}:\d{2}))?/);
    if (!datetimeMatch) {
      return 'No definido';
    }

    const [year, month, day] = datetimeMatch[1].split('-').map(Number);
    let date = new Date(year, month - 1, day);

    // If time is present and includeTime is true, parse the full datetime
    if (includeTime && datetimeMatch[2]) {
      const [hours, minutes, seconds] = datetimeMatch[2].split(':').map(Number);
      date = new Date(year, month - 1, day, hours, minutes, seconds);
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
