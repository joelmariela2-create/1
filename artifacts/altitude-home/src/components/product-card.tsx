import { memo } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Plus, ShoppingCart } from 'lucide-react';
import { getProductCardImageFit, getProductCardImageStyle } from '@/lib/product-visuals';
import { useShop } from '@/lib/shop';

export type ProductCardProduct = {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceValue: number;
  image: string;
  status?: string;
  isBestSeller?: boolean;
};

type ProductCardProps = {
  product: ProductCardProduct;
  index?: number;
  compact?: boolean;
};

function ProductCardBase({ product, index = 0, compact = false }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const { addToCart, openCart, toggleFavorite, isFavorite, notify } = useShop();
  const favorite = isFavorite(product.id);
  const openProduct = () => setLocation(`/products/${product.id}`);
  const handleAdd = () => {
    addToCart(product);
    openCart();
    notify(`${product.name} añadido al carrito`);
  };

  return (
    <article
      data-testid={`card-product-${product.id}`}
      role="link"
      tabIndex={0}
      onClick={(event) => { if ((event.target as HTMLElement).closest('a,button')) return; openProduct(); }}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProduct(); } }}
      className="product-card group flex min-w-0 cursor-pointer flex-col"
    >
      <div className={`product-card-image relative aspect-[.66] overflow-hidden ${product.id.includes('tom-and-jerry') ? 'bg-white' : ''}`}>
        <Link href={`/products/${product.id}`} data-testid={`link-product-image-${product.id}`} aria-label={`Ver detalle de ${product.name}`} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'auto'}
            style={getProductCardImageStyle(product)}
            className={`product-card-product-image h-full w-full ${getProductCardImageFit(product)} object-center`}
          />
        </Link>

        <button
          type="button"
          data-testid={`button-favorite-${product.id}`}
          onClick={() => { toggleFavorite(product); notify(favorite ? 'Quitado de favoritos' : 'Guardado en favoritos'); }}
          aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
          aria-pressed={favorite}
          className={`product-favorite absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${favorite ? 'is-favorite bg-[#0047FF] text-white' : 'bg-white/95 text-[#141414] hover:bg-[#141414] hover:text-white'}`}
        >
          <Heart size={14} strokeWidth={1.7} fill={favorite ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          data-testid={`button-cart-product-${product.id}`}
          onClick={handleAdd}
          aria-label={`Añadir al carrito: ${product.name}`}
          className="product-cart absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F9F9F7]/95 transition-colors hover:bg-[#0A0A0A] hover:text-white"
        >
          <ShoppingCart size={15} strokeWidth={1.6} />
        </button>

        {product.status === 'Últimas unidades' && (
          <span className="absolute bottom-2 left-2 bg-[#0A0A0A] px-2 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-white">Últimas unidades</span>
        )}

        {!compact && (
          <button type="button" onClick={handleAdd} tabIndex={-1} aria-hidden="true" className="product-quick-add absolute bottom-0 left-0 right-0 hidden h-9 items-center justify-center gap-2 bg-[#0A0A0A] text-[9px] font-bold uppercase tracking-[.1em] text-white md:flex">
            Añadir rápido <Plus size={13} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-2">
        <h3 data-testid={`text-product-name-${product.id}`} className="text-[14px] font-medium leading-[1.3] text-[#0A0A0A]">
          <Link href={`/products/${product.id}`} data-testid={`link-product-name-${product.id}`} className="transition-colors hover:text-[#0047FF]">{product.name}</Link>
        </h3>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.1em] text-[#6B6B66]">{product.brand}</p>
        <p data-testid={`text-product-price-${product.id}`} className="mt-1 font-mono text-[14px] font-semibold leading-none tabular-nums text-[#0A0A0A]">{product.price}</p>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
