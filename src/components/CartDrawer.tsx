import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus, Minus, Package } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useStore } from '@/stores/store';
import { formatPrice } from '@/lib/utils';

const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const { items, updateQuantity, removeItem } = useCartStore();
  const user = useStore((s) => s.user);
  const isMember = !!user?.member;

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => {
    const price = isMember && i.member_price !== null ? i.member_price : i.unit_price;
    return acc + price * i.quantity;
  }, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Carrito ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <Package className="h-12 w-12 mx-auto mb-3" />
              Tu carrito está vacío.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const linePrice = isMember && item.member_price !== null ? item.member_price : item.unit_price;
                return (
                  <div key={`${item.product_id}-${item.variant_id ?? 'none'}`} className="flex gap-3 border-b pb-3">
                    <div className="w-14 h-14 bg-muted rounded flex-shrink-0 overflow-hidden">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" alt="" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.variant_name && <p className="text-xs text-muted-foreground">{item.variant_name}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)} className="border rounded p-1 hover:bg-accent">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)} className="border rounded p-1 hover:bg-accent">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end">
                      <span className="text-sm font-semibold">{formatPrice(linePrice * item.quantity)}</span>
                      <button onClick={() => removeItem(item.product_id, item.variant_id)} className="text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link to="/carrito">Ver carrito</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
