import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCartBar from '@/components/StickyCartBar';
import { ShareButton } from '@/components/ShareButton';
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
  // Selección por atributo (no por variant_id) — soporta combinaciones multi-atributo
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api.get(`api/client/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.data);
        setSelections({});
      })
      .catch((err) => {
        console.error(err);
        toast({ title: 'Error', description: 'No se pudo cargar el producto.', variant: 'destructive' });
      })
      .finally(() => setIsLoading(false));
  }, [slug, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-24 pb-12 container mx-auto px-4 md:px-6 text-center text-muted-foreground">Cargando...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="pt-24 pb-12 container mx-auto px-4 md:px-6 text-center">
          <p className="text-muted-foreground mb-4">Producto no encontrado.</p>
          <Button onClick={() => navigate('/productos')} variant="outline">Volver a la Tienda</Button>
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

  // Atributos únicos para el selector (ej: size + color). Se computa de las variantes existentes.
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
  const variantAttributeKeys = Object.keys(variantAttributes);

  // Variant resuelto: el que matchea TODAS las selecciones del usuario.
  // Si falta seleccionar algún atributo, queda en null (no se asume precio/stock).
  const selectedVariant: Variant | null = (() => {
    if (!product.has_variants || !product.variants) return null;
    if (variantAttributeKeys.length === 0) return null;
    if (variantAttributeKeys.some((k) => !selections[k])) return null;
    return (
      product.variants.find((v) =>
        variantAttributeKeys.every((k) => v.attributes?.[k] === selections[k]),
      ) ?? null
    );
  })();

  // Si tiene variantes y no hay una seleccionada todavía, no asumimos precio/stock:
  // el "precio desde" se muestra como base_price, pero no permitimos comprar.
  const needsVariantPick = product.has_variants && !selectedVariant;

  // Para un (key, val) dado, ¿existe alguna variante que combine ese valor con las OTRAS selecciones actuales?
  // Si no existe → la combinación es imposible → botón deshabilitado.
  const isCombinationViable = (key: string, val: string): boolean => {
    if (!product.variants) return false;
    const hypothetical = { ...selections, [key]: val };
    return product.variants.some((v) =>
      Object.entries(hypothetical).every(([k, sel]) => v.attributes?.[k] === sel),
    );
  };

  // Para un (key, val) dado, ¿hay stock O pre-order activo para esa combinación parcial?
  const isCombinationPurchasable = (key: string, val: string): boolean => {
    if (!product.variants) return false;
    const hypothetical = { ...selections, [key]: val };
    const matches = product.variants.filter((v) =>
      Object.entries(hypothetical).every(([k, sel]) => v.attributes?.[k] === sel),
    );
    if (matches.length === 0) return false;
    if (matches.some((v) => v.is_in_stock)) return true;
    return !!product.allows_pre_order;
  };

  const effectivePrice = selectedVariant ? selectedVariant.price : product.base_price;
  const effectiveStock = selectedVariant ? selectedVariant.available_stock : (product.stock ?? 0);
  const effectiveInStock = selectedVariant ? selectedVariant.is_in_stock : product.is_in_stock;

  // Estado de venta:
  // - in_stock: hay stock → comprar normal
  // - pre_order: stock=0 pero allows_pre_order → comprar pre-venta
  // - out_of_stock: stock=0 y NO admite pre-order → no se puede comprar
  let saleState: 'in_stock' | 'pre_order' | 'out_of_stock';
  if (needsVariantPick) saleState = product.is_in_stock ? 'in_stock' : (product.allows_pre_order ? 'pre_order' : 'out_of_stock');
  else if (effectiveInStock) saleState = 'in_stock';
  else if (product.allows_pre_order) saleState = 'pre_order';
  else saleState = 'out_of_stock';

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/productos" className="hover:text-foreground transition-colors">Tienda</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>

          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/productos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la Tienda
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
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
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl md:text-4xl font-bold flex-1">{product.name}</h1>
              <ShareButton type="product" slug={product.slug} title={product.name} iconOnly />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-primary">
                {needsVariantPick && <span className="text-base font-medium text-muted-foreground mr-1">desde</span>}
                {formatPrice(effectivePrice)}
              </span>
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

            {/* Selector de variantes — selecciones independientes por atributo */}
            {product.has_variants && variantAttributeKeys.length > 0 && (
              <div className="space-y-3">
                {variantAttributeKeys.map((key) => (
                  <div key={key}>
                    <label className="text-sm font-semibold mb-2 block">{attrTitle(key)}</label>
                    <div className="flex flex-wrap gap-2">
                      {variantAttributes[key].map((val) => {
                        const isSelected = selections[key] === val;
                        const viable = isCombinationViable(key, val);
                        const purchasable = isCombinationPurchasable(key, val);
                        const disabled = !viable || !purchasable;
                        // Estado visual:
                        //   - seleccionado → primario
                        //   - no viable (no existe combinación con otras selecciones) → opaco + tachado
                        //   - no comprable (sin stock y sin pre-order) → opaco + tachado
                        //   - normal → fondo blanco con borde
                        const classes = isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : disabled
                            ? 'border-input bg-background opacity-40 line-through cursor-not-allowed'
                            : 'border-input bg-background hover:bg-accent';
                        const title = !viable
                          ? 'No disponible con la combinación elegida'
                          : !purchasable
                            ? 'Sin stock'
                            : undefined;
                        return (
                          <button
                            key={val}
                            onClick={() => !disabled && setSelections((prev) => ({ ...prev, [key]: val }))}
                            disabled={disabled}
                            title={title}
                            className={`px-4 py-2 border rounded-md text-sm transition-colors ${classes}`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {selectedVariant ? (
                  <div className="text-xs text-muted-foreground">
                    {selectedVariant.is_in_stock
                      ? `Stock disponible: ${selectedVariant.available_stock}`
                      : product.allows_pre_order
                        ? 'Disponible en pre-venta'
                        : 'Sin stock'}
                  </div>
                ) : (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                    Seleccioná {variantAttributeKeys.length > 1 ? 'todas las opciones' : 'una opción'} para continuar.
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
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 hover:bg-accent" disabled={needsVariantPick}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-semibold">{quantity}</span>
                    <button
                      onClick={() => {
                        const max = saleState === 'in_stock' ? effectiveStock : 99;
                        setQuantity((q) => Math.min(max, q + 1));
                      }}
                      className="p-2 hover:bg-accent"
                      disabled={needsVariantPick}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Button onClick={handleAddToCart} size="lg" className="w-full" disabled={needsVariantPick}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {needsVariantPick
                    ? 'Seleccioná una opción'
                    : saleState === 'pre_order' ? 'Reservar (pre-venta)' : 'Agregar al carrito'}
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground border-t pt-4">
              <strong>Retiro en APACG.</strong> Te avisaremos por email cuando esté listo para retirar.
            </div>
          </div>
        </div>
        </div>
      </section>

      <StickyCartBar />
      <Footer />
    </div>
  );
};

export default ProductDetail;
