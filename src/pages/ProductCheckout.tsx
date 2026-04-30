import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useStore } from '@/stores/store';
import { formatPrice } from '@/lib/utils';
import api from '@/services/api';

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  cedula: string;
}

const ProductCheckout = () => {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const user = useStore((s) => s.user);
  const isMember = !!user?.member;

  const [formData, setFormData] = useState<CheckoutFormData>({ name: '', email: '', phone: '', cedula: '' });
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [livePricing, setLivePricing] = useState<{ total: number; is_member: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-llenar con datos del usuario logueado
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.member ? `${user.member.first_name} ${user.member.last_name}` : user.name,
        email: user.email,
        phone: user.member?.phone ?? '',
        cedula: '',
      });
    } else {
      // Recuperar datos de form anterior si existen
      const saved = localStorage.getItem('apacg_buyer_data');
      if (saved) {
        try { setFormData(JSON.parse(saved)); } catch {}
      }
    }
  }, [user]);

  // Redirigir si carrito vacío
  useEffect(() => {
    if (items.length === 0) {
      navigate('/productos');
    }
  }, [items, navigate]);

  // Recalcular precio en backend (toma en cuenta si es socio)
  useEffect(() => {
    if (items.length === 0) return;
    const cart = items.map((i) => ({ product_id: i.product_id, variant_id: i.variant_id ?? undefined, quantity: i.quantity }));
    api.post('api/client/products/check-cart-pricing', { cart })
      .then(({ data }) => setLivePricing({ total: data.data.total, is_member: data.data.is_member }))
      .catch(() => setLivePricing(null));
  }, [items]);

  const validate = (): boolean => {
    const e: Partial<CheckoutFormData> = {};
    if (!formData.name.trim()) e.name = 'Requerido';
    if (!formData.email.trim()) e.email = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email inválido';
    if (!formData.phone.trim()) e.phone = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Persistir datos del comprador para futuros checkouts (guests)
    if (!user) {
      localStorage.setItem('apacg_buyer_data', JSON.stringify(formData));
    }

    // Guardar payment_data para Payment.tsx
    const paymentData = {
      type: 'product' as const,
      cart: items.map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id ?? undefined,
        quantity: i.quantity,
      })),
      totalAmount: livePricing?.total ?? items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0),
      totalTickets: items.reduce((acc, i) => acc + i.quantity, 0),
      eventTitle: 'Productos APACG',
      customerData: formData,
    };

    localStorage.setItem('payment_data', JSON.stringify(paymentData));
    navigate('/pago');
  };

  const updateField = (field: keyof CheckoutFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const total = livePricing?.total ?? items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/carrito')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver al carrito
        </Button>

        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-7 w-7" /> Datos del comprador
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input id="name" value={formData.name} onChange={updateField('name')} className={errors.name ? 'border-destructive' : ''} />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={updateField('email')} className={errors.email ? 'border-destructive' : ''} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Te enviaremos la confirmación y el aviso de retiro a este email.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input id="phone" value={formData.phone} onChange={updateField('phone')} className={errors.phone ? 'border-destructive' : ''} />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cedula">Cédula (opcional)</Label>
                      <Input id="cedula" value={formData.cedula} onChange={updateField('cedula')} />
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-900 text-sm">
                      <strong>Retiro en APACG.</strong> Apenas tu pedido esté listo, te avisamos por email para que lo pases a buscar.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Procesando...' : 'Continuar al pago'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold">Resumen del pedido</h3>
                {items.map((item) => {
                  const linePrice = isMember && item.member_price !== null ? item.member_price : item.unit_price;
                  return (
                    <div key={`${item.product_id}-${item.variant_id ?? 'none'}`} className="flex gap-3 text-sm border-b pb-3 last:border-0">
                      <div className="w-12 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                        {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt="" /> : <Package className="h-6 w-6 m-auto text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        {item.variant_name && <div className="text-xs text-muted-foreground">{item.variant_name}</div>}
                        <div className="text-xs">{item.quantity} × {formatPrice(linePrice)}</div>
                      </div>
                      <div className="font-semibold">{formatPrice(linePrice * item.quantity)}</div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
                </div>
                {livePricing?.is_member && (
                  <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
                    Precio de socio aplicado.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductCheckout;
