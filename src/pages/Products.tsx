import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndependentSearchBar from '@/components/IndependentSearchBar';
import ProductCard, { Product } from '@/components/ProductCard';
import StickyCartBar from '@/components/StickyCartBar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';
import analytics from '@/services/analytics';

interface Category {
  id: number;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    api.get('api/client/products/categories')
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  const fetchProducts = async (search: string, page: number, catId: number | null) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (search.trim()) params.search = search.trim();
      if (catId) params.category_id = catId;

      const response = await api.get('api/client/products', { params });
      setProducts(response.data.data?.data || []);
      setTotalPages(response.data.data?.last_page || 1);

      if (response.data.data?.data?.length > 0) {
        analytics.trackEvent('view_item_list', {
          item_list_name: 'Productos',
          item_list_id: 'products_page',
          items: response.data.data.data.slice(0, 5).map((p: Product) => ({
            item_id: p.id,
            item_name: p.name,
            item_category: 'product',
          })),
        });
        if (search?.trim()) analytics.trackSearch(search.trim());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos. Intente nuevamente más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') || '1') : 1;
    const search = searchParams.get('search') || '';
    setCurrentPage(page);
    fetchProducts(search, page, categoryId);
  }, [searchParams, categoryId]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-28 pb-8 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Tienda</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-up">
            Tienda APACG
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl animate-fade-up">
            Merchandising oficial y productos de A.P.A.C. GOETHE.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <IndependentSearchBar
                placeholder="Buscar producto..."
                showCategoryFilter={false}
                module="products"
              />
            </div>
            {categories.length > 0 && (
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm md:w-56"
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-80 bg-muted/30 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  delay={100 + index * 80}
                  position={index}
                  listName="products_page"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchParams.get('search')
                  ? `No se encontraron productos que contengan "${searchParams.get('search')}".`
                  : 'No hay productos disponibles.'}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => handlePageChange(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <PaginationItem key={page}>...</PaginationItem>;
                  }
                  return null;
                })}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      <StickyCartBar />
      <Footer />
    </div>
  );
};

export default Products;
