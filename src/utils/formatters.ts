/**
 * Formatear precio para mostrar en la UI
 * @param amount - Monto a formatear
 * @returns String formateado con separadores de miles
 */
export const formatPrice = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }
  
  return new Intl.NumberFormat('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(amount));
};

/**
 * Formatear precio con moneda (Gs.)
 * @param amount - Monto a formatear  
 * @returns String formateado con moneda
 */
export const formatPriceWithCurrency = (amount: number): string => {
  return `Gs. ${formatPrice(amount)}`;
};

/**
 * Formatear descuento según el tipo
 * @param discountType - Tipo de descuento ('percentage' | 'fixed')
 * @param discountValue - Valor del descuento
 * @returns String formateado del descuento
 */
export const formatDiscount = (discountType: 'percentage' | 'fixed', discountValue: number): string => {
  if (discountType === 'percentage') {
    return `${discountValue}%`;
  } else {
    return formatPriceWithCurrency(discountValue);
  }
};

/**
 * Formatear porcentaje
 * @param percentage - Porcentaje a formatear
 * @param decimals - Número de decimales (default: 1)
 * @returns String formateado del porcentaje
 */
export const formatPercentage = (percentage: number, decimals: number = 1): string => {
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formatear fecha para mostrar en la UI
 * @param date - Fecha a formatear
 * @returns String formateado de la fecha
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-PY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Formatear fecha con hora
 * @param date - Fecha a formatear
 * @returns String formateado de la fecha con hora
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-PY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Truncar texto con elipsis
 * @param text - Texto a truncar
 * @param length - Longitud máxima
 * @returns Texto truncado
 */
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
};