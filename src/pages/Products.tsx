import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package } from 'lucide-react';
import api from '@/services/api';
import { formatPrice } from '@/lib/utils';

interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  has_variants: boolean;
  base_price: number;
  member_price: number | null;
  effective_stock: number;
  is_in_stock: boolean;
  is_pre_order_active: boolean;
  estimated_delivery_date: string | null;
  cover?: { storage_path: string; storage_path_full?: string };
  category?: { id: number; name: string };
  variants?: Array<{ id: number; price: number; member_price: number | null }>;
}

interface Category {
  id: number;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('api/client/products/categories').then(({ data }) => {
      setCategories(data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string | number> = { page };
    if (search.trim()) params.search = search.trim();
    if (categoryId) params.category_id = categoryId;

    api.get('api/client/products', { params })
      .then(({ data }) => {
        setProducts(data.data?.data || []);
        setTotalPages(data.data?.last_page || 1);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [page, search, categoryId]);

  const cheapestPrice = (p: ProductSummary): number => {
    if (p.has_variants && p.variants && p.variants.length > 0) {
      return Math.min(...p.variants.map((v) => v.price));
    }
    return p.base_price;
  };

  const productImageUrl = (p: ProductSummary): string | null => {
    return p.cover?.storage_path_full || p.cover?.storage_path || null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Productos APACG</h1>
          <p className="text-muted-foreground">Merchandising oficial de la asociación.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <select
            className="form-select rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={categoryId ?? ''}
            onChange={(e) => { setCategoryId(e.target.value ? Number(e.target.value) : null); setPage(1); }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Cargando...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay productos disponibles{search && ` para "${search}"`}.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => {
                const minPrice = cheapestPrice(p);
                const imgUrl = productImageUrl(p);
                return (
                  <Link key={p.id} to={`/producto/${p.slug}`} className="group">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="aspect-square overflow-hidden bg-muted">
                        {imgUrl ? (
                          <img src={imgUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        {p.category && (
                          <span className="text-xs text-muted-foreground mb-1">{p.category.name}</span>
                        )}
                        <h3 className="font-semibold text-base mb-2 line-clamp-2">{p.name}</h3>
                        <div className="mt-auto">
                          <div className="flex items-center justify-between">
                            <div>
                              {p.has_variants && p.variants && p.variants.length > 0 && (
                                <span className="text-xs text-muted-foreground">Desde </span>
                              )}
                              <span className="text-lg font-bold text-primary">{formatPrice(minPrice)}</span>
                            </div>
                            {!p.is_in_stock && p.is_pre_order_active && (
                              <Badge variant="outline" className="border-amber-500 text-amber-700">Pre-venta</Badge>
                            )}
                            {!p.is_in_stock && !p.is_pre_order_active && (
                              <Badge variant="outline" className="border-gray-400 text-gray-500">Agotado</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <span className="self-center text-sm text-muted-foreground">
                  {page} de {totalPages}
                </span>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
