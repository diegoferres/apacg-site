import type { AppliedCoupon } from '../hooks/useUrlCoupon';

export interface CouponData {
  coupon: {
    id: number;
    code: string;
    name: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    is_recurring?: boolean;
  };
  pricing: {
    original_price: number;
    discount_amount: number;
    final_price: number;
    discount_percentage: number;
  };
  valid: boolean;
  timestamp: number;
}

export class CouponPersistenceService {
  private static readonly STORAGE_PREFIX = 'coupon_';
  private static readonly CHECKOUT_KEY = 'checkout_coupon';
  private static readonly EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutos en milliseconds

  /**
   * Guardar cupón para un item específico
   */
  static setCouponForItem(itemType: string, itemId: number, couponData: AppliedCoupon): void {
    try {
      const key = `${this.STORAGE_PREFIX}${itemType}_${itemId}`;
      const dataToStore = {
        ...couponData,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(key, JSON.stringify(dataToStore));
      console.log(`Coupon saved for ${itemType} ${itemId}:`, couponData.coupon.code);
    } catch (error) {
      console.error('Error saving coupon to session:', error);
    }
  }

  /**
   * Obtener cupón para un item específico
   */
  static getCouponForItem(itemType: string, itemId: number): AppliedCoupon | null {
    try {
      const key = `${this.STORAGE_PREFIX}${itemType}_${itemId}`;
      const stored = sessionStorage.getItem(key);
      
      if (!stored) {
        return null;
      }

      const data: AppliedCoupon = JSON.parse(stored);
      
      // Verificar expiración
      if (this.isExpired(data.timestamp)) {
        this.clearCouponForItem(itemType, itemId);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting coupon from session:', error);
      return null;
    }
  }

  /**
   * Limpiar cupón para un item específico
   */
  static clearCouponForItem(itemType: string, itemId: number): void {
    try {
      const key = `${this.STORAGE_PREFIX}${itemType}_${itemId}`;
      sessionStorage.removeItem(key);
      console.log(`Coupon cleared for ${itemType} ${itemId}`);
    } catch (error) {
      console.error('Error clearing coupon from session:', error);
    }
  }

  /**
   * Transferir cupones al checkout
   * Recopila todos los cupones activos y los prepara para checkout
   */
  static transferToCheckout(): CouponData[] {
    try {
      const coupons: CouponData[] = [];
      
      // Iterar sobre todas las keys de sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX) && key !== this.CHECKOUT_KEY) {
          const stored = sessionStorage.getItem(key);
          if (stored) {
            try {
              const data: AppliedCoupon = JSON.parse(stored);
              
              // Verificar que no esté expirado
              if (!this.isExpired(data.timestamp)) {
                coupons.push({
                  coupon: data.coupon,
                  pricing: data.pricing,
                  valid: data.valid,
                  timestamp: data.timestamp
                });
              } else {
                // Limpiar cupones expirados
                sessionStorage.removeItem(key);
              }
            } catch (parseError) {
              console.error('Error parsing stored coupon:', parseError);
              sessionStorage.removeItem(key); // Limpiar data corrupta
            }
          }
        }
      });

      // Guardar en checkout si hay cupones
      if (coupons.length > 0) {
        sessionStorage.setItem(this.CHECKOUT_KEY, JSON.stringify({
          coupons,
          timestamp: Date.now()
        }));
      }

      return coupons;
    } catch (error) {
      console.error('Error transferring coupons to checkout:', error);
      return [];
    }
  }

  /**
   * Obtener cupones para checkout
   */
  static getCheckoutCoupons(): CouponData[] {
    try {
      const stored = sessionStorage.getItem(this.CHECKOUT_KEY);
      if (!stored) {
        // Si no hay cupones de checkout, intentar transferir desde items
        return this.transferToCheckout();
      }

      const checkoutData = JSON.parse(stored);
      
      // Verificar expiración
      if (this.isExpired(checkoutData.timestamp)) {
        this.clearCheckoutCoupons();
        return [];
      }

      return checkoutData.coupons || [];
    } catch (error) {
      console.error('Error getting checkout coupons:', error);
      return [];
    }
  }

  /**
   * Guardar cupones para checkout
   */
  static setCheckoutCoupons(coupons: CouponData[]): void {
    try {
      sessionStorage.setItem(this.CHECKOUT_KEY, JSON.stringify({
        coupons,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving checkout coupons:', error);
    }
  }

  /**
   * Limpiar cupones de checkout
   */
  static clearCheckoutCoupons(): void {
    try {
      sessionStorage.removeItem(this.CHECKOUT_KEY);
    } catch (error) {
      console.error('Error clearing checkout coupons:', error);
    }
  }

  /**
   * Limpiar todos los cupones
   */
  static clearAll(): void {
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX) || key === this.CHECKOUT_KEY) {
          sessionStorage.removeItem(key);
        }
      });
      console.log('All coupons cleared from session');
    } catch (error) {
      console.error('Error clearing all coupons:', error);
    }
  }

  /**
   * Limpiar cupones expirados automáticamente
   */
  static cleanupExpiredCoupons(): void {
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          const stored = sessionStorage.getItem(key);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              if (this.isExpired(data.timestamp)) {
                sessionStorage.removeItem(key);
                console.log(`Expired coupon removed: ${key}`);
              }
            } catch (parseError) {
              // Remover data corrupta
              sessionStorage.removeItem(key);
              console.log(`Corrupted coupon data removed: ${key}`);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired coupons:', error);
    }
  }

  /**
   * Obtener información de todos los cupones activos
   */
  static getActiveCouponsInfo(): { 
    count: number; 
    items: Array<{ itemType: string; itemId: number; couponCode: string }> 
  } {
    const items: Array<{ itemType: string; itemId: number; couponCode: string }> = [];
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX) && key !== this.CHECKOUT_KEY) {
          const stored = sessionStorage.getItem(key);
          if (stored) {
            try {
              const data: AppliedCoupon = JSON.parse(stored);
              if (!this.isExpired(data.timestamp)) {
                // Extraer tipo e ID del key: "coupon_course_123"
                const keyParts = key.replace(this.STORAGE_PREFIX, '').split('_');
                if (keyParts.length >= 2) {
                  const itemType = keyParts[0];
                  const itemId = parseInt(keyParts[1]);
                  items.push({
                    itemType,
                    itemId,
                    couponCode: data.coupon.code
                  });
                }
              }
            } catch (parseError) {
              console.error('Error parsing coupon data:', parseError);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error getting active coupons info:', error);
    }

    return {
      count: items.length,
      items
    };
  }

  /**
   * Verificar si un timestamp ha expirado
   */
  private static isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.EXPIRATION_TIME;
  }

  /**
   * Inicializar el servicio (limpiar expirados al cargar)
   */
  static initialize(): void {
    this.cleanupExpiredCoupons();
  }
}