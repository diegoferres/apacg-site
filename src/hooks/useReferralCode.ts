import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const REFERRAL_STORAGE_KEY = 'referral_code';

// Ventana de atribución del link de referido de socio (rifas).
//
// El código capturado via ?ref= se guarda con un vencimiento en vez de
// persistir indefinidamente. Sin esto, alguien que entra por el link de un
// socio en marzo y recién compra en agosto le imputaría la venta a ese socio
// sin ninguna relación real con la decisión de compra.
//
// 30 días es el estándar de facto en programas de afiliados/referidos
// (ventana de atribución "last click"): suficiente para cubrir una decisión
// de compra no inmediata, sin arrastrar atribuciones viejas indefinidamente.
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredReferral {
  code: string;
  expiresAt: number;
}

function readStoredReferral(): StoredReferral | null {
  const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredReferral;
    if (!parsed?.code || !parsed?.expiresAt) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      // Vencido: se descarta, no se imputa la compra a un link viejo.
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    // Formato viejo (string plano sin expiración) o corrupto: descartar.
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    return null;
  }
}

/** Código de referido vigente (no vencido), o null si no hay / venció. */
export function getReferralCode(): string | null {
  return readStoredReferral()?.code ?? null;
}

/** Limpia el código de referido guardado. Llamar al usarlo, al fallar o al abandonar el pago. */
export function clearReferralCode(): void {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
}

function storeReferralCode(code: string): void {
  const value: StoredReferral = { code, expiresAt: Date.now() + REFERRAL_TTL_MS };
  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(value));
}

/**
 * Detecta y persiste el `?ref=` de la URL (con vencimiento).
 *
 * Uso exclusivo de páginas de RIFA: el link de referido de socio hoy solo
 * aplica a rifas (ver contrato de backend). No usar en eventos.
 */
export function useReferralCode(): void {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const referralCode = searchParams.get('ref');
    if (referralCode) {
      storeReferralCode(referralCode);

      toast({
        title: "¡Link de referido activado!",
        description: "Esta compra será acreditada al socio que compartió el link.",
        className: "bg-green-50 border-green-200",
      });
    }
  }, [searchParams, toast]);
}
