import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { formatBs } from '@/lib/format';
import { cartItemKey, FREE_SHIPPING_THRESHOLD, useShop } from '@/lib/shop';

export function CartDrawer() {
  const { cartOpen, closeCart, cartItems, cartCount, subtotal, setQuantity, removeFromCart } = useShop();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const goToCheckout = () => {
    closeCart();
    setLocation('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[65]" data-testid="cart-drawer">
      <button type="button" aria-label="Cerrar carrito" onClick={closeCart} className="absolute inset-0 bg-[#0A0A0A]/45 backdrop-blur-[2px]" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-manifest-title"
        className="cart-manifest absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col bg-[#0A0A0A] text-[#F9F9F7] shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/50">Tu selección</p>
            <h2 id="cart-manifest-title" className="mt-1 text-[24px] font-semibold uppercase leading-none tracking-[-.03em]">
              Carrito <span data-testid="text-cart-count" className="font-mono text-[12px] font-normal text-white/50">({cartCount})</span>
            </h2>
          </div>
          <button type="button" data-testid="button-close-cart" onClick={closeCart} aria-label="Cerrar carrito" className="flex h-9 w-9 items-center justify-center border border-white/20 transition-colors hover:border-white hover:bg-white hover:text-[#0A0A0A]">
            <X size={17} strokeWidth={1.6} />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={28} strokeWidth={1.2} className="text-white/40" />
            <p className="mt-4 text-[13px] font-semibold uppercase tracking-[.06em]">Tu bolsa está vacía</p>
            <p className="mt-2 max-w-[240px] text-[11px] leading-[1.6] text-white/50">Guarda tu próximo drop y vuelve cuando estés listo.</p>
            <button
              type="button"
              onClick={() => { closeCart(); setLocation('/products'); }}
              className="mt-6 h-11 border border-white/30 px-5 text-[10px] font-bold uppercase tracking-[.12em] transition-colors hover:bg-white hover:text-[#0A0A0A]"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-[10px] uppercase tracking-[.12em] text-white/55">
                {remaining > 0
                  ? <>Te faltan <strong className="font-mono text-white">{formatBs(remaining)}</strong> para envío gratis</>
                  : <span className="text-[#7C9BFF]">Envío gratis desbloqueado</span>}
              </p>
              <div className="mt-2 h-[2px] w-full bg-white/15">
                <div className="h-full bg-[#0047FF] transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {cartItems.map((item, index) => {
                const key = cartItemKey(item);
                return (
                  <div key={key} data-testid={`cart-item-${index}`} className="flex gap-4 border-b border-white/10 py-5">
                    <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="h-[92px] w-[70px] shrink-0 bg-white/5 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-white/45">{item.brand}</p>
                      <p className="mt-1 text-[12px] font-medium leading-[1.35]">{item.name}</p>
                      {item.selectedSize && <p className="mt-1 text-[9px] uppercase tracking-[.1em] text-white/45">Talla {item.selectedSize}</p>}
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center border border-white/20">
                          <button type="button" data-testid={`button-cart-decrease-${index}`} onClick={() => setQuantity(key, item.quantity - 1)} aria-label={`Quitar una unidad de ${item.name}`} className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-white hover:text-[#0A0A0A]">
                            <Minus size={13} />
                          </button>
                          <span className="min-w-8 text-center font-mono text-[12px]" data-testid={`text-cart-quantity-${index}`}>{item.quantity}</span>
                          <button type="button" data-testid={`button-cart-increase-${index}`} onClick={() => setQuantity(key, item.quantity + 1)} aria-label={`Añadir una unidad de ${item.name}`} className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-white hover:text-[#0A0A0A]">
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="font-mono text-[13px]">{formatBs(item.priceValue * item.quantity)}</span>
                      </div>
                    </div>
                    <button type="button" data-testid={`button-cart-remove-${index}`} onClick={() => removeFromCart(key)} aria-label={`Eliminar ${item.name} del carrito`} className="self-start text-white/35 transition-colors hover:text-white">
                      <Trash2 size={15} strokeWidth={1.6} />
                    </button>
                  </div>
                );
              })}
            </div>

            <footer className="border-t border-white/15 px-6 pb-6 pt-5">
              <dl className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-[.12em] text-white/55">Subtotal</dt>
                  <dd data-testid="text-cart-subtotal" className="font-mono">{formatBs(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 uppercase tracking-[.12em] text-white/55"><Truck size={12} /> Envío</dt>
                  <dd className="font-mono text-white/75">{remaining > 0 ? 'A coordinar' : 'Gratis'}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-white/15 pt-3">
                  <dt className="text-[11px] font-bold uppercase tracking-[.12em]">Total</dt>
                  <dd data-testid="text-cart-total" className="font-mono text-[18px] font-semibold">{formatBs(subtotal)}</dd>
                </div>
              </dl>
              <button
                type="button"
                data-testid="button-cart-checkout"
                onClick={goToCheckout}
                className="mt-4 flex h-12 w-full items-center justify-between bg-[#0047FF] px-5 text-[10px] font-bold uppercase tracking-[.14em] text-white transition-colors hover:bg-[#0038CC]"
              >
                <span>Finalizar compra</span>
                <ArrowRight size={17} />
              </button>
              <button type="button" onClick={closeCart} className="mt-3 w-full text-center text-[9px] font-semibold uppercase tracking-[.12em] text-white/50 underline underline-offset-4 transition-colors hover:text-white">
                Seguir comprando
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
