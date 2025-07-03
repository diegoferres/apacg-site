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

  // Los guaraníes no usan decimales debido a la inflación
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: showDecimals ? 0 : 0,
    maximumFractionDigits: showDecimals ? 0 : 0
  }).format(Math.round(amount))

  return `${symbol} ${formattedAmount}`
}

/**
 * Formatea un precio usando el formato estándar del sistema
 * @param amount - El monto a formatear
 * @returns El precio formateado
 */
export function formatPrice(amount: number): string {
  return formatGuaraniPrice(amount, { symbol: '₲' })
}
