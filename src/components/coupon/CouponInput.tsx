import React, { useState } from 'react';
import { Loader2, Tag, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';

export interface CouponInputProps {
  onCouponApplied: (code: string) => Promise<boolean>;
  onCouponRemoved?: () => void;
  initialCode?: string;
  appliedCouponCode?: string;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CouponInput: React.FC<CouponInputProps> = ({
  onCouponApplied,
  onCouponRemoved,
  initialCode = '',
  appliedCouponCode,
  isLoading = false,
  error,
  placeholder = "Ingresa tu código de cupón",
  disabled = false,
  className = ''
}) => {
  const [couponCode, setCouponCode] = useState(initialCode);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || isApplying || disabled) return;

    setIsApplying(true);
    
    try {
      const success = await onCouponApplied(couponCode.trim().toUpperCase());
      
      if (success) {
        // Limpiar el input solo si se aplicó exitosamente
        setCouponCode('');
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyCoupon();
    }
  };

  const handleRemoveCoupon = () => {
    if (onCouponRemoved) {
      onCouponRemoved();
    }
  };

  const isButtonDisabled = !couponCode.trim() || isApplying || isLoading || disabled;

  // Si ya hay un cupón aplicado, mostrar estado aplicado
  if (appliedCouponCode) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-700">Cupón aplicado:</span>
          <span className="font-semibold text-green-700">{appliedCouponCode}</span>
        </div>
        
        {onCouponRemoved && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            Quitar cupón
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input y botón */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={disabled || isApplying || isLoading}
            className="pl-10 uppercase"
            maxLength={20}
          />
        </div>
        
        <Button
          onClick={handleApplyCoupon}
          disabled={isButtonDisabled}
          size="default"
          className="min-w-[100px]"
        >
          {(isApplying || isLoading) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isApplying ? 'Aplicando...' : 'Validando...'}
            </>
          ) : (
            'Aplicar'
          )}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 Ingresa tu código de cupón para obtener descuentos especiales</p>
        <p>• Los códigos no distinguen entre mayúsculas y minúsculas</p>
        <p>• Presiona Enter o haz clic en "Aplicar"</p>
      </div>
    </div>
  );
};

export default CouponInput;