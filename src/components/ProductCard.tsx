import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import analytics from '@/services/analytics';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  has_variants: boolean;
  base_price: number;
  member_price: number | null;
  effective_stock?: number;
  is_in_stock: boolean;
  is_pre_order_active: boolean;
  estimated_delivery_date: string | null;
  cover?: { storage_path?: string; storage_path_full?: string } | null;
  category?: { id: number; name: string } | null;
  variants?: Array<{ id: number; price: number; member_price: number | null }>;
}

interface ProductCardProps {
  product: Product;
  delay?: number;
  position?: number;
  listName?: string;
}

const ProductCard = ({ product, delay = 0, position = 0, listName = 'products_list' }: ProductCardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
    setIsVisible(true);
  }, [delay]);

  const cheapestPrice = (): number => {
    if (product.has_variants && product.variants && product.variants.length > 0) {
      return Math.min(...product.variants.map((v) => v.price));
    }
    return product.base_price;
  };

  const imageUrl = product.cover?.storage_path_full || product.cover?.storage_path || null;

  const handleClick = () => {
    analytics.trackItemClick(
      product.id.toString(),
      product.name,
      'product',
      position,
      listName
    );
  };

  return (
    <Link to={`/producto/${product.slug}`} className="block" onClick={handleClick}>
      <Card
        className={`overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full ${
          delay > 0 ? (isVisible ? 'opacity-100' : 'opacity-0 translate-y-4') : ''
        }`}
        style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
      >
        {/* Imagen: aspect-square con object-contain para mostrar TODA la imagen.
            Fondo gris claro absorbe los bordes de imágenes con padding o aspect distinto. */}
        <div className="relative aspect-square overflow-hidden bg-muted/40 flex items-center justify-center p-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground">
              <Package className="h-12 w-12" />
            </div>
          )}

          {/* Badge de estado en la esquina superior derecha */}
          {!product.is_in_stock && product.is_pre_order_active && (
            <Badge className="absolute top-3 right-3 bg-amber-500 text-white hover:bg-amber-600">
              Pre-venta
            </Badge>
          )}
          {!product.is_in_stock && !product.is_pre_order_active && (
            <Badge className="absolute top-3 right-3 bg-gray-500 text-white hover:bg-gray-600">
              Agotado
            </Badge>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          {product.category && (
            <span className="text-xs text-muted-foreground mb-1">{product.category.name}</span>
          )}
          <h3 className="font-semibold text-base mb-2 line-clamp-2">{product.name}</h3>

          <div className="mt-auto pt-2 flex items-end justify-between gap-2">
            <div className="min-w-0">
              {product.has_variants && product.variants && product.variants.length > 0 && (
                <div className="text-xs text-muted-foreground leading-none">Desde</div>
              )}
              <div className="text-lg font-bold text-primary">{formatPrice(cheapestPrice())}</div>
              {product.member_price !== null && product.member_price > 0 && (
                <div className="text-xs text-green-700">
                  Socios: {formatPrice(product.member_price)}
                </div>
              )}
            </div>
            <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0 mb-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
