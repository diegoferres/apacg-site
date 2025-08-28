import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CouponPersistenceService, type CouponData } from '../../services/CouponPersistenceService';
import CouponInput from '../coupon/CouponInput';
import PriceBreakdown from '../coupon/PriceBreakdown';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatters';

interface CheckoutItem {
  id: number;
  name: string;
  price: number;
  type: 'course' | 'event' | 'product';
  quantity: number;
}

interface PaymentData {
  method: 'bancard';
  items: CheckoutItem[];
  coupon?: CouponData;
  total_original: number;
  total_discount: number;
  total_final: number;
}

// Componente de ejemplo para checkout con cupones
const CheckoutWithCoupons: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [appliedCoupons, setAppliedCoupons] = useState<CouponData[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  // Cargar datos del checkout al montar
  useEffect(() => {
    const loadCheckoutData = async () => {
      setLoading(true);
      
      try {
        // Cargar cupones transferidos desde enrollment
        const transferredCoupons = CouponPersistenceService.getCheckoutCoupons();
        setAppliedCoupons(transferredCoupons);

        // Simular carga de items (normalmente vendrían de la URL o API)
        const enrollmentSlug = searchParams.get('enrollment');
        
        // Datos de ejemplo basados en el enrollment
        const checkoutItems: CheckoutItem[] = [
          {
            id: 1,
            name: "Mister Wiz - Formación de Líderes",
            price: 150000,
            type: 'course',
            quantity: 1
          }
        ];

        setItems(checkoutItems);
        
      } catch (error) {
        console.error('Error loading checkout data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [searchParams]);

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    if (!items.length) return false;

    setCouponLoading(true);
    setCouponError(null);

    try {
      // Preparar items para validación
      const itemsForValidation = items.map(item => ({
        type: item.type,
        id: item.id,
        quantity: item.quantity
      }));

      const response = await api.post('/api/client/coupons/validate', {
        code,
        items: itemsForValidation
      });

      if (response.data.valid) {
        const newCoupon: CouponData = {
          coupon: response.data.coupon,
          pricing: response.data.summary,
          valid: true,
          timestamp: Date.now()
        };

        // Agregar a la lista de cupones aplicados
        setAppliedCoupons(prev => [...prev, newCoupon]);
        
        // Guardar en el checkout
        CouponPersistenceService.setCheckoutCoupons([...appliedCoupons, newCoupon]);
        
        return true;
      } else {
        setCouponError(response.data.message || 'Cupón no válido');
        return false;
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al validar cupón';
      setCouponError(errorMessage);
      return false;
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = (couponCode: string) => {
    const updatedCoupons = appliedCoupons.filter(c => c.coupon.code !== couponCode);
    setAppliedCoupons(updatedCoupons);
    CouponPersistenceService.setCheckoutCoupons(updatedCoupons);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = appliedCoupons.reduce((sum, coupon) => sum + coupon.pricing.discount_amount, 0);
    const total = subtotal - totalDiscount;

    return {
      subtotal,
      totalDiscount,
      total
    };
  };

  const handlePayment = async () => {
    if (!items.length) return;

    setProcessing(true);

    try {
      const { subtotal, totalDiscount, total } = calculateTotals();

      // Preparar datos de pago
      const paymentData: PaymentData = {
        method: 'bancard',
        items,
        coupon: appliedCoupons[0], // Por simplicidad, usar el primer cupón
        total_original: subtotal,
        total_discount: totalDiscount,
        total_final: total
      };

      // Simular procesamiento de pago (reemplazar con integración Bancard real)
      console.log('Processing payment with data:', paymentData);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Limpiar cupones después del pago exitoso
      CouponPersistenceService.clearAll();

      // Redirigir a página de éxito
      window.location.href = '/payment/success';
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago. Por favor intente nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  const { subtotal, totalDiscount, total } = calculateTotals();

  // Convertir cupones aplicados a formato compatible con PriceBreakdown
  const appliedCoupon = appliedCoupons.length > 0 ? {
    coupon: appliedCoupons[0].coupon,
    pricing: {
      original_price: subtotal,
      discount_amount: totalDiscount,
      final_price: total,
      discount_percentage: subtotal > 0 ? (totalDiscount / subtotal) * 100 : 0
    },
    valid: true,
    timestamp: appliedCoupons[0].timestamp
  } : null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600">Revisa tu pedido y completa el pago</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalles del pedido */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Gs. {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-600">
                          Gs. {formatPrice(item.price)} c/u
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cupones aplicados */}
          {appliedCoupons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cupones Aplicados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appliedCoupons.map((coupon) => (
                    <div key={coupon.coupon.code} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-green-800">
                            {coupon.coupon.code}
                          </p>
                          <p className="text-sm text-green-600">
                            {coupon.coupon.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-700">
                            -Gs. {formatPrice(coupon.pricing.discount_amount)}
                          </p>
                          <button
                            onClick={() => handleRemoveCoupon(coupon.coupon.code)}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                          >
                            quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aplicar más cupones */}
          <Card>
            <CardHeader>
              <CardTitle>¿Tienes otro cupón?</CardTitle>
            </CardHeader>
            <CardContent>
              <CouponInput
                onCouponApplied={handleApplyCoupon}
                isLoading={couponLoading}
                error={couponError}
                placeholder="Código del cupón"
              />
            </CardContent>
          </Card>

          {/* Método de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex-shrink-0">
                  🏦
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bancard</p>
                  <p className="text-sm text-gray-600">
                    Pago seguro con tarjeta de débito o crédito
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de pago */}
        <div className="space-y-4">
          <PriceBreakdown
            items={items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            }))}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={() => {
              if (appliedCoupons.length > 0) {
                handleRemoveCoupon(appliedCoupons[0].coupon.code);
              }
            }}
            title="Total a Pagar"
          />

          {/* Botón de pago */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handlePayment}
                disabled={processing}
                size="lg"
                className="w-full text-lg py-4"
              >
                {processing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <>Pagar Gs. {formatPrice(total)}</>
                )}
              </Button>
              
              <div className="text-center mt-4 space-y-2">
                <p className="text-xs text-gray-500">
                  🔒 Transacción segura con SSL
                </p>
                <p className="text-xs text-gray-500">
                  Procesado por Bancard
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-800 space-y-2">
                <p className="font-medium">💡 Información importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Los cupones se aplicarán en el monto final</li>
                  <li>Recibirás confirmación por email</li>
                  <li>El acceso al curso se habilitará inmediatamente</li>
                  <li>Política de reembolso de 30 días</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutWithCoupons;