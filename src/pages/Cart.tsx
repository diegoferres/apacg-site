import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2, Package } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useStore } from '@/stores/store';
import { formatPrice } from '@/lib/utils';
import api from '@/services/api';

interface PricingResponse {
  is_member: boolean;
  total: number;
  lines: Array<{ product_id: number; variant: { id: number; name: string } | null; quantity: number; unit_price: number; total_price: number }>;
}

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clear } = useCartStore();
  const user = useStore((s) => s.user);
  const isMember = !!user?.member;

  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);

  // Validar precios contra el backend cada vez que cambia el carrito o el user
  useEffect(() => {
    if (items.length === 0) {
      setPricing(null);
      return;
    }
    setIsCheckingPrice(true);
    const cart = items.map((i) => ({
      product_id: i.product_id,
      variant_id: i.variant_id ?? undefined,
      quantity: i.quantity,
    }));
    api.post('api/client/products/check-cart-pricing', { cart })
      .then(({ data }) => setPricing(data.data))
      .catch(() => setPricing(null))
      .finally(() => setIsCheckingPrice(false));
  }, [items, isMember]);

  const subtotalLocal = items.reduce((acc, i) => {
    const price = isMember && i.member_price !== null ? i.member_price : i.unit_price;
    return acc + price * i.quantity;
  }, 0);

  // Si tenemos pricing del backend, lo usamos; sino el cálculo local
  const subtotal = pricing?.total ?? subtotalLocal;

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/productos/checkout');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/productos"><ArrowLeft className="h-4 w-4 mr-2" /> Seguir comprando</Link>
        </Button>

        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-7 w-7" /> Mi carrito
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Tu carrito está vacío.</p>
            <Button asChild><Link to="/productos">Ver productos</Link></Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const linePrice = isMember && item.member_price !== null ? item.member_price : item.unit_price;
                return (
                  <Card key={`${item.product_id}-${item.variant_id ?? 'none'}`}>
                    <CardContent className="p-4 flex gap-4 items-center">
                      <div className="w-20 h-20 bg-muted rounded flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{item.name}</p>
                        {item.variant_name && (
                          <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                        )}
                        {item.is_pre_order && (
                          <Badge variant="outline" className="mt-1 border-amber-500 text-amber-700">Pre-venta</Badge>
                        )}
                        <div className="text-sm mt-1">
                          {formatPrice(linePrice)}
                          {isMember && item.member_price !== null && (
                            <span className="ml-2 text-green-600 text-xs">(socio)</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                            className="p-2 hover:bg-accent"
                          ><Minus className="h-3 w-3" /></button>
                          <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                            className="p-2 hover:bg-accent"
                          ><Plus className="h-3 w-3" /></button>
                        </div>
                        <span className="font-bold">{formatPrice(linePrice * item.quantity)}</span>
                        <button
                          onClick={() => removeItem(item.product_id, item.variant_id)}
                          className="text-xs text-destructive hover:underline flex items-center gap-1"
                        ><Trash2 className="h-3 w-3" /> Eliminar</button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="text-right pt-2">
                <Button variant="ghost" size="sm" onClick={clear}>Vaciar carrito</Button>
              </div>
            </div>

            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-semibold text-lg">Resumen</h2>
                  <div className="flex justify-between text-sm">
                    <span>Items</span>
                    <span>{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-primary">
                      {isCheckingPrice ? '...' : formatPrice(subtotal)}
                    </span>
                  </div>
                  {pricing?.is_member && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                      Precio de socio aplicado.
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Retiro en APACG. Te avisamos por email cuando esté listo.
                  </div>
                  <Button onClick={handleCheckout} size="lg" className="w-full">
                    Continuar al pago
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
