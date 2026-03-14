import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CouponPersistenceService } from '../services/CouponPersistenceService';
import api from '../services/api';

export interface CouponPreview {
  id: number;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_recurring?: boolean;
}

export interface CouponPricing {
  // Para compatibilidad con eventos/productos
  original_price?: number;
  discount_amount?: number;
  final_price?: number;
  discount_percentage: number;
  
  // Para cursos - matrícula
  enrollment_fee_original?: number;
  enrollment_fee_discounted?: number;
  enrollment_discount_amount?: number;
  
  // Para cursos - mensualidad
  monthly_fee_original?: number;
  monthly_fee_discounted?: number;
  monthly_discount_amount?: number;
  
  // Para cursos - totales
  total_original?: number;
  total_discounted?: number;
  total_discount_amount?: number;
}

export interface AppliedCoupon {
  coupon: CouponPreview;
  pricing: CouponPricing;
  valid: boolean;
  timestamp: number;
}

export type CouponStatus = 'none' | 'loading' | 'valid' | 'invalid' | 'error';

export interface UseUrlCouponProps {
  itemType: 'course' | 'event' | 'product';
  itemId: number;
  autoApply?: boolean;
}

export interface UseUrlCouponReturn {
  urlCoupon: string | null;
  appliedCoupon: AppliedCoupon | null;
  status: CouponStatus;
  error: string | null;
  removeCoupon: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  isLoading: boolean;
}

export const useUrlCoupon = ({ 
  itemType, 
  itemId, 
  autoApply = true 
}: UseUrlCouponProps): UseUrlCouponReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [urlCoupon, setUrlCoupon] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [status, setStatus] = useState<CouponStatus>('none');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detectar cupón en URL al montar el componente
  useEffect(() => {
    const couponFromUrl = searchParams.get('coupon');
    
    if (couponFromUrl) {
      setUrlCoupon(couponFromUrl);
      
      if (autoApply) {
        validateAndApplyCoupon(couponFromUrl);
      }
    } else {
      // Verificar si hay un cupón persistido para este item
      const persistedCoupon = CouponPersistenceService.getCouponForItem(itemType, itemId);
      if (persistedCoupon) {
        setAppliedCoupon(persistedCoupon);
        setStatus('valid');
      }
    }
  }, [searchParams, itemType, itemId, autoApply]);

  // Efecto adicional para re-intentar validación cuando el itemId cambie de 0 a un valor válido
  useEffect(() => {
    if (itemId && itemId !== 0 && urlCoupon && !appliedCoupon && autoApply) {
      console.log('Re-intentando validación del cupón ahora que el item está cargado...');
      validateAndApplyCoupon(urlCoupon);
    }
  }, [itemId, urlCoupon, appliedCoupon, autoApply]);

  const validateAndApplyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      setError('Código de cupón requerido');
      return false;
    }

    // No intentar validar si el itemId no es válido
    if (!itemId || itemId === 0) {
      console.log('Esperando a que se cargue el item antes de validar cupón...');
      return false;
    }

    setIsLoading(true);
    setStatus('loading');
    setError(null);

    try {
      console.log(`🔄 Validando cupón: ${code} para ${itemType} ${itemId}`);
      const response = await api.get(`/api/client/coupons/preview/${itemType}/${itemId}/${code}`);
      console.log('📥 Respuesta API:', response.data);
      
      if (response.data.valid) {
        const appliedCouponData: AppliedCoupon = {
          coupon: response.data.coupon,
          pricing: response.data.pricing,
          valid: true,
          timestamp: Date.now()
        };

        console.log('✅ Cupón válido, aplicando:', appliedCouponData);
        setAppliedCoupon(appliedCouponData);
        setStatus('valid');
        setError(null);

        // Persistir el cupón para uso posterior
        CouponPersistenceService.setCouponForItem(itemType, itemId, appliedCouponData);

        return true;
      } else {
        console.log('❌ Cupón inválido:', response.data.message);
        setError(response.data.message || 'Cupón no válido');
        setStatus('invalid');
        setAppliedCoupon(null);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al validar cupón';
      console.log('🚨 Error validando cupón:', err);
      setError(errorMessage);
      setStatus('error');
      setAppliedCoupon(null);
      console.error('Error validating coupon:', err);
      return false;
    } finally {
      console.log('🏁 Finalizando validación, isLoading = false');
      setIsLoading(false);
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    return validateAndApplyCoupon(code);
  };

  const removeCoupon = () => {
    // Limpiar estado local
    setAppliedCoupon(null);
    setStatus('none');
    setError(null);
    setUrlCoupon(null);

    // Limpiar persistencia
    CouponPersistenceService.clearCouponForItem(itemType, itemId);

    // Limpiar URL si tiene parámetro coupon
    if (searchParams.has('coupon')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('coupon');
      setSearchParams(newSearchParams, { replace: true });
    }
  };

  return {
    urlCoupon,
    appliedCoupon,
    status,
    error,
    removeCoupon,
    applyCoupon,
    isLoading
  };
};

export default useUrlCoupon;