import React from 'react';
import { CheckCircle, X, Calendar, RefreshCw } from 'lucide-react';
import type { AppliedCoupon } from '../../hooks/useUrlCoupon';
import { formatPrice } from '../../utils/formatters';

export interface CouponAppliedBannerProps {
  coupon: AppliedCoupon;
  context: 'course' | 'event' | 'product' | 'enrollment' | 'checkout';
  onRemove: () => void;
  className?: string;
}

const CouponAppliedBanner: React.FC<CouponAppliedBannerProps> = ({ 
  coupon, 
  context, 
  onRemove,
  className = ''
}) => {
  const getConfirmMessage = (): string => {
    const savings = formatPrice(coupon.pricing.discount_amount);
    
    switch(context) {
      case 'course':
      case 'event':
      case 'product':
        return `¿Quitar cupón? Perderás ${savings} de descuento.`;
      case 'enrollment':
        return `¿Continuar sin descuento? El precio aumentará ${savings}.`;
      case 'checkout':
        return `¿Remover cupón del pedido? El total aumentará ${savings}.`;
      default:
        return `¿Quitar cupón? Perderás ${savings} de descuento.`;
    }
  };

  const getDiscountText = (): string => {
    if (coupon.coupon.discount_type === 'percentage') {
      return `${coupon.coupon.discount_value}%`;
    } else {
      return formatPrice(coupon.coupon.discount_value);
    }
  };

  const handleRemove = () => {
    if (context === 'checkout') {
      // Para checkout, siempre mostrar confirmación
      if (window.confirm(getConfirmMessage())) {
        onRemove();
      }
    } else {
      // Para otros contextos, remover directamente
      onRemove();
    }
  };

  const getContextIcon = () => {
    switch(context) {
      case 'checkout':
        return '🛒';
      case 'enrollment':
        return '📝';
      default:
        return '🎯';
    }
  };

  return (
    <div className={`bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          
          <div className="flex-grow">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-green-800">
                Cupón aplicado: <span className="font-bold">{coupon.coupon.code}</span>
              </p>
              <span className="text-xs">{getContextIcon()}</span>
            </div>
            
            <div className="mt-1 space-y-1">
              <p className="text-sm text-green-700">
                {coupon.coupon.name}
              </p>
              
              {coupon.coupon.description && (
                <p className="text-xs text-green-600 opacity-90">
                  {coupon.coupon.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-green-700">
                  <strong>Descuento:</strong> {getDiscountText()}
                </span>
                <span className="text-green-700">
                  <strong>Ahorras:</strong> Gs. {formatPrice(coupon.pricing.discount_amount)}
                </span>
                <span className="text-green-600 opacity-90">
                  ({coupon.pricing.discount_percentage.toFixed(1)}% menos)
                </span>
              </div>
              
              {/* Indicador de cupón recurrente */}
              {(coupon.coupon as any).is_recurring && (
                <div className="flex items-center space-x-2 mt-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700 font-medium">
                    ✨ Descuento Recurrente: Se aplicará todos los meses durante el curso
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleRemove}
          className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200 flex-shrink-0"
          title="Quitar cupón"
          aria-label="Quitar cupón aplicado"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Información adicional según contexto */}
      {context === 'checkout' && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-green-600">
            💡 El descuento se aplicará en el pago final
            {(coupon.coupon as any).is_recurring && (
              <span className="block text-blue-600 font-medium mt-1">
                🔄 Como es recurrente, se aplicará automáticamente en futuras mensualidades
              </span>
            )}
          </p>
        </div>
      )}

      {context === 'enrollment' && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-green-600">
            📝 El descuento se mantendrá durante el proceso de inscripción
            {(coupon.coupon as any).is_recurring && (
              <span className="block text-blue-600 font-medium mt-1">
                🔄 Una vez inscrito, el descuento continuará todos los meses
              </span>
            )}
          </p>
        </div>
      )}

      {context === 'course' && (coupon.coupon as any).is_recurring && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-blue-600 font-medium">
            <Calendar className="w-3 h-3 inline mr-1" />
            Este descuento se aplicará mensualmente durante toda la duración del curso, 
            incluso después de que el cupón expire
          </p>
        </div>
      )}
    </div>
  );
};

export default CouponAppliedBanner;