import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { playCartBell } from '@/lib/store-sounds';

/** Monto mínimo para envío gratuito (en bolivianos). */
export const FREE_SHIPPING_THRESHOLD = 500;
export const MAX_ITEM_QUANTITY = 10;

export type ShopProduct = {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceValue: number;
  image: string;
};

export type CartItem = ShopProduct & { selectedSize?: string; quantity: number };
export type WishlistItem = ShopProduct & { selectedSize?: string };

const CART_KEY = 'altitude-cart-v2';
const LEGACY_CART_KEY = 'altitude-cart';
const WISHLIST_KEY = 'altitude-wishlist';

export const cartItemKey = (item: { id: string; selectedSize?: string }) => `${item.id}::${item.selectedSize ?? ''}`;

const clampQuantity = (value: number) => Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(value) || 1));

function snapshot(product: ShopProduct, selectedSize?: string): ShopProduct & { selectedSize?: string } {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    priceValue: product.priceValue,
    image: product.image,
    selectedSize,
  };
}

function readCart(): CartItem[] {
  try {
    const saved = window.localStorage.getItem(CART_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CartItem[];
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => item && typeof item.id === 'string')
          .map((item) => ({ ...item, quantity: clampQuantity(item.quantity ?? 1) }));
      }
    }
    // Migración del carrito anterior (sin cantidades).
    const legacy = window.localStorage.getItem(LEGACY_CART_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as (ShopProduct & { selectedSize?: string })[];
      if (Array.isArray(parsed)) return parsed.filter((item) => item && typeof item.id === 'string').map((item) => ({ ...item, quantity: 1 }));
    }
    return [];
  } catch {
    return [];
  }
}

function readWishlist(): WishlistItem[] {
  try {
    const saved = window.localStorage.getItem(WISHLIST_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string') : [];
  } catch {
    return [];
  }
}

type ShopContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  favorites: WishlistItem[];
  favoriteIds: string[];
  toast: string;
  cartOpen: boolean;
  wishlistOpen: boolean;
  addToCart: (product: ShopProduct, selectedSize?: string, quantity?: number) => void;
  removeFromCart: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (product: ShopProduct, selectedSize?: string) => void;
  isFavorite: (id: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  notify: (message: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(readCart);
  const [favorites, setFavorites] = useState<WishlistItem[]>(readWishlist);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Bloquea el scroll del fondo mientras hay un panel abierto.
  useEffect(() => {
    if (!cartOpen && !wishlistOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [cartOpen, wishlistOpen]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const addToCart = useCallback((product: ShopProduct, selectedSize?: string, quantity = 1) => {
    playCartBell();
    setCartItems((items) => {
      const key = cartItemKey({ id: product.id, selectedSize });
      const index = items.findIndex((item) => cartItemKey(item) === key);
      if (index === -1) return [...items, { ...snapshot(product, selectedSize), quantity: clampQuantity(quantity) }];
      const next = [...items];
      next[index] = { ...next[index], quantity: clampQuantity(next[index].quantity + quantity) };
      return next;
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCartItems((items) => items.filter((item) => cartItemKey(item) !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setCartItems((items) => (quantity <= 0
      ? items.filter((item) => cartItemKey(item) !== key)
      : items.map((item) => (cartItemKey(item) === key ? { ...item, quantity: clampQuantity(quantity) } : item))));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const toggleFavorite = useCallback((product: ShopProduct, selectedSize?: string) => {
    setFavorites((items) => (items.some((item) => item.id === product.id)
      ? items.filter((item) => item.id !== product.id)
      : [{ ...snapshot(product, selectedSize) }, ...items]));
  }, []);

  const favoriteIds = useMemo(() => favorites.map((item) => item.id), [favorites]);
  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  const { cartCount, subtotal } = useMemo(() => cartItems.reduce(
    (totals, item) => ({
      cartCount: totals.cartCount + item.quantity,
      subtotal: totals.subtotal + item.priceValue * item.quantity,
    }),
    { cartCount: 0, subtotal: 0 },
  ), [cartItems]);

  const value = useMemo<ShopContextValue>(() => ({
    cartItems,
    cartCount,
    subtotal,
    favorites,
    favoriteIds,
    toast,
    cartOpen,
    wishlistOpen,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart,
    toggleFavorite,
    isFavorite,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    openWishlist: () => setWishlistOpen(true),
    closeWishlist: () => setWishlistOpen(false),
    notify,
  }), [cartItems, cartCount, subtotal, favorites, favoriteIds, toast, cartOpen, wishlistOpen, addToCart, removeFromCart, setQuantity, clearCart, toggleFavorite, isFavorite, notify]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error('useShop debe utilizarse dentro de ShopProvider');
  return value;
}
