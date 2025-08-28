import React from 'react';
import { X, RefreshCw, Calendar } from 'lucide-react';
import type { AppliedCoupon } from '../../hooks/useUrlCoupon';
import { formatPrice } from '../../utils/formatters';

export interface PriceItem {
  id: number;
  name: string;
  price: number;
  quantity?: number;
}

export interface PriceBreakdownProps {
  items: PriceItem[];
  appliedCoupon?: AppliedCoupon | null;
  onRemoveCoupon?: () => void;
  showRemoveOption?: boolean;
  className?: string;
  title?: string;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  items,
  appliedCoupon,
  onRemoveCoupon,
  showRemoveOption = true,
  className = '',
  title = 'Resumen de precios'
}) => {
  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const discount = appliedCoupon?.pricing.discount_amount || 0;
  const total = subtotal - discount;

  const handleRemoveCoupon = () => {
    if (onRemoveCoupon) {
      const confirmMessage = `¿Quitar cupón? El precio aumentará Gs. ${formatPrice(discount)}.`;
      if (window.confirm(confirmMessage)) {
        onRemoveCoupon();
      }
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      {title && (
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">
          {title}
        </h3>
      )}
      
      <div className="space-y-3">
        {/* Items individuales */}
        {items.map((item, index) => (
          <div key={item.id || index} className="flex justify-between items-center text-sm">
            <div className="flex-1">
              <span className="text-gray-700">{item.name}</span>
              {item.quantity && item.quantity > 1 && (
                <span className="text-gray-500 ml-2">x{item.quantity}</span>
              )}
            </div>
            <span className="text-gray-900 font-medium">
              Gs. {formatPrice(item.price * (item.quantity || 1))}
            </span>
          </div>
        ))}

        {/* Separador si hay más de un item */}
        {items.length > 1 && (
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Subtotal:</span>
              <span className="text-gray-900 font-medium">
                Gs. {formatPrice(subtotal)}
              </span>
            </div>
          </div>
        )}

        {/* Descuento aplicado */}
        {appliedCoupon && discount > 0 && (
          <div className="bg-green-50 rounded-md p-3 border border-green-200">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-green-700 font-medium">
                    Descuento ({appliedCoupon.coupon.code})
                  </span>
                  {showRemoveOption && onRemoveCoupon && (
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-500 hover:text-red-700 underline ml-2"
                      title="Quitar cupón"
                    >
                      quitar
                    </button>
                  )}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {appliedCoupon.coupon.name}
                  {appliedCoupon.coupon.discount_type === 'percentage' ? (
                    ` (${appliedCoupon.coupon.discount_value}%)`
                  ) : (
                    ` (Gs. ${formatPrice(appliedCoupon.coupon.discount_value)})`
                  )}
                  {/* Indicador de cupón recurrente */}
                  {(appliedCoupon.coupon as any).is_recurring && (
                    <div className="flex items-center gap-1 mt-1 text-blue-600 font-medium">
                      <RefreshCw className="w-3 h-3" />
                      <span>Recurrente</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-700 font-semibold">
                  -Gs. {formatPrice(discount)}
                </div>
                <div className="text-xs text-green-600">
                  ({appliedCoupon.pricing.discount_percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total final */}
        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                Gs. {formatPrice(total)}
              </div>
              {appliedCoupon && discount > 0 && (
                <div className="text-sm text-gray-500 line-through">
                  Gs. {formatPrice(subtotal)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información adicional del descuento */}
        {appliedCoupon && discount > 0 && (
          <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
            <div className="text-sm text-blue-800 space-y-1">
              <div className="font-medium">🎉 ¡Cupón aplicado exitosamente!</div>
              <div>Estás ahorrando Gs. {formatPrice(discount)} en esta compra</div>
              {appliedCoupon.coupon.description && (
                <div className="text-xs text-blue-600 italic">
                  {appliedCoupon.coupon.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información específica para cupones recurrentes */}
        {appliedCoupon && discount > 0 && (appliedCoupon.coupon as any).is_recurring && (
          <div className="bg-indigo-50 rounded-md p-3 border border-indigo-200">
            <div className="text-sm text-indigo-800 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4" />
                <span>💫 Beneficio Recurrente</span>
              </div>
              <div className="space-y-1 text-xs">
                <div>• Este descuento se aplicará <strong>todos los meses</strong> durante el curso</div>
                <div>• El beneficio persiste incluso si el cupón expira</div>
                <div>• Ahorro mensual: <strong>Gs. {formatPrice(discount)}</strong></div>
              </div>
              <div className="pt-1 border-t border-indigo-200 text-xs text-indigo-600 font-medium">
                ✨ Una vez inscrito, el descuento será automático cada mes
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceBreakdown;