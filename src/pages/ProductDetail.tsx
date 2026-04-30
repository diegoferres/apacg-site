import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Package, ShoppingCart, Plus, Minus } from 'lucide-react';
import api from '@/services/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore, type CartItem } from '@/stores/cart';

interface Variant {
  id: number;
  sku: string | null;
  name: string | null;
  attributes: Record<string, string> | null;
  price: number;
  member_price: number | null;
  stock: number;
  available_stock: number;
  is_in_stock: boolean;
  display_name: string;
}

interface ProductImage {
  id: number;
  type: 'cover' | 'image';
  storage_path: string;
  storage_path_full?: string;
}

interface ProductDetailData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  has_variants: boolean;
  base_price: number;
  member_price: number | null;
  stock: number | null;
  effective_stock: number;
  is_in_stock: boolean;
  is_pre_order_active: boolean;
  allows_pre_order: boolean;
  estimated_delivery_date: string | null;
  cover?: ProductImage | null;
  gallery?: ProductImage[];
  variants?: Variant[];
  category?: { id: number; name: string };
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api.get(`api/client/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.data);
        // Auto-select primer variant disponible
        if (data.data?.has_variants && data.data?.variants?.length > 0) {
          const firstAvailable = data.data.variants.find((v: Variant) => v.is_in_stock) ?? data.data.variants[0];
          setSelectedVariantId(firstAvailable.id);
        }
      })
      .catch((err) => {
        console.error(err);
        toast({ title: 'Error', description: 'No se pudo cargar el producto.', variant: 'destructive' });
      })
      .finally(() => setIsLoading(false));
  }, [slug, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Cargando...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Producto no encontrado.</p>
          <Button onClick={() => navigate('/productos')} variant="outline">Volver al catálogo</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Imagen activa
  const allImages: ProductImage[] = [
    ...(product.cover ? [product.cover] : []),
    ...(product.gallery ?? []),
  ];
  const activeImage = allImages[activeImageIndex];

  // Variant seleccionada (si aplica)
  const selectedVariant = product.has_variants
    ? product.variants?.find((v) => v.id === selectedVariantId) ?? null
    : null;

  const effectivePrice = selectedVariant ? selectedVariant.price : product.base_price;
  const effectiveStock = selectedVariant ? selectedVariant.available_stock : (product.stock ?? 0);
  const effectiveInStock = selectedVariant ? selectedVariant.is_in_stock : product.is_in_stock;

  // Estado de venta:
  // - in_stock: hay stock → comprar normal
  // - pre_order: stock=0 pero allows_pre_order → comprar pre-venta
  // - out_of_stock: stock=0 y NO admite pre-order → no se puede comprar
  let saleState: 'in_stock' | 'pre_order' | 'out_of_stock';
  if (effectiveInStock) saleState = 'in_stock';
  else if (product.allows_pre_order) saleState = 'pre_order';
  else saleState = 'out_of_stock';

  // Atributos únicos para el selector (ej: size + color)
  const variantAttributes: Record<string, string[]> = {};
  if (product.has_variants && product.variants) {
    for (const v of product.variants) {
      if (!v.attributes) continue;
      for (const [k, val] of Object.entries(v.attributes)) {
        if (!variantAttributes[k]) variantAttributes[k] = [];
        if (!variantAttributes[k].includes(val)) variantAttributes[k].push(val);
      }
    }
  }

  const handleAddToCart = () => {
    if (saleState === 'out_of_stock') return;
    if (product.has_variants && !selectedVariant) {
      toast({ title: 'Seleccioná una variante', variant: 'destructive' });
      return;
    }

    const item: CartItem = {
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      quantity,
      name: product.name,
      variant_name: selectedVariant?.display_name ?? null,
      unit_price: effectivePrice,
      member_price: selectedVariant ? selectedVariant.member_price : product.member_price,
      image_url: product.cover?.storage_path_full || product.cover?.storage_path || null,
      is_pre_order: saleState === 'pre_order',
      has_variants: product.has_variants,
    };

    addItem(item);
    toast({
      title: '¡Agregado al carrito!',
      description: `${product.name}${selectedVariant ? ` · ${selectedVariant.display_name}` : ''} × ${quantity}`,
    });
  };

  const attrTitle = (k: string) => ({ size: 'Talle', color: 'Color' }[k] ?? k.charAt(0).toUpperCase() + k.slice(1));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/productos">
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al catálogo
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Galería */}
          <div className="space-y-3">
            {activeImage ? (
              <Card className="overflow-hidden">
                <img
                  src={activeImage.storage_path_full || activeImage.storage_path}
                  alt={product.name}
                  className="w-full aspect-square object-contain bg-white"
                />
              </Card>
            ) : (
              <Card className="aspect-square flex items-center justify-center bg-muted">
                <Package className="h-16 w-16 text-muted-foreground" />
              </Card>
            )}

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${idx === activeImageIndex ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img.storage_path_full || img.storage_path} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            {product.category && (
              <span className="text-sm text-muted-foreground">{product.category.name}</span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(effectivePrice)}</span>
              {(selectedVariant?.member_price ?? product.member_price) && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Socios: {formatPrice(selectedVariant?.member_price ?? product.member_price ?? 0)}
                </Badge>
              )}
            </div>

            {/* Estado */}
            {saleState === 'pre_order' && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                <span className="font-semibold text-amber-800">Pre-venta activa.</span>
                {product.estimated_delivery_date && (
                  <> Entrega estimada: <strong>{new Date(product.estimated_delivery_date).toLocaleDateString('es-PY')}</strong>.</>
                )}
              </div>
            )}
            {saleState === 'out_of_stock' && (
              <div className="bg-gray-100 border border-gray-300 rounded p-3 text-sm">
                <span className="font-semibold text-gray-700">Producto agotado.</span>
              </div>
            )}

            {product.description && (
              <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
            )}

            {/* Selector de variantes */}
            {product.has_variants && Object.keys(variantAttributes).length > 0 && (
              <div className="space-y-3">
                {Object.entries(variantAttributes).map(([key, values]) => (
                  <div key={key}>
                    <label className="text-sm font-semibold mb-2 block">{attrTitle(key)}</label>
                    <div className="flex flex-wrap gap-2">
                      {values.map((val) => {
                        // Encuentro variantes que coinciden con este valor para ese attribute
                        const matchingVariants = (product.variants ?? []).filter((v) => v.attributes?.[key] === val);
                        // Para multi-attribute, una variante exacta requeriría que todos los seleccionados coincidan;
                        // por simplicidad seleccionamos la primera que matchea ese valor (suficiente para size + opcional color)
                        const variantWithThisVal = matchingVariants[0];
                        const isSelected = selectedVariant?.attributes?.[key] === val;
                        const hasStock = matchingVariants.some((v) => v.is_in_stock);
                        return (
                          <button
                            key={val}
                            onClick={() => variantWithThisVal && setSelectedVariantId(variantWithThisVal.id)}
                            className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                              isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-accent'
                            } ${!hasStock && !product.allows_pre_order ? 'opacity-50 line-through' : ''}`}
                            disabled={!hasStock && !product.allows_pre_order}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {selectedVariant && (
                  <div className="text-xs text-muted-foreground">
                    {selectedVariant.is_in_stock
                      ? `Stock disponible: ${selectedVariant.available_stock}`
                      : product.allows_pre_order
                        ? 'Disponible en pre-venta'
                        : 'Sin stock'}
                  </div>
                )}
              </div>
            )}

            {/* Cantidad + agregar al carrito */}
            {saleState !== 'out_of_stock' && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm">Cantidad</span>
                  <div className="flex items-center border rounded-md">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 hover:bg-accent">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-semibold">{quantity}</span>
                    <button
                      onClick={() => {
                        const max = saleState === 'in_stock' ? effectiveStock : 99;
                        setQuantity((q) => Math.min(max, q + 1));
                      }}
                      className="p-2 hover:bg-accent"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Button onClick={handleAddToCart} size="lg" className="w-full">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {saleState === 'pre_order' ? 'Reservar (pre-venta)' : 'Agregar al carrito'}
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground border-t pt-4">
              <strong>Retiro en APACG.</strong> Te avisaremos por email cuando esté listo para retirar.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
