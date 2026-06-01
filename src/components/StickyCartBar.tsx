import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { useStore } from '@/stores/store';
import { formatPrice } from '@/lib/utils';

const StickyCartBar = () => {
  const items = useCartStore((s) => s.items);
  const user = useStore((s) => s.user);
  const isMember = !!user?.member;

  if (items.length === 0) return null;

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => {
    const price = isMember && i.member_price !== null ? i.member_price : i.unit_price;
    return acc + price * i.quantity;
  }, 0);

  const displayCount = itemCount > 99 ? '99+' : itemCount.toString();
  const countLabel = itemCount === 1 ? 'producto' : 'productos';

  return (
    <>
      {/* Spacer: empuja Footer/contenido para que la barra fija no tape nada */}
      <div
        className="md:hidden"
        style={{ height: 'calc(76px + env(safe-area-inset-bottom))' }}
        aria-hidden
      />

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary text-primary-foreground shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Link
          to="/carrito"
          className="flex items-center justify-between gap-3 px-4 py-3 active:opacity-80 transition-opacity"
          aria-label={`Ir al carrito: ${itemCount} ${countLabel}, total ${formatPrice(total)}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-background text-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {displayCount}
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs opacity-90">
                {itemCount} {countLabel}
              </span>
              <span className="font-semibold text-base">{formatPrice(total)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <span>Ver carrito</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </Link>
      </div>
    </>
  );
};

export default StickyCartBar;
