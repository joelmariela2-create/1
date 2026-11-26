import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Heart, X } from 'lucide-react';
import { formatBs } from '@/lib/format';
import { useShop } from '@/lib/shop';

export function WishlistDrawer() {
  const { wishlistOpen, closeWishlist, favorites, toggleFavorite, addToCart, openCart, notify } = useShop();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!wishlistOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeWishlist();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [wishlistOpen, closeWishlist]);

  if (!wishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-[64]" data-testid="wishlist-drawer">
      <button type="button" aria-label="Cerrar favoritos" onClick={closeWishlist} className="absolute inset-0 bg-[#0A0A0A]/35 backdrop-blur-[2px]" />
      <aside role="dialog" aria-modal="true" aria-labelledby="wishlist-title" className="cart-manifest absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col bg-[#F9F9F7] text-[#0A0A0A] shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#E5E5E1] px-6 py-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#6B6B66]">Guardados</p>
            <h2 id="wishlist-title" className="mt-1 text-[24px] font-semibold uppercase leading-none tracking-[-.03em]">
              Favoritos <span data-testid="text-wishlist-count" className="font-mono text-[12px] font-normal text-[#6B6B66]">({favorites.length})</span>
            </h2>
          </div>
          <button type="button" data-testid="button-close-wishlist" onClick={closeWishlist} aria-label="Cerrar favoritos" className="flex h-9 w-9 items-center justify-center border border-[#E5E5E1] transition-colors hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white">
            <X size={17} strokeWidth={1.6} />
          </button>
        </header>

        {favorites.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <Heart size={28} strokeWidth={1.2} className="text-[#0047FF]" />
            <p className="mt-4 text-[13px] font-semibold uppercase tracking-[.06em]">Aún no guardas nada</p>
            <p className="mt-2 max-w-[240px] text-[11px] leading-[1.6] text-[#6B6B66]">Toca el corazón de un producto para guardarlo y encontrarlo aquí.</p>
            <button type="button" onClick={() => { closeWishlist(); setLocation('/products'); }} className="mt-6 h-11 border border-[#0A0A0A] px-5 text-[10px] font-bold uppercase tracking-[.12em] transition-colors hover:bg-[#0A0A0A] hover:text-white">
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6">
            {favorites.map((item, index) => (
              <div key={item.id} data-testid={`wishlist-item-${index}`} className="flex gap-4 border-b border-[#E5E5E1] py-5">
                <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="h-[92px] w-[70px] shrink-0 bg-[#EFEFEC] object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-[#6B6B66]">{item.brand}</p>
                  <p className="mt-1 text-[12px] font-medium leading-[1.35]">{item.name}</p>
                  <p className="mt-1 font-mono text-[12px]">{formatBs(item.priceValue)}</p>
                  <button
                    type="button"
                    data-testid={`button-wishlist-add-${index}`}
                    onClick={() => { addToCart(item, item.selectedSize); closeWishlist(); openCart(); notify(`${item.name} añadido al carrito`); }}
                    className="mt-2 inline-flex items-center gap-1.5 border-b border-[#0047FF] pb-0.5 text-[9px] font-bold uppercase tracking-[.1em] text-[#0047FF]"
                  >
                    Añadir al carrito <ArrowRight size={12} />
                  </button>
                </div>
                <button type="button" data-testid={`button-wishlist-remove-${index}`} onClick={() => toggleFavorite(item)} aria-label={`Quitar ${item.name} de favoritos`} className="self-start text-[#0047FF] transition-colors hover:text-[#0A0A0A]">
                  <Heart size={16} fill="currentColor" strokeWidth={1.4} />
                </button>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
