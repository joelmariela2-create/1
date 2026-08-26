import { createContext, type FormEvent, type MouseEvent, type ReactNode, type TouchEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { playCartBell, playEntranceSound, startBackgroundMusic } from '@/lib/store-sounds';
import { Link, Route, Switch, useLocation, Router as WouterRouter, useParams } from 'wouter';
import {
  ArrowLeft, ArrowRight, Box, Check, CheckCircle2, ChevronLeft, ChevronRight, Crown, CreditCard, Flame, Heart, House,
  LockKeyhole, MapPin, Menu, MessageCircle, Phone, Plus, RefreshCw, Search, ShieldCheck, UserRound,
  ShoppingBag, ShoppingCart, SlidersHorizontal, Tag, Truck, X, Zap,
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa6';

const queryClient = new QueryClient();
const storeWhatsAppUrl = 'https://wa.me/522223786688';
const mxnFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const formatMXN = (value: number) => `MXN ${mxnFormatter.format(value)}`;

type Campaign = {
  label: string;
  title: string;
  image: string;
  position: string;
  tone: 'light' | 'dark';
  id: string;
};

const campaigns: Campaign[] = [
  { label: 'OLYM.SHOP', title: 'OLYM.SHOP', image: '/olym-shop-mark.webp', position: 'center center', tone: 'dark', id: 'olym-shop-black' },
  { label: 'Gymshark', title: 'Nuevos ingresos', image: '/gymshark-logo.webp', position: 'center 35%', tone: 'light', id: 'gymshark-featured' },
  { label: 'YoungLA', title: 'Nueva colección', image: '/youngla-logo.webp', position: 'center 35%', tone: 'light', id: 'youngla-featured' },
  { label: 'Breathe Divinity', title: 'Breathe Divinity', image: '/breathe-divinity-cover.webp', position: 'center center', tone: 'dark', id: 'breathe-divinity-featured' },
];

type Product = {
  id: string;
  name: string;
  brand: 'ALTITUDE' | 'YoungLA' | 'Gymshark' | 'Breathe Divinity';
  price: string;
  priceValue: number;
  image: string;
  category: 'Compresión' | 'Hoodies' | 'Joggers' | 'Shorts' | 'Poleras';
  status: 'Nuevo' | 'Disponible' | 'Últimas unidades';
  isBestSeller?: boolean;
  material?: string;
  fabricWeight?: string;
  fit?: string;
  features?: string[];
  sizes?: string[];
};

const products: Product[] = [
  { id: 'breathe-sculpt-longline', name: 'Polera Compresión Core — Negra', brand: 'Breathe Divinity', price: formatMXN(365), priceValue: 365, category: 'Compresión', status: 'Últimas unidades', image: '/breathe-compression-black.webp' },
  { id: 'breathe-compression-graphite', name: 'Polera Compresión Core — Grafito', brand: 'Breathe Divinity', price: formatMXN(365), priceValue: 365, category: 'Compresión', status: 'Disponible', image: '/breathe-compression-graphite.webp' },
  { id: 'breathe-compression-white', name: 'Polera Compresión Core — Blanca', brand: 'Breathe Divinity', price: formatMXN(365), priceValue: 365, category: 'Compresión', status: 'Disponible', image: '/breathe-compression-white.webp' },
  { id: 'breathe-compression-graphic', name: 'Polera Compresión Graphic — Negra', brand: 'Breathe Divinity', price: formatMXN(399), priceValue: 399, category: 'Compresión', status: 'Nuevo', image: '/breathe-compression-graphic.webp' },
  { id: 'altitude-core-tee', name: 'Polera Essential Core', brand: 'ALTITUDE', price: formatMXN(249), priceValue: 249, category: 'Poleras', status: 'Nuevo', image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=800', isBestSeller: true },
  { id: 'youngla-everyday-heavy', name: 'Polera Everyday Heavy', brand: 'YoungLA', price: formatMXN(289), priceValue: 289, category: 'Poleras', status: 'Disponible', image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800', isBestSeller: true },
  { id: 'gymshark-pace-short', name: 'Short de entrenamiento Pace 5”', brand: 'Gymshark', price: formatMXN(319), priceValue: 319, category: 'Shorts', status: 'Nuevo', image: 'https://images.pexels.com/photos/6550851/pexels-photo-6550851.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'altitude-studio-hoodie', name: 'Hoodie con cierre Studio', brand: 'ALTITUDE', price: formatMXN(429), priceValue: 429, category: 'Hoodies', status: 'Disponible', image: 'https://images.pexels.com/photos/6347547/pexels-photo-6347547.jpeg?auto=compress&cs=tinysrgb&w=800', isBestSeller: true },
  { id: 'youngla-boxy-jogger', name: 'Jogger Boxy Essential', brand: 'YoungLA', price: formatMXN(399), priceValue: 399, category: 'Joggers', status: 'Disponible', image: 'https://images.pexels.com/photos/6311653/pexels-photo-6311653.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'gymshark-arrival-tee', name: 'Polera Arrival Seamless', brand: 'Gymshark', price: formatMXN(279), priceValue: 279, category: 'Compresión', status: 'Nuevo', image: 'https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=800', isBestSeller: true },
  { id: 'altitude-training-short', name: 'Short Training Utility', brand: 'ALTITUDE', price: formatMXN(299), priceValue: 299, category: 'Shorts', status: 'Disponible', image: 'https://images.pexels.com/photos/6551133/pexels-photo-6551133.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'breathe-ritual-hoodie', name: 'Hoodie Ritual Fleece', brand: 'Breathe Divinity', price: formatMXN(449), priceValue: 449, category: 'Hoodies', status: 'Últimas unidades', image: 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'youngla-combat-jogger', name: 'Jogger Combat Core', brand: 'YoungLA', price: formatMXN(419), priceValue: 419, category: 'Joggers', status: 'Disponible', image: 'https://images.pexels.com/photos/6311606/pexels-photo-6311606.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

const productDetails: Record<string, Pick<Product, 'material' | 'fabricWeight' | 'fit' | 'features' | 'sizes'>> = {
  'altitude-core-tee': { material: 'Algodón peinado', fabricWeight: '220 GSM', fit: 'Regular fit', sizes: ['XS', 'S', 'M', 'L', 'XL'], features: ['Costuras reforzadas en hombros', 'Cuello acanalado de recuperación', 'Etiqueta tejida ALTITUDE'] },
  'youngla-everyday-heavy': { material: 'Jersey de algodón', fabricWeight: '240 GSM', fit: 'Oversized fit', sizes: ['S', 'M', 'L', 'XL'], features: ['Hombro caído', 'Dobladillo pesado', 'Lavado suave de alto contraste'] },
  'gymshark-pace-short': { material: 'Nylon técnico', fabricWeight: '140 GSM · ligero', fit: 'Athletic fit', sizes: ['S', 'M', 'L', 'XL'], features: ['Secado rápido', 'Bolsillo lateral con cierre', 'Cordón interno ajustable'] },
  'altitude-studio-hoodie': { material: 'French terry de algodón', fabricWeight: '380 GSM', fit: 'Relaxed fit', sizes: ['S', 'M', 'L', 'XL'], features: ['Cierre metálico YKK', 'Capucha de doble capa', 'Bolsillos de costura limpia'] },
  'breathe-sculpt-longline': { material: 'Nylon reciclado y elastano', fabricWeight: '260 GSM · compresivo', fit: 'Second-skin fit', sizes: ['XS', 'S', 'M'], features: ['Soporte medio', 'Paneles de contorno', 'Protección UV 50+'] },
  'breathe-compression-graphite': { material: 'Nylon reciclado y elastano', fabricWeight: '260 GSM · compresivo', fit: 'Second-skin fit', sizes: ['XS', 'S', 'M'], features: ['Soporte medio', 'Paneles de contorno', 'Protección UV 50+'] },
  'breathe-compression-white': { material: 'Nylon reciclado y elastano', fabricWeight: '260 GSM · compresivo', fit: 'Second-skin fit', sizes: ['XS', 'S', 'M'], features: ['Soporte medio', 'Paneles de contorno', 'Protección UV 50+'] },
  'breathe-compression-graphic': { material: 'Nylon reciclado y elastano', fabricWeight: '260 GSM · compresivo', fit: 'Second-skin fit', sizes: ['XS', 'S', 'M'], features: ['Soporte medio', 'Paneles de contorno', 'Protección UV 50+'] },
  'youngla-boxy-jogger': { material: 'Algodón french terry', fabricWeight: '360 GSM', fit: 'Boxy relaxed fit', sizes: ['S', 'M', 'L', 'XL'], features: ['Cintura elástica ancha', 'Bolsillos profundos', 'Puño acanalado'] },
  'gymshark-arrival-tee': { material: 'Poliéster reciclado', fabricWeight: '160 GSM · ultraligero', fit: 'Slim fit', sizes: ['S', 'M', 'L', 'XL'], features: ['Construcción seamless', 'Paneles de ventilación', 'Costuras antirozaduras'] },
  'altitude-training-short': { material: 'Nylon ripstop', fabricWeight: '155 GSM · ligero', fit: 'Regular fit', sizes: ['S', 'M', 'L', 'XL'], features: ['Bolsillo cargo discreto', 'Tejido repelente al agua', 'Logo bordado'] },
  'breathe-ritual-hoodie': { material: 'Algodón cepillado', fabricWeight: '400 GSM · cálido', fit: 'Relaxed fit', sizes: ['S', 'M', 'L'], features: ['Interior fleece', 'Capucha envolvente', 'Acabado lavado'] },
  'youngla-combat-jogger': { material: 'Algodón y poliéster', fabricWeight: '320 GSM', fit: 'Tapered fit', sizes: ['S', 'M', 'L', 'XL'], features: ['Rodilla articulada', 'Cordón plano', 'Bolsillo trasero seguro'] },
};

function getProductDetails(product: Product) {
  return { ...product, ...productDetails[product.id] };
}

type CartItem = Product & { selectedSize?: string };
const mexicoCities = [
  'Aguascalientes', 'Acapulco', 'Cancún', 'Campeche', 'Celaya', 'Chihuahua', 'Ciudad de México',
  'Ciudad Juárez', 'Culiacán', 'Cuernavaca', 'Durango', 'Ensenada', 'Guanajuato', 'Guadalajara',
  'Hermosillo', 'La Paz', 'León', 'Mérida', 'Mexicali', 'Morelia', 'Monterrey', 'Oaxaca',
  'Pachuca', 'Puebla', 'Pueblo Morelos', 'Puerto Vallarta', 'Querétaro', 'Saltillo',
  'San Luis Potosí', 'Tampico', 'Tepic', 'Tijuana', 'Toluca', 'Tuxtla Gutiérrez', 'Veracruz',
  'Villahermosa', 'Zacatecas',
];
type CustomerData = { name: string; phone: string; country: string; city: string };
function createOrderMessage(customer: CustomerData, cartItems: CartItem[], total: number) {
  const summary = cartItems.map((item) => `${item.name}${item.selectedSize ? ` · talla ${item.selectedSize}` : ''}`).join(', ');
  return `🌐 VENGO DE LA TIENDA VIRTUAL 🛒\n\n«🛍️ MI PEDIDO SELECCIONADO 📦\n\n📦 PEDIDO: ${summary}\n🔢 CANTIDAD: ${cartItems.length}\n💰 TOTAL: ${formatMXN(total)}\n\n📊 DATOS DEL CLIENTE:\n📝 NOMBRE COMPLETO: ${customer.name}\n📲 TELÉFONO: ${customer.phone}\n🇲🇽 PAÍS: ${customer.country}\n📍 CIUDAD / PUEBLO: ${customer.city}»`;
}
function openOrderWhatsApp(customer: CustomerData, cartItems: CartItem[], total: number) {
  const whatsappUrl = `${storeWhatsAppUrl}?text=${encodeURIComponent(createOrderMessage(customer, cartItems, total))}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}
type ShopContextValue = {
  cartItems: CartItem[];
  favorites: string[];
  toast: string;
  addToCart: (product: Product, selectedSize?: string) => void;
  removeFromCart: (id: string) => void;
  toggleFavorite: (id: string) => void;
  notify: (message: string) => void;
};
const ShopContext = createContext<ShopContextValue | null>(null);
function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error('useShop debe utilizarse dentro de ShopProvider');
  return value;
}

function OrderForm({ cartItems, total, onConfirm }: { cartItems: CartItem[]; total: number; onConfirm: (customer: CustomerData) => void }) {
  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '', country: 'México', city: '' });
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm(customer);
  };
  return <form onSubmit={handleSubmit} className="mt-5 border-t border-[#171717] pt-5">
    <div className="mb-4">
      <p className="section-label text-[#d93731]">Datos de entrega</p>
      <h3 className="editorial-title mt-1 text-[18px] font-bold uppercase">Completa tu pedido</h3>
    </div>
    <div className="mb-5 border border-[#d9d3cc] bg-white px-3 py-3">
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[.1em] text-[#8b857e]">Resumen de pedido</p>
       <div className="space-y-1">{cartItems.map((item, index) => <div key={`${item.id}-${index}`} className="flex justify-between gap-3 text-[11px]"><span className="min-w-0 truncate">{item.name}{item.selectedSize ? ` · ${item.selectedSize}` : ''}</span><strong className="shrink-0">{formatMXN(item.priceValue)}</strong></div>)}</div>
       <div className="mt-3 flex justify-between border-t border-[#e6e2de] pt-3 text-[12px] font-bold"><span>TOTAL</span><span data-testid="text-order-summary-total">{formatMXN(total)}</span></div>
    </div>
      <div className="space-y-3">
       <label className="block"><span className="mb-1 block text-[9px] font-bold uppercase tracking-[.1em]">Nombre completo</span><input data-testid="input-order-name" required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Escribe tu nombre" className="h-11 w-full border border-[#cfc9c2] bg-white px-3 text-[12px] outline-none focus:border-[#171717]" /></label>
        <label className="block"><span className="mb-1 block text-[9px] font-bold uppercase tracking-[.1em]">Teléfono</span><input data-testid="input-order-phone" required type="tel" inputMode="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Ej. 55 1234 5678" className="h-11 w-full border border-[#cfc9c2] bg-white px-3 text-[12px] outline-none focus:border-[#171717]" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-[9px] font-bold uppercase tracking-[.1em]">País</span><select data-testid="select-order-country" required value={customer.country} onChange={(event) => setCustomer({ ...customer, country: event.target.value })} className="h-11 w-full border border-[#cfc9c2] bg-white px-3 text-[12px] outline-none focus:border-[#171717]"><option value="México">México</option></select></label>
          <label className="block"><span className="mb-1 block text-[9px] font-bold uppercase tracking-[.1em]">Ciudad o pueblo</span><select data-testid="select-order-city" required value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} className="h-11 w-full border border-[#cfc9c2] bg-white px-3 text-[12px] outline-none focus:border-[#171717]"><option value="">Selecciona tu ciudad o pueblo</option>{mexicoCities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
        </div>
     </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#d9d3cc] pt-4"><span className="text-[10px] font-bold uppercase tracking-[.1em]">Total del pedido</span><strong className="text-[18px]">{formatMXN(total)}</strong></div>
     <button data-testid="button-confirm-order" type="submit" className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-[#25D366] text-[10px] font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-[#1da851]"><CheckCircle2 size={16} /> Confirmar pedido <ArrowRight size={16} /></button>
     <p className="mt-3 text-center text-[9px] text-[#8b857e]">Tus datos se enviarán junto con el pedido por WhatsApp.</p>
  </form>;
}

function OrderConfirmed({ customer, cartItems, total, onClose }: { customer: CustomerData; cartItems: CartItem[]; total: number; onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#171717]/55 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="order-confirmed-title">
    <div className="w-full max-w-[390px] overflow-hidden bg-[#f6f4f0] text-center shadow-2xl">
      <img src="/pedido-confirmado.svg" alt="Pedido confirmado" className="h-[190px] w-full object-cover" />
      <div className="px-6 py-6"><p className="section-label text-[#d93731]">ALTITUDE / gracias</p><h2 id="order-confirmed-title" className="editorial-title mt-2 text-[27px] font-bold uppercase">Pedido confirmado</h2><p className="mt-3 text-[12px] leading-[1.5] text-[#716b65]">Recibimos tu solicitud, {customer.name.split(' ')[0]}. Tu pedido fue enviado a WhatsApp.</p><button data-testid="button-close-confirmation" onClick={onClose} className="mt-5 w-full border border-[#171717] py-3 text-[10px] font-bold uppercase tracking-[.1em]">Volver a la tienda</button></div>
    </div>
  </div>;
}

function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { cartItems } = useShop();
  const [confirmedCustomer, setConfirmedCustomer] = useState<CustomerData | null>(null);
  const total = cartItems.reduce((sum, item) => sum + item.priceValue, 0);
  const handleOrderConfirm = (customer: CustomerData) => {
    openOrderWhatsApp(customer, cartItems, total);
    setConfirmedCustomer(customer);
  };
  if (cartItems.length === 0) return <div className="page-shell flex min-h-[100dvh] flex-col items-center justify-center bg-[#f6f4f0] px-5 text-center"><ShoppingBag size={30} className="text-[#d93731]" /><p className="section-label mt-4 text-[#d93731]">Tu bolsa está vacía</p><h1 className="editorial-title mt-2 text-[28px] font-bold uppercase">Añade un producto para continuar</h1><button onClick={() => setLocation('/products')} className="mt-6 bg-[#171717] px-5 py-4 text-[10px] font-bold uppercase tracking-[.1em] text-white">Ver productos</button></div>;
  return <div className="checkout-page page-shell min-h-[100dvh] bg-[#f6f4f0] px-5 py-6 text-[#171717] md:px-10 md:py-10">
     <header className="flex items-center justify-between border-b border-[#d9d3cc] pb-5"><button onClick={() => setLocation('/products')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em]"><ArrowLeft size={16} /> Volver a la tienda</button><span className="altitude-wordmark text-[25px]">Olympo online</span></header>
      <main className="mx-auto max-w-[560px] py-8 md:py-14"><p className="section-label text-[#d93731]">olymposhop / checkout</p><h1 className="editorial-title mt-2 text-[clamp(2.2rem,6vw,4rem)] font-bold uppercase leading-[.9]">Confirma tu pedido</h1><p className="mt-3 max-w-[420px] text-[12px] leading-[1.5] text-[#716b65] rounded-tl-[0px] rounded-tr-[0px] rounded-br-[0px] rounded-bl-[0px]">Revisa tu selección y completa tus datos para coordinar la entrega en México.</p><OrderForm cartItems={cartItems} total={total} onConfirm={handleOrderConfirm} /></main>
    {confirmedCustomer && <OrderConfirmed customer={confirmedCustomer} cartItems={cartItems} total={total} onClose={() => setLocation('/products')} />}
  </div>;
}

function ShopProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem('altitude-cart');
      return saved ? JSON.parse(saved) as CartItem[] : [];
    } catch {
      return [];
    }
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  useEffect(() => {
    window.localStorage.setItem('altitude-cart', JSON.stringify(cartItems));
  }, [cartItems]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };
  const addToCart = (product: Product, selectedSize?: string) => {
    playCartBell();
    setCartItems((items) => [...items, { ...product, selectedSize }]);
  };
  const removeFromCart = (id: string) => setCartItems((items) => {
    const index = items.findIndex((item) => item.id === id);
    return index < 0 ? items : [...items.slice(0, index), ...items.slice(index + 1)];
  });
  const toggleFavorite = (id: string) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  return <ShopContext.Provider value={{ cartItems, favorites, toast, addToCart, removeFromCart, toggleFavorite, notify }}>{children}</ShopContext.Provider>;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Header({ cartCount, onMenu, onShop, onShowroom, onBenefits, onSearch, onCart }: { cartCount: number; onMenu: () => void; onShop?: () => void; onShowroom?: () => void; onBenefits?: () => void; onSearch?: () => void; onCart?: () => void }) {
  const [, setLocation] = useLocation();
  return (
    <>
      <div className="announcement-strip flex h-7 items-center overflow-hidden bg-[#eeece9] text-[9px] font-semibold uppercase tracking-[.16em] text-[#252525]" aria-label="Información de envíos">
        <div className="announcement-track flex min-w-max items-center">
           <span className="px-4">OLYMPO SHOP <span className="mx-2 text-[#c52d2a]">•</span> ONLINE <span className="mx-2 text-[#c52d2a]">-</span> 📦 ENVÍOS A TODO EL PAÍS 🇲🇽 <span className="mx-2 text-[#c52d2a]">·</span> MARCAS 100% ORIGINALES 🇺🇸 <span className="ml-8 mr-2 text-[#c52d2a]">•</span> ONLINE <span className="mx-2 text-[#c52d2a]">-</span></span>
           <span className="px-4" aria-hidden="true">OLYMPO SHOP <span className="mx-2 text-[#c52d2a]">•</span> ONLINE <span className="mx-2 text-[#c52d2a]">-</span> 📦 ENVÍOS A TODO EL PAÍS 🇲🇽 <span className="mx-2 text-[#c52d2a]">·</span> MARCAS 100% ORIGINALES 🇺🇸 <span className="ml-8 mr-2 text-[#c52d2a]">•</span> ONLINE <span className="mx-2 text-[#c52d2a]">-</span></span>
        </div>
      </div>
      <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b border-[#e6e2de] bg-white px-5 text-[#151515] md:h-[76px] md:px-8">
        <div className="flex items-center gap-1">
          <button data-testid="button-open-menu" onClick={onMenu} aria-label="Abrir menú" className="group relative -left-3 -top-2 flex h-8 w-8 items-center justify-center transition-colors hover:text-[#ec413b]"><Menu size={19} strokeWidth={1.7} /></button>
          <Link href="/" data-testid="link-home-logo" aria-label="OLYM.SHOP, inicio" className="relative -top-1 flex items-center gap-2 text-[#151515]">
            <img src="/olym-shop-logo.webp" alt="Logo OLYM.SHOP" className="header-logo-mark h-10 w-10 rounded-full object-cover ring-1 ring-[#171717] md:h-12 md:w-12" />
            <span className="header-wordmark text-[20px] md:text-[24px]">OLYMPO SHOP</span>
          </Link>
        </div>
         <div className="relative right-0 -top-2 flex items-center gap-2">
          <button data-testid="button-search" onClick={onSearch ?? (() => window.alert('La búsqueda estará disponible muy pronto.'))} aria-label="Buscar productos" className="flex h-8 w-8 items-center justify-center transition-colors hover:text-[#ec413b]"><Search size={20} strokeWidth={1.7} /></button>
          <button data-testid="button-open-cart" onClick={onCart ?? (() => window.alert('Tu carrito está listo para despegar.'))} aria-label="Abrir carrito" className="relative flex h-8 w-8 items-center justify-center transition-colors hover:text-[#ec413b]"><ShoppingCart size={21} strokeWidth={1.7} />{cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ca2f2b] px-1 text-[9px] font-bold text-white">{cartCount}</span>}</button>
        </div>
      </header>
       <nav className="desktop-nav sticky top-[62px] z-20 hidden h-11 items-center justify-center gap-12 border-b border-[#e6e2de] bg-white text-[10px] font-semibold uppercase tracking-[.15em] text-[#252525] md:top-[76px]">
        <button onClick={() => setLocation('/social')}>Redes sociales</button>
        <button onClick={() => setLocation('/collection')}>Colección</button>
        <button onClick={() => setLocation('/vip')} className="vip-nav-link inline-flex items-center gap-1.5 text-[#ec413b]"><Crown size={12} strokeWidth={1.8} /> Acceso VIP</button>
       <button onClick={onBenefits ?? (() => scrollToSection('benefits'))}>Beneficios</button>
     </nav>
    </>
  );
}

function CampaignHero({ onShop }: { onShop: (campaign: Campaign) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const campaign = campaigns[activeIndex];
  useEffect(() => {
    const nextCampaign = campaigns[(activeIndex + 1) % campaigns.length];
    const timer = window.setTimeout(() => {
      const preload = new Image();
      preload.decoding = 'async';
      preload.src = nextCampaign.image;
    }, 700);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);
  useEffect(() => {
    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % campaigns.length), 1300);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);
  const handleTouchStart = (event: TouchEvent<HTMLElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    const delta = endX === undefined ? 0 : endX - touchStartX.current;
    touchStartX.current = null;
    // A short flick should still advance the campaign; 18px feels responsive
    // without treating an accidental tap as a swipe.
    if (Math.abs(delta) >= 18) setActiveIndex((index) => (index + (delta < 0 ? 1 : campaigns.length - 1)) % campaigns.length);
  };
  const benefits = [
    { label: 'Envíos nacionales', detail: 'A todo México', icon: Truck },
    { label: 'Productos originales', detail: 'Marcas 100% auténticas', icon: ShieldCheck },
    { label: 'Pago seguro', detail: 'Contra entrega', icon: CreditCard },
    { label: 'Cambios fáciles', detail: 'Compra con confianza', icon: RefreshCw },
  ];
  return (
    <section id="campaign-hero" className="campaign-hero relative flex h-auto min-h-0 flex-col overflow-hidden bg-[#050505] text-[#151515] md:h-auto md:min-h-[680px]" aria-label="Campaña destacada" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
       <img key={campaign.id} className="campaign-image absolute inset-0 h-full w-full object-contain" src={campaign.image} alt={`${campaign.label} ${campaign.title}`} style={{ objectPosition: campaign.position, transform: campaign.id === 'olym-shop-black' ? 'translateY(-28px)' : campaign.id === 'olym-shop-blue' ? 'scale(1.22)' : campaign.id === 'youngla-featured' ? 'translateY(-24px) scale(1.08)' : campaign.id === 'breathe-divinity-featured' ? 'translateY(-42px)' : undefined }} loading="eager" decoding="async" fetchPriority={activeIndex === 0 ? 'high' : 'auto'} />
      {campaign.id === 'gymshark-featured' && <div aria-hidden="true" className="absolute bottom-[93px] left-0 right-0 z-[1] h-3 bg-[#050505]" />}
       <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,.2) 100%)' }} />
      <div className="relative z-10 flex flex-1 flex-col justify-between px-5 pb-6 pt-8 md:px-10 md:pb-8 md:pt-12">
        <div className="campaign-content absolute bottom-[18px] left-5 right-5 max-w-[520px]">
          <button data-testid={`button-collection-${campaign.id}`} onClick={() => onShop(campaign)} className="hero-cta group flex h-[44px] w-[240px] items-center justify-between border border-white bg-transparent px-4 text-[10px] font-bold uppercase tracking-[.1em] text-white transition-colors hover:bg-white hover:text-[#151515]">Ver colección <ArrowRight size={20} strokeWidth={1.7} className="transition-transform group-hover:translate-x-1" /></button>
        </div>
      </div>
      <div id="benefits" className="relative z-10 grid grid-cols-4 border-t border-[#dedad6] bg-white/95 backdrop-blur-md">
        {benefits.map(({ label, detail, icon: Icon }, index) => <div key={label} className={`hero-benefit flex min-h-[93px] flex-col items-center justify-center px-1 text-center ${index < benefits.length - 1 ? 'border-r border-[#dedad6]' : ''}`}><Icon size={22} strokeWidth={1.45} className="mb-2 text-[#252525]" /><strong className="max-w-[78px] text-[8px] font-bold uppercase leading-[1.18] tracking-[.03em] md:max-w-none md:text-[10px]">{label}</strong><span className="mt-1 hidden text-[8px] text-[#77716c] md:block">{detail}</span></div>)}
      </div>
      <div className="absolute bottom-[98px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5" aria-label={`Campaña ${activeIndex + 1} de ${campaigns.length}`}>{campaigns.map((item, index) => <span key={item.id} className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${activeIndex === index ? 'scale-125 bg-white' : 'bg-white/45'}`} />)}</div>
    </section>
  );
}

function ProductCardPhoto({ product, testId, zoomEnabled = true }: { product: Product; testId: string; zoomEnabled?: boolean }) {
  const [, setLocation] = useLocation();
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const productIndex = products.findIndex((item) => item.id === product.id);

  const goToProduct = (index: number) => {
    const nextProduct = products[index];
    if (nextProduct) setLocation(`/products/${nextProduct.id}`);
  };
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    const delta = endX === undefined ? 0 : endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 36) return;
    didSwipe.current = true;
    window.setTimeout(() => { didSwipe.current = false; }, 300);
    goToProduct(productIndex + (delta < 0 ? 1 : -1));
  };
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (didSwipe.current) return;
    if (zoomEnabled) setZoomOpen(true);
    else goToProduct(productIndex);
  };

  return (
    <>
      <div
        data-testid={testId}
        role="button"
        tabIndex={0}
        aria-label={`${zoomEnabled ? 'Ampliar foto' : 'Ver detalle'} de ${product.name}; desliza para cambiar de producto`}
        className={`relative h-full w-full ${zoomEnabled ? 'cursor-zoom-in' : 'cursor-pointer'}`}
        onClick={handleClick}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (zoomEnabled) setZoomOpen(true); else goToProduct(productIndex); } }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img src={product.image} alt={product.name} draggable={false} loading={productIndex < 4 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover object-center grayscale-[.08] transition-transform duration-500 group-hover:scale-105" />
        {productIndex > 0 && <button type="button" aria-label="Producto anterior" onClick={(event) => { event.stopPropagation(); goToProduct(productIndex - 1); }} className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#171717] opacity-0 shadow-sm transition-opacity group-hover:opacity-100"><ChevronLeft size={15} /></button>}
        {productIndex < products.length - 1 && <button type="button" aria-label="Producto siguiente" onClick={(event) => { event.stopPropagation(); goToProduct(productIndex + 1); }} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#171717] opacity-0 shadow-sm transition-opacity group-hover:opacity-100"><ChevronRight size={15} /></button>}
      </div>
      {zoomEnabled && zoomOpen && <div role="dialog" aria-modal="true" aria-label={`Foto ampliada de ${product.name}`} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#050505]/95 p-4" onClick={() => setZoomOpen(false)}>
        <button type="button" aria-label="Cerrar foto ampliada" onClick={() => setZoomOpen(false)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white hover:text-[#171717]"><X size={21} /></button>
        <img src={product.image} alt={`${product.name}, ${product.brand}`} onClick={(event) => event.stopPropagation()} className="max-h-[88vh] max-w-[94vw] object-contain" />
        <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[9px] font-bold uppercase tracking-[.14em] text-white/75">{product.name} · toca fuera para cerrar</p>
      </div>}
    </>
  );
}

function ProductRail({ onAdd }: { onAdd: (product: Product) => void }) {
  const { favorites, toggleFavorite } = useShop();
  const railRef = useRef<HTMLDivElement | null>(null);
  const inertiaFrame = useRef<number | null>(null);
  const touchState = useRef({ startX: 0, lastX: 0, lastTime: 0, velocity: 0, horizontal: false });
  const [inertiaActive, setInertiaActive] = useState(false);

  const stopInertia = () => {
    if (inertiaFrame.current !== null) {
      window.cancelAnimationFrame(inertiaFrame.current);
      inertiaFrame.current = null;
    }
    setInertiaActive(false);
  };

  const handleRailTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    stopInertia();
    const x = event.touches[0]?.clientX;
    if (x === undefined) return;
    touchState.current = { startX: x, lastX: x, lastTime: performance.now(), velocity: 0, horizontal: false };
  };

  const handleRailTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const x = event.touches[0]?.clientX;
    if (x === undefined || !railRef.current) return;
    const now = performance.now();
    const delta = x - touchState.current.lastX;
    // Use the total distance from the initial touch so slow, continuous
    // drags do not remain stuck below the per-event threshold.
    if (!touchState.current.horizontal && Math.abs(x - touchState.current.startX) > 0.5) touchState.current.horizontal = true;
    if (!touchState.current.horizontal) return;
    event.preventDefault();
    const elapsed = Math.max(8, now - touchState.current.lastTime);
    railRef.current.scrollLeft -= delta;
    touchState.current.velocity = delta / elapsed;
    touchState.current.lastX = x;
    touchState.current.lastTime = now;
  };

  const handleRailTouchEnd = () => {
    const timeSinceLastMove = performance.now() - touchState.current.lastTime;
    // If the finger has already stopped before leaving the screen, discard
    // the old velocity so the rail stops with the finger instead of jumping.
    const initialVelocity = timeSinceLastMove > 120 ? 0 : touchState.current.velocity;
    if (!touchState.current.horizontal || Math.abs(initialVelocity) < 0.005 || !railRef.current) return;
    setInertiaActive(true);
    const startedAt = performance.now();
    let previousTime = startedAt;
    const duration = 2000;
    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / duration);
      const frameTime = now - previousTime;
      const remainingSpeed = (1 - progress) ** 2;
      railRef.current?.scrollBy({ left: -initialVelocity * frameTime * remainingSpeed, behavior: 'auto' });
      previousTime = now;
      if (progress < 1) inertiaFrame.current = window.requestAnimationFrame(animate);
      else {
        inertiaFrame.current = null;
        setInertiaActive(false);
      }
    };
    inertiaFrame.current = window.requestAnimationFrame(animate);
  };

  const handleRailTouchCancel = () => {
    touchState.current.horizontal = false;
    touchState.current.velocity = 0;
    stopInertia();
  };

  return <section id="new-releases" className="px-5 pb-7 pt-1 md:px-8"><div className="mb-3 flex items-end justify-between"><div><p className="section-label mb-1 text-[#7c7772]">Recién llegados</p><h2 className="editorial-title text-[20px] font-bold uppercase tracking-[-.04em]">olympo shop</h2></div><Link href="/products" data-testid="link-rail-all-products" className="group flex items-center gap-1 pb-0.5 text-[9px] font-bold uppercase text-[#ca2f2b]">Ver todo <ArrowRight size={13} /></Link></div><div ref={railRef} className={`swipe-rail scrollbar-hide -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 ${inertiaActive ? 'inertial-active' : ''}`} onTouchStart={handleRailTouchStart} onTouchMove={handleRailTouchMove} onTouchEnd={handleRailTouchEnd} onTouchCancel={handleRailTouchCancel}>{products.map((product) => <article key={product.id} className="w-[145px] shrink-0 md:w-auto"><div className="group relative aspect-[.78] overflow-hidden bg-[#eeecea]"><ProductCardPhoto product={product} testId={`link-rail-image-${product.id}`} zoomEnabled={false} /><button onClick={() => toggleFavorite(product.id)} aria-pressed={favorites.includes(product.id)} aria-label={`${favorites.includes(product.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}: ${product.name}`} className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 ${favorites.includes(product.id) ? 'is-favorite' : ''}`}><Heart size={14} strokeWidth={1.6} /></button><button onClick={() => onAdd(product)} className="absolute bottom-2 left-2 right-2 flex h-8 items-center justify-center gap-2 bg-white/95 text-[9px] font-bold uppercase tracking-[.08em] opacity-0 transition-opacity group-hover:opacity-100">Añadir <Plus size={13} /></button></div><div className="pt-2"><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8a837d]">{product.brand}</p><h3 className="mt-1 truncate text-[11px] font-semibold"><Link href={`/products/${product.id}`} data-testid={`link-rail-name-${product.id}`} className="transition-colors hover:text-[#d93731]">{product.name}</Link></h3><p className="mt-1 text-[11px] font-medium">{product.price}</p></div></article>)}</div></section>;
}

function HomeCartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, setLocation] = useLocation();
  const { cartItems, removeFromCart } = useShop();
  const total = cartItems.reduce((sum, item) => sum + item.priceValue, 0);
  if (!open) return null;
  return <div className="fixed inset-0 z-50">
    <button data-testid="button-close-home-cart-overlay" aria-label="Cerrar carrito" onClick={onClose} className="absolute inset-0 bg-[#171717]/35 backdrop-blur-[1px]" />
    <aside role="dialog" aria-modal="true" aria-labelledby="home-cart-title" className="absolute bottom-0 right-0 top-0 flex w-full max-w-[410px] flex-col bg-[#f6f4f0] px-5 py-6 shadow-2xl md:px-7">
      <div className="flex items-center justify-between border-b border-[#d9d3cc] pb-5">
        <div><p className="section-label text-[#d93731]">Tu selección</p><h2 id="home-cart-title" className="editorial-title mt-1 text-[25px] font-bold uppercase">Carrito <span className="font-mono text-[11px] text-[#8b857e]">({cartItems.length})</span></h2></div>
        <button data-testid="button-close-home-cart" onClick={onClose} aria-label="Cerrar carrito" className="flex h-9 w-9 items-center justify-center border border-[#d9d3cc]"><X size={18} strokeWidth={1.5} /></button>
      </div>
      {cartItems.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center"><ShoppingBag size={27} strokeWidth={1.3} className="text-[#d93731]" /><p className="mt-4 text-[13px] font-bold uppercase">Tu bolsa está vacía</p><Link href="/products" onClick={onClose} className="mt-5 border border-[#171717] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em]">Ver productos</Link></div>
        : <><div className="flex-1 overflow-y-auto py-5">{cartItems.map((item, index) => <div key={`${item.id}-${index}`} className="flex gap-3 border-b border-[#ded8d1] py-4 first:pt-0"><img src={item.image} alt="" className="h-[78px] w-[62px] object-cover" /><div className="min-w-0 flex-1"><p className="text-[8px] font-bold uppercase tracking-[.12em] text-[#8b857e]">{item.brand}</p><p className="mt-1 text-[11px] font-semibold leading-[1.3]">{item.name}</p>{item.selectedSize && <p className="mt-1 text-[9px] uppercase tracking-[.08em] text-[#8b857e]">Talla {item.selectedSize}</p>}<p className="mt-2 text-[11px] font-bold">{item.price}</p></div><button data-testid={`button-remove-home-cart-${item.id}-${index}`} onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.name}`} className="self-start text-[#8b857e] hover:text-[#d93731]"><X size={16} /></button></div>)}</div><div className="border-t border-[#171717] pt-5"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.1em]">Total</span><strong className="text-[18px]">{formatMXN(total)}</strong></div><button data-testid="button-home-cart-checkout" onClick={() => { onClose(); setLocation('/checkout'); }} className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-[#25D366] text-[10px] font-bold uppercase tracking-[.1em] text-white transition-colors hover:bg-[#1da851]"><MessageCircle size={16} /> Completar datos del pedido <ArrowRight size={16} /></button></div></>}
    </aside>
  </div>;
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location, setLocation] = useLocation();
  if (!open) return null;
  const links = [['Redes sociales', 'social'], ['Colección', 'collection'], ['Nuevos lanzamientos', 'new-releases'], ['Nuevo drop Naruto', 'youngla'], ['Naruto', 'gymshark']];
  return <div className="fixed inset-0 z-50"><button aria-label="Cerrar menú" onClick={onClose} className="absolute inset-0 bg-[#171717]/30 backdrop-blur-[1px]" /><aside className="drawer-panel relative h-full w-[82%] max-w-[350px] bg-white px-6 py-6 text-[#171717] shadow-2xl"><div className="flex items-center justify-between border-b border-[#e6e2de] pb-5"><span className="altitude-wordmark text-[25px] text-[#171717]">ALTITUDE</span><button onClick={onClose} aria-label="Cerrar menú" className="text-[#171717]"><X size={22} strokeWidth={1.6} /></button></div><p className="section-label mt-9 text-[#8b857e]">Explorar</p><nav className="mt-4 flex flex-col">{links.map(([label, id]) => <button key={id} onClick={() => { onClose(); if (id === 'products') setLocation('/products'); else if (id === 'collection') setLocation('/collection'); else if (id === 'social') setLocation('/social'); else if (location !== '/') { setLocation('/'); window.setTimeout(() => scrollToSection(id), 80); } else scrollToSection(id); }} className="flex items-center justify-between border-b border-[#efebe7] py-4 text-left text-[13px] font-semibold uppercase tracking-[.03em] text-[#171717]">{label}<ChevronRight size={16} strokeWidth={1.4} className="text-[#ca2f2b]" /></button>)}</nav></aside></div>;
}

function BottomNav({ onVip, onShowroom, active = 'home' }: { onVip: () => void; onShowroom?: () => void; active?: string }) {
  const [, setLocation] = useLocation();
   const items = [{ label: 'Inicio', icon: House, action: () => setLocation('/'), id: 'home' }, { label: 'Tienda', icon: ShoppingBag, action: () => setLocation('/products'), id: 'shop' }, { label: 'Showroom', icon: MapPin, action: onShowroom ?? (() => scrollToSection('showroom')), id: 'showroom' }, { label: 'VIP', icon: Crown, action: onVip, id: 'vip' }, { label: 'WhatsApp', icon: MessageCircle, action: () => window.open(storeWhatsAppUrl, '_blank'), id: 'whatsapp' }];
  return <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex h-[67px] items-center justify-around border-t px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md" aria-label="Navegación principal móvil">{items.map(({ label, icon: Icon, action, id }) => <button key={id} data-testid={`nav-${id}`} onClick={action} className={`flex min-w-[52px] flex-col items-center gap-1 text-[8px] font-semibold uppercase tracking-[-.01em] ${active === id ? 'active-nav' : ''} ${id === 'vip' ? 'vip-nav-item' : ''}`}><Icon size={21} strokeWidth={id === 'home' ? 2 : 1.55} /><span>{label}</span></button>)}</nav>;
}

function ProductsPage() {
  const [, setLocation] = useLocation();
  const { cartItems, favorites, toast, addToCart, removeFromCart, toggleFavorite, notify } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState('Todas');
  const [brand, setBrand] = useState('Todas');
  const [sort, setSort] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [confirmedCustomer, setConfirmedCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const categories = ['Todas', 'Compresión', 'Hoodies', 'Joggers', 'Shorts', 'Poleras'];
  const searchCategories = [
    { label: 'Todos los productos', value: 'Todas' },
    { label: 'Camisetas y tops', value: 'Poleras' },
    { label: 'Shorts', value: 'Shorts' },
    { label: 'Sudaderas con capucha y sudaderas', value: 'Hoodies' },
    { label: 'Joggers y pantalones deportivos', value: 'Joggers' },
    { label: 'Pantalones', value: 'Joggers' },
    { label: 'Camisetas sin mangas', value: 'Compresión' },
    { label: 'Conjuntos deportivos', value: 'Compresión' },
    { label: 'Camisetas de manga larga', value: 'Compresión' },
    { label: 'Chándales', value: 'Joggers' },
  ];
  const brands = ['Todas', 'YoungLA', 'Gymshark', 'Breathe Divinity', 'ALTITUDE'];
  const sortOptions = [
    { value: 'newest', label: 'Novedades' },
    { value: 'best', label: 'Más vendidos' },
    { value: 'available', label: 'Disponibles' },
    { value: 'price', label: 'Precio' },
  ];
  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 320);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesCategory = category === 'Todas' || product.category === category;
      const matchesBrand = brand === 'Todas' || product.brand === brand;
      return matchesCategory && matchesBrand;
    });
    return result.sort((a, b) => {
      if (sort === 'best') return Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
      if (sort === 'available') return (a.status === 'Últimas unidades' ? 1 : 0) - (b.status === 'Últimas unidades' ? 1 : 0);
      if (sort === 'price') return a.priceValue - b.priceValue;
      return products.indexOf(a) - products.indexOf(b);
    });
  }, [brand, category, sort]);

  const clearFilters = () => {
    setCategory('Todas');
    setBrand('Todas');
    setSort('newest');
  };
  const total = cartItems.reduce((sum, item) => sum + item.priceValue, 0);
  const handleCartCheckout = () => {
    setLocation('/checkout');
  };
  const handleOrderConfirm = (customer: CustomerData) => {
    setOrderFormOpen(false);
    setCartOpen(false);
    openOrderWhatsApp(customer, cartItems, total);
    setConfirmedCustomer(customer);
  };
  const openShowroom = () => {
    setLocation('/');
    window.setTimeout(() => scrollToSection('showroom'), 80);
  };

  return (
    <div className="products-page page-shell min-h-[100dvh] pb-[78px]">
      <Header
        cartCount={cartItems.length}
        onMenu={() => setMenuOpen(true)}
        onShop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onShowroom={openShowroom}
        onBenefits={() => { setLocation('/'); window.setTimeout(() => scrollToSection('benefits'), 80); }}
        onSearch={() => { setSearchOpen((open) => !open); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onCart={() => setCartOpen(true)}
      />
      <main className="products-content">
        {searchOpen && <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Categorías de la tienda">
          <button type="button" aria-label="Cerrar categorías" onClick={() => setSearchOpen(false)} className="absolute inset-0 bg-[#171717]/30 backdrop-blur-[1px]" />
          <aside className="absolute bottom-0 right-0 top-0 w-[86%] max-w-[390px] overflow-y-auto bg-[#fbfaf8] px-5 py-6 shadow-2xl md:px-8">
            <div className="flex items-center justify-between border-b border-[#e1ddd8] pb-5">
              <div><p className="section-label text-[#ca2f2b]">Explorar</p><h2 className="editorial-title mt-1 text-[23px] font-bold uppercase">Categorías</h2></div>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Cerrar categorías" className="flex h-9 w-9 items-center justify-center border border-[#d8d3ce]"><X size={18} strokeWidth={1.5} /></button>
            </div>
            <nav className="mt-2 divide-y divide-[#e6e2de]">
              {searchCategories.map((item) => <button key={item.label} type="button" onClick={() => { setCategory(item.value); setSearchOpen(false); }} className="flex w-full items-center justify-between py-5 text-left text-[13px] font-medium text-[#252525] transition-colors hover:text-[#d93731]"><span>{item.label}</span><ChevronRight size={17} strokeWidth={1.5} /></button>)}
            </nav>
          </aside>
        </div>}
        <section className="border-b border-[#ddd8d2] bg-[#f6f4f0] px-5 py-4 md:px-10" aria-label="Herramientas del catálogo">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex gap-2">
              <button data-testid="button-toggle-filters" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className={`flex h-11 flex-1 items-center justify-center gap-2 border px-4 text-[10px] font-bold uppercase tracking-[.1em] transition-colors md:flex-none ${filtersOpen ? 'border-[#171717] bg-[#171717] text-[#f6f4f0]' : 'border-[#cfc9c2] bg-[#fbfaf8] hover:border-[#171717]'}`}><SlidersHorizontal size={15} strokeWidth={1.6} /> Filtros</button>
              <label className="flex h-11 flex-1 items-center gap-2 border border-[#cfc9c2] bg-[#fbfaf8] px-3 md:flex-none">
                <span className="sr-only">Ordenar productos</span>
                <select data-testid="select-product-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="w-full cursor-pointer bg-transparent text-[10px] font-bold uppercase tracking-[.07em] outline-none md:w-[150px]">
                  {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          </div>
          <div className="product-filter-strip -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-0 md:mx-0 md:px-0">
            {categories.map((item) => <button key={item} data-testid={`button-category-${item.toLowerCase()}`} onClick={() => setCategory(item)} className={`shrink-0 border px-3 py-2 text-[9px] font-bold uppercase tracking-[.09em] transition-colors ${category === item ? 'border-[#171717] bg-[#171717] text-white' : 'border-[#d3cdc6] bg-transparent text-[#69635d] hover:border-[#171717] hover:text-[#171717]'}`}>{item}</button>)}
          </div>
          {filtersOpen && <div className="filter-drawer mt-4 border-t border-[#ddd8d2] pt-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="mr-1 self-center text-[9px] font-bold uppercase tracking-[.12em] text-[#8b857e]">Marca</span>
                {brands.map((item) => <button key={item} data-testid={`button-brand-${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setBrand(item)} className={`border px-3 py-2 text-[9px] font-semibold transition-colors ${brand === item ? 'border-[#171717] bg-[#171717] text-white' : 'border-[#d3cdc6] text-[#69635d] hover:border-[#171717]'}`}>{item}</button>)}
              </div>
              {(category !== 'Todas' || brand !== 'Todas' || sort !== 'newest') && <button data-testid="button-clear-filters" onClick={clearFilters} className="flex items-center gap-2 self-start text-[9px] font-bold uppercase tracking-[.1em] text-[#d93731] hover:text-[#171717] md:self-center">Limpiar filtros <X size={13} /></button>}
            </div>
          </div>}
        </section>

        <section className="px-3 py-7 md:px-10 md:py-10" aria-live="polite">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="section-label text-[#8b857e]">Selección ALTITUDE</p>
              <h2 data-testid="text-results-heading" className="editorial-title mt-1 text-[22px] font-bold uppercase tracking-[-.04em]">Todos los productos</h2>
            </div>
            <span data-testid="text-results-count" className="font-mono text-[10px] text-[#8b857e]">{isLoading ? '—' : `${filteredProducts.length} resultados`}</span>
          </div>
          {catalogError ? <div className="flex min-h-[290px] flex-col items-center justify-center border border-[#d8d2cb] bg-[#fbfaf8] px-5 text-center"><p className="section-label text-[#d93731]">Catálogo no disponible</p><p className="mt-2 max-w-[300px] text-[12px] text-[#716b65]">Algo interrumpió la selección. Intenta cargarla de nuevo.</p><button data-testid="button-retry-catalog" onClick={() => { setCatalogError(false); setIsLoading(true); window.setTimeout(() => setIsLoading(false), 320); }} className="mt-5 flex items-center gap-2 border border-[#171717] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em]"><RefreshCw size={14} /> Reintentar</button></div>
             : isLoading ? <div className="grid grid-cols-2 gap-x-2 gap-y-4 md:grid-cols-4 md:gap-x-5">{Array.from({ length: 8 }, (_, index) => <div key={index} className="animate-pulse"><div className="product-skeleton aspect-[.66]" /><div className="mt-3 h-2.5 w-1/3 bg-[#e8e4de]" /><div className="mt-2 h-3.5 w-4/5 bg-[#e8e4de]" /><div className="mt-2 h-2.5 w-1/4 bg-[#e8e4de]" /></div>)}</div>
            : filteredProducts.length === 0 ? <div data-testid="empty-product-results" className="flex min-h-[290px] flex-col items-center justify-center border border-dashed border-[#cfc9c2] bg-[#fbfaf8] px-5 text-center"><span className="flex h-12 w-12 items-center justify-center border border-[#d8d2cb] text-[#d93731]"><Search size={20} strokeWidth={1.4} /></span><h3 className="mt-5 text-[14px] font-bold uppercase tracking-[-.02em]">No encontramos ese drop</h3><p className="mt-2 max-w-[290px] text-[11px] leading-[1.5] text-[#716b65]">Prueba con otra palabra o vuelve a ver toda la selección.</p><button data-testid="button-empty-clear-filters" onClick={clearFilters} className="mt-5 border border-[#171717] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] transition-colors hover:bg-[#171717] hover:text-white">Ver todos los productos</button></div>
              : <div className="grid grid-cols-2 gap-x-2 gap-y-4 md:grid-cols-4 md:gap-x-5 md:gap-y-8">{filteredProducts.map((product, index) => <article key={product.id} data-testid={`card-product-${product.id}`} role="link" tabIndex={0} onClick={(event) => { if ((event.target as HTMLElement).closest('a,button')) return; setLocation(`/products/${product.id}`); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setLocation(`/products/${product.id}`); } }} className="product-card group flex min-w-0 cursor-pointer flex-col">
               <div className="product-card-image relative aspect-[.66] overflow-hidden">
                  <Link href={`/products/${product.id}`} data-testid={`link-product-image-${product.id}`} aria-label={`Ver detalle de ${product.name}`} className="block h-full w-full"><img src={product.image} alt={product.name} loading={index < 4 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover object-center" /></Link>
                   <button data-testid={`button-cart-product-${product.id}`} onClick={() => { addToCart(product); setCartOpen(true); }} aria-label={`Añadir al carrito: ${product.name}`} className="product-cart absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f4f0]/95 transition-colors hover:bg-[#171717] hover:text-white"><ShoppingCart size={15} strokeWidth={1.6} /></button>
              </div>
                 <div className="flex flex-1 flex-col pt-2"><h3 data-testid={`text-product-name-${product.id}`} className="text-[14px] font-medium leading-[1.3] text-[#171717]"><Link href={`/products/${product.id}`} data-testid={`link-product-name-${product.id}`} className="transition-colors hover:text-[#d93731]">{product.name}</Link></h3><div className="mt-1 space-y-0.5 text-[11px] leading-[1.4] text-[#77716c]"><p>{productDetails[product.id]?.fit ?? product.category}</p><p>{productDetails[product.id]?.material ?? product.brand}</p></div><p data-testid={`text-product-price-${product.id}`} className="mt-1 text-[15px] font-bold leading-none text-[#171717]">{product.price}</p></div>
            </article>)}</div>}
        </section>
      </main>
      <BottomNav active="shop" onVip={() => setLocation('/vip')} onShowroom={openShowroom} />
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
       {cartOpen && <div className="fixed inset-0 z-50"><button data-testid="button-close-cart-overlay" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-[#171717]/35 backdrop-blur-[1px]" /><aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="absolute bottom-0 right-0 top-0 flex w-full max-w-[410px] flex-col bg-[#f6f4f0] px-5 py-6 shadow-2xl md:px-7"><div className="flex items-center justify-between border-b border-[#d9d3cc] pb-5"><div><p className="section-label text-[#d93731]">Tu selección</p><h2 id="cart-title" className="editorial-title mt-1 text-[25px] font-bold uppercase">Carrito <span className="font-mono text-[11px] text-[#8b857e]">({cartItems.length})</span></h2></div><button data-testid="button-close-cart" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" className="flex h-9 w-9 items-center justify-center border border-[#d9d3cc] hover:border-[#171717]"><X size={18} strokeWidth={1.5} /></button></div>{cartItems.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center"><ShoppingBag size={27} strokeWidth={1.3} className="text-[#d93731]" /><p className="mt-4 text-[13px] font-bold uppercase">Tu bolsa está vacía</p><p className="mt-2 max-w-[230px] text-[11px] leading-[1.5] text-[#716b65]">Guarda tu próximo drop y vuelve cuando estés listo.</p><button data-testid="button-cart-continue-shopping" onClick={() => setCartOpen(false)} className="mt-5 border border-[#171717] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em]">Ver productos</button></div> : <><div className="flex-1 overflow-y-auto py-5">{cartItems.map((item, index) => <div key={`${item.id}-${index}`} className="flex gap-3 border-b border-[#ded8d1] py-4 first:pt-0"><img src={item.image} alt="" className="h-[78px] w-[62px] object-cover" /><div className="min-w-0 flex-1"><p className="text-[8px] font-bold uppercase tracking-[.12em] text-[#8b857e]">{item.brand}</p><p className="mt-1 text-[11px] font-semibold leading-[1.3]">{item.name}</p>{item.selectedSize && <p className="mt-1 text-[9px] uppercase tracking-[.08em] text-[#8b857e]">Talla {item.selectedSize}</p>}<p className="mt-2 text-[11px] font-bold">{item.price}</p></div><button data-testid={`button-remove-cart-${item.id}-${index}`} onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.name}`} className="self-start text-[#8b857e] hover:text-[#d93731]"><X size={16} /></button></div>)}</div>{orderFormOpen ? <div className="flex-1 overflow-y-auto"><OrderForm cartItems={cartItems} total={total} onConfirm={handleOrderConfirm} /></div> : <div className="border-t border-[#171717] pt-5"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.1em]">Total</span><strong data-testid="text-cart-total" className="text-[18px]">{`Bs. ${total}`}</strong></div><button data-testid="button-cart-checkout" onClick={handleCartCheckout} className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-[#25D366] text-[10px] font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-[#1da851]"><MessageCircle size={16} /> Completar datos del pedido <ArrowRight size={16} /></button><p className="mt-3 text-center text-[9px] text-[#8b857e]">Compra simple · Atención personalizada</p></div>}</>}</aside></div>}
       {confirmedCustomer && <OrderConfirmed customer={confirmedCustomer} cartItems={cartItems} total={total} onClose={() => setConfirmedCustomer(null)} />}
      {toast && <div data-testid="status-products-toast" role="status" className="fixed bottom-[82px] left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap bg-[#171717] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-white shadow-md">{toast}</div>}
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartItems, toast, addToCart, notify } = useShop();
  const [, setLocation] = useLocation();
  const openVip = () => setLocation('/vip');
    return <div id="top" className="page-shell min-h-[100dvh] bg-[#f2efe9] pb-[80px]"><Header cartCount={cartItems.length} onMenu={() => setMenuOpen(true)} onCart={() => setCartOpen(true)} /><main className="home-main"><CampaignHero onShop={(item) => { if (item.id === 'breathe-divinity-featured') { setLocation('/products'); return; } scrollToSection('new-releases'); notify(`${item.label}: colección seleccionada`); }} /><ProductRail onAdd={(product) => { addToCart(product); setCartOpen(true); }} /><section id="showroom" className="mx-5 mb-5 border-t border-[#e1ddda] py-5 md:mx-8"><div className="mb-4 flex items-start justify-between gap-4"><div><p className="section-label mb-1 text-[#7c7772]">Visítanos</p><h2 className="editorial-title text-[20px] font-bold uppercase">MÉXICO - PUEBLO MORELOS</h2><p className="mt-1 text-[11px] text-[#6b6660]">ciudad de mexico </p></div><a href="https://www.google.com/maps/search/?api=1&query=Pueblo+Morelos%2C+Coahuila%2C+Mexico" target="_blank" rel="noreferrer" aria-label="Abrir Pueblo Morelos en Google Maps" className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#d8d3ce] hover:border-[#ca2f2b] hover:text-[#ca2f2b]"><MapPin size={19} strokeWidth={1.5} /></a></div><div className="overflow-hidden border border-[#d8d3ce] bg-[#e7e3dd]"><iframe title="Mapa del showroom en Pueblo Morelos, Coahuila, México" src="https://www.google.com/maps?q=Pueblo+Morelos,+Coahuila,+Mexico&output=embed" className="h-[250px] w-full border-0 md:h-[320px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div><a href={storeWhatsAppUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between bg-[#25D366] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-white transition-colors hover:bg-[#171717]"><span className="flex items-center gap-2"><MessageCircle size={16} /> WhatsApp · +52 222 378 6688</span><ArrowRight size={15} /></a><a href="https://www.google.com/maps/search/?api=1&query=Pueblo+Morelos%2C+Coahuila%2C+Mexico" target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-between border border-[#171717] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] transition-colors hover:bg-[#171717] hover:text-white">Abrir Pueblo Morelos en Google Maps <ArrowRight size={15} /></a></section></main><footer className="border-t border-[#e1ddda] px-5 py-7 text-center md:px-8"><div className="altitude-wordmark text-[27px]">olympo.shop</div><p className="mt-2 text-[9px] uppercase tracking-[.18em] text-[#8b857f]">Entrena más alto. Muévete distinto.</p><div className="mt-5 flex justify-center gap-5 text-[10px] text-[#766f69]"><button onClick={() => notify('Escríbenos por WhatsApp para ayudarte.')}>Ayuda</button><button onClick={() => notify('Envíos a toda Bolivia.')}>Envíos</button><button onClick={openVip}>ALTITUDE VIP</button></div></footer><BottomNav active="home" onVip={openVip} /><Drawer open={menuOpen} onClose={() => setMenuOpen(false)} /><HomeCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />{toast && <div className="fixed bottom-[82px] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap bg-[#191919] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-white shadow-md">{toast}</div>}</div>;
}

function CollectionPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartItems, toast, notify } = useShop();
  const [, setLocation] = useLocation();
  const collectionCampaigns: Campaign[] = [
     { id: 'youngla-new-drop', label: 'YoungLA', title: 'New Drop', image: '/youngla-cover.webp', position: 'center center', tone: 'light' },
     { id: 'gymshark-new-arrivals', label: 'Gymshark', title: 'New Arrivals', image: '/gymshark-cover.webp', position: 'center center', tone: 'light' },
      { id: 'breathe-divinity-featured', label: 'Breathe Divinity', title: 'Breathe Divinity', image: '/breathe-divinity-cover.webp', position: 'center center', tone: 'dark' },
  ];
  return (
    <div className="page-shell min-h-[100dvh] bg-[#f2efe9] pb-[80px]">
      <Header cartCount={cartItems.length} onMenu={() => setMenuOpen(true)} onShop={() => setLocation('/products')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} onBenefits={() => setLocation('/')} />
      <main className="collection-page">
        <div className="px-5 pb-3 pt-4 md:px-10 md:pb-4 md:pt-6">
          <p className="section-label text-[#ca2f2b]">ALTITUDE / selección</p>
          <h1 className="editorial-title mt-2 text-[clamp(2.4rem,7vw,5rem)] font-bold uppercase leading-[.88] tracking-[-.065em]">Colección</h1>
          <p className="mt-1 max-w-[420px] text-[11px] leading-[1.5] text-[#6b6660]">Descubre los drops que están marcando el ritmo.</p>
        </div>
        <div className="campaign-stack-list">
          {collectionCampaigns.map((campaign) => (
             <article key={campaign.id} className={`campaign-tile relative isolate min-h-[292px] overflow-hidden md:min-h-[390px] ${campaign.id === 'breathe-divinity-featured' ? 'bg-black text-white' : 'bg-[#dedbd7]'}`}>
             <img className="absolute inset-0 h-full w-full object-cover" src={campaign.image} alt={`${campaign.label} ${campaign.title}`} style={{ objectPosition: campaign.position }} loading="lazy" decoding="async" />
               <div className={`absolute inset-0 ${campaign.id === 'youngla-new-drop' || campaign.id === 'breathe-divinity-featured' ? 'bg-transparent' : 'bg-gradient-to-r from-white/90 via-white/35 to-transparent'}`} />
              <div className="relative z-10 flex min-h-[292px] flex-col items-start justify-center px-6 py-7 md:min-h-[390px] md:px-12">
                <div className="-translate-y-16 md:-translate-y-20">
                    <p className={`mb-2 text-[10px] font-bold uppercase tracking-[.22em] ${campaign.id === 'youngla-new-drop' || campaign.id === 'breathe-divinity-featured' ? 'text-white' : 'text-[#5f5a55]'}`}>{campaign.label}</p>
                    <h2 className={`campaign-tile-title max-w-[210px] text-[clamp(1.9rem,8vw,3.5rem)] ${campaign.id === 'youngla-new-drop' || campaign.id === 'gymshark-new-arrivals' ? 'font-extrabold' : 'font-black'} uppercase leading-[.88] tracking-[-.065em] ${campaign.id === 'youngla-new-drop' ? 'text-white' : campaign.id === 'breathe-divinity-featured' ? 'text-[#171717]' : ''}`}>{campaign.title}</h2>
                </div>
                  <button data-testid={`button-collection-${campaign.id}`} onClick={() => { setLocation('/products'); notify(`${campaign.label}: colección seleccionada`); }} className={`hero-cta group mt-5 flex h-[44px] min-w-[158px] items-center justify-between gap-5 border px-4 text-[9px] font-bold uppercase tracking-[.1em] ${campaign.id === 'youngla-new-drop' ? 'border-white text-white -translate-x-2 translate-y-4' : campaign.id === 'breathe-divinity-featured' ? 'border-[#171717] text-[#171717] -translate-x-2 translate-y-4' : 'border-[#171717] text-[#171717]'} shadow-sm transition-colors hover:bg-[#d93731] hover:text-white ${campaign.id === 'gymshark-new-arrivals' ? 'translate-y-10' : ''}`}>Ver colección <ArrowRight size={17} strokeWidth={1.7} className="transition-transform group-hover:translate-x-1" /></button>
              </div>
              <div className="absolute bottom-4 left-6 z-10 flex items-center gap-1.5 md:left-12"><span className="h-1.5 w-1.5 rounded-full bg-[#171717]" /><span className="h-1.5 w-1.5 rounded-full border border-[#171717]" /><span className="h-1.5 w-1.5 rounded-full border border-[#171717]" /></div>
            </article>
          ))}
        </div>
      </main>
       <BottomNav active="collection" onVip={() => setLocation('/vip')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} />
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      {toast && <div className="fixed bottom-[82px] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap bg-[#191919] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-white shadow-md">{toast}</div>}
    </div>
  );
}

function ProductDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { cartItems, favorites, toast, addToCart, removeFromCart, toggleFavorite, notify } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [confirmedCustomer, setConfirmedCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);
  const photoTouchStartX = useRef<number | null>(null);
  const photoDidSwipe = useRef(false);
  const product = products.find((item) => item.id === params.id);
  const detail = product ? getProductDetails(product) : undefined;
  const productIndex = product ? products.findIndex((item) => item.id === product.id) : -1;
  const total = cartItems.reduce((sum, item) => sum + item.priceValue, 0);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 220);
    return () => window.clearTimeout(timer);
  }, [params.id]);

  useEffect(() => {
    setSelectedSize(detail?.sizes?.[0] ?? '');
    setZoomOpen(false);
  }, [detail?.sizes, params.id]);

  useEffect(() => {
    if (!zoomOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomOpen]);

  const handleAdd = () => {
    if (!product || !detail) return;
    addToCart(product, selectedSize);
    setCartOpen(true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 3200);
  };
  const handleBuy = () => {
    if (!product || !detail) return;
    addToCart(product, selectedSize);
    setLocation('/checkout');
  };
  const handleDetailCartCheckout = () => {
    setLocation('/checkout');
  };
  const handleDetailOrderConfirm = (customer: CustomerData) => {
    setOrderFormOpen(false);
    setCartOpen(false);
    openOrderWhatsApp(customer, cartItems, total);
    setConfirmedCustomer(customer);
  };
  const goToProduct = (index: number) => {
    const nextProduct = products[index];
    if (!nextProduct) return;
    setZoomOpen(false);
    setLocation(`/products/${nextProduct.id}`);
  };
  const handlePhotoTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    photoTouchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const handlePhotoTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (photoTouchStartX.current === null || productIndex < 0) return;
    const endX = event.changedTouches[0]?.clientX;
    const delta = endX === undefined ? 0 : endX - photoTouchStartX.current;
    photoTouchStartX.current = null;
    if (Math.abs(delta) < 36) return;
    photoDidSwipe.current = true;
    window.setTimeout(() => { photoDidSwipe.current = false; }, 300);
    goToProduct(productIndex + (delta < 0 ? 1 : -1));
  };
  const handlePhotoClick = (event: MouseEvent<HTMLDivElement>) => {
    if (photoDidSwipe.current || (event.target as HTMLElement).closest('button')) return;
    setZoomOpen(true);
  };

  return (
    <div className="detail-page page-shell min-h-[100dvh] bg-[#f6f4f0] pb-[78px] text-[#171717]">
      <Header cartCount={cartItems.length} onMenu={() => setMenuOpen(true)} onShop={() => setLocation('/products')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} onCart={() => setCartOpen(true)} />
      <main aria-live="polite">
        {isLoading ? <div className="detail-loading grid gap-5 px-5 py-7 md:grid-cols-2 md:px-10 md:py-12"><div className="product-skeleton aspect-[.86]" /><div className="space-y-5 pt-3"><div className="h-3 w-1/4 bg-[#e8e4de]" /><div className="h-14 w-4/5 bg-[#e8e4de]" /><div className="h-8 w-1/3 bg-[#e8e4de]" /><div className="h-24 w-full bg-[#e8e4de]" /></div></div>
          : !product || !detail ? <section className="flex min-h-[590px] flex-col items-center justify-center px-5 text-center"><p className="section-label text-[#d93731]">404 / selección no encontrada</p><h1 data-testid="text-product-not-found" className="editorial-title mt-4 text-[clamp(2.8rem,9vw,6rem)] font-bold uppercase leading-[.84]">Este drop<br /><span className="text-[#d93731]">ya voló.</span></h1><p className="mt-5 max-w-[310px] text-[12px] leading-[1.5] text-[#716b65]">No encontramos ese producto en el catálogo actual. Explora la selección completa para encontrar tu próximo ritmo.</p><Link href="/products" data-testid="link-not-found-products" className="mt-7 flex h-12 items-center gap-3 bg-[#171717] px-5 text-[10px] font-bold uppercase tracking-[.12em] text-[#f6f4f0] transition-colors hover:bg-[#d93731]"><ArrowLeft size={16} /> Volver a la tienda</Link></section>
          : <section className="detail-content px-5 py-6 md:px-10 md:py-10">
             <div className="mb-0 flex items-center justify-between gap-4 text-[9px] font-semibold uppercase tracking-[.14em] text-[#8b857e] md:mb-0">
              <Link href="/products" data-testid="link-detail-back" className="inline-flex items-center gap-2 transition-colors hover:text-[#d93731]"><ArrowLeft size={14} /> Volver a la tienda</Link>
              <span>{product.category} / {product.brand}</span>
            </div>
            <div className="grid gap-0 md:grid-cols-[minmax(0,1.08fr)_minmax(330px,.92fr)] md:items-start md:gap-14">
               <div className="detail-photo-wrap relative overflow-hidden bg-[#e7e3dd] cursor-zoom-in" role="button" tabIndex={0} aria-label={`Ampliar foto de ${product.name}`} onClick={handlePhotoClick} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setZoomOpen(true); } }} onTouchStart={handlePhotoTouchStart} onTouchEnd={handlePhotoTouchEnd}>
                <img data-testid={`img-product-detail-${product.id}`} src={product.image} alt={`${product.name}, ${product.brand}`} draggable={false} loading="eager" decoding="async" fetchPriority="high" className="detail-photo h-full w-full object-cover" />
                <div className="absolute left-3 top-3 flex gap-2"><span className="bg-[#f6f4f0] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[.1em]">{product.status}</span>{product.isBestSeller && <span className="bg-[#d93731] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[.1em] text-white">Favorito</span>}</div>
                <button data-testid="button-detail-favorite" onClick={() => toggleFavorite(product.id)} aria-pressed={favorites.includes(product.id)} aria-label={`${favorites.includes(product.id) ? 'Quitar' : 'Añadir'} ${product.name} de favoritos`} className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f4f0]/95 transition-colors hover:bg-white ${favorites.includes(product.id) ? 'is-favorite' : ''}`}><Heart size={18} strokeWidth={1.5} /></button>
                {productIndex > 0 && <button type="button" aria-label="Producto anterior" onClick={(event) => { event.stopPropagation(); goToProduct(productIndex - 1); }} className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#f6f4f0]/90 text-[#171717] shadow-sm transition-colors hover:bg-white"><ChevronLeft size={20} /></button>}
                {productIndex < products.length - 1 && <button type="button" aria-label="Producto siguiente" onClick={(event) => { event.stopPropagation(); goToProduct(productIndex + 1); }} className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#f6f4f0]/90 text-[#171717] shadow-sm transition-colors hover:bg-white"><ChevronRight size={20} /></button>}
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#171717]/75 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.12em] text-white">Toca para ampliar · desliza para cambiar</span>
              </div>
               <div className="detail-info min-w-0 md:sticky md:top-5">
                <h1 data-testid="text-detail-name" className="editorial-title mt-3 max-w-[560px] text-[clamp(2.3rem,6vw,5rem)] font-bold uppercase leading-[.86] tracking-[-.065em]">{product.name}</h1>
                 <p data-testid="text-detail-brand" className="section-label mt-3 text-[#d93731]">{product.category === 'Compresión' && product.brand === 'Breathe Divinity' ? 'YoungLA' : product.brand}</p>
                 <div className="mt-6 flex items-end justify-between border-b border-[#d9d3cc] pb-5"><p data-testid="text-detail-price" className="text-[22px] font-bold tracking-[-.04em]">{product.price}</p><p data-testid="status-detail-availability" className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.1em] text-[#4e6a50]"><span className="h-2 w-2 rounded-full bg-[#4e6a50]" /> {product.status === 'Últimas unidades' ? 'Quedan pocas' : 'Disponible'}</p></div>
                 <div className="mt-5" aria-label="Seleccionar talla">
                   <div className="flex items-center justify-between gap-3">
                     <p className="text-[10px] font-bold uppercase tracking-[.12em]">Escoge tu talla</p>
                     <button type="button" onClick={() => document.getElementById('size-chart')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="text-[9px] font-semibold uppercase tracking-[.08em] text-[#8b857e] underline underline-offset-4">Guía de tallas</button>
                   </div>
                   <div className="mt-3 grid grid-cols-5 gap-2">
                     {(detail.sizes ?? []).map((size) => (
                       <button
                         key={size}
                         type="button"
                         data-testid={`button-size-${size}`}
                         aria-label={`Seleccionar talla ${size}`}
                         aria-pressed={selectedSize === size}
                         onClick={() => setSelectedSize(size)}
                         className={`flex h-11 items-center justify-center border text-[11px] font-bold transition-colors ${selectedSize === size ? 'border-[#d93731] bg-[#d93731] text-white' : 'border-[#d9d3cc] bg-white text-[#171717] hover:border-[#171717]'}`}
                       >
                         {size}
                       </button>
                     ))}
                   </div>
                 </div>
                <button data-testid="button-detail-add-cart" onClick={handleAdd} className="mt-6 flex h-14 w-full items-center justify-between bg-[#d93731] px-5 text-[10px] font-bold uppercase tracking-[.13em] text-white transition-colors hover:bg-[#171717]"><span>{added ? 'Añadido a tu carrito' : 'Añadir al carrito'}</span>{added ? <Check size={19} /> : <Plus size={19} />}</button>
                 <button data-testid="button-detail-buy-whatsapp" onClick={handleBuy} className="mt-2 flex h-14 w-full items-center justify-between bg-[#25D366] px-5 text-[10px] font-bold uppercase tracking-[.13em] text-white transition-colors hover:bg-[#1da851]"><span className="flex items-center gap-2"><MessageCircle size={17} strokeWidth={1.8} /> Comprar por WhatsApp</span><ArrowRight size={18} /></button>
                 <div className="mt-8 border-t border-[#d9d3cc] pt-7">
                   <div className="space-y-5 text-[12px] leading-[1.65] text-[#5f5a55]">
                     <p><strong data-testid="text-detail-material" className="font-bold uppercase tracking-[.08em] text-[#171717]">MATERIAL:</strong> 72% Polyamide, 21% Polyester, 7% Elastane.</p>
                     <p><strong data-testid="text-detail-weight" className="font-bold uppercase tracking-[.08em] text-[#171717]">FABRIC WEIGHT:</strong> 300 GSM.</p>
                     <p><strong data-testid="text-detail-fit" className="font-bold uppercase tracking-[.08em] text-[#171717]">FIT:</strong> Fitted.</p>
                     <p><strong className="font-bold uppercase tracking-[.08em] text-[#171717]">DESIGN:</strong> This compression tee hugs close with a structured, armored-style pattern. It’s lightweight, supportive, and moves with you. Whether you’re hitting chest day or just trying to look mysterious at the gym. The crisp Batman emblem seals the deal being sleek and tough.</p>
                     <p><strong className="font-bold uppercase tracking-[.08em] text-[#171717]">MODEL:</strong> Andoni in the first photo is wearing a size XL. Weight: 215lb Height: 6'1.</p>
                     <p className="border-l-2 border-[#d93731] pl-4 text-[10px] leading-[1.6] text-[#716b65]">THE DARK KNIGHT TRILOGY and all related characters and elements © &amp; ™ DC and Warner Bros. Entertainment Inc. WB SHIELD: © &amp; ™ WBEI. (s26)</p>
                   </div>
                    <div id="size-chart" className="mt-8 scroll-mt-24">
                     <h2 className="editorial-title text-[19px] font-bold uppercase">4259 Size Chart <span className="font-sans text-[10px] font-medium normal-case tracking-normal text-[#8b857e]">(inches)</span></h2>
                     <div className="mt-4 overflow-x-auto border border-[#d9d3cc]">
                       <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
                         <caption className="sr-only">4259 Size Chart in inches</caption>
                         <thead className="bg-[#171717] text-white"><tr><th scope="col" className="px-3 py-3 font-bold uppercase tracking-[.1em]">Size</th><th scope="col" className="px-3 py-3 font-bold">S</th><th scope="col" className="px-3 py-3 font-bold">M</th><th scope="col" className="px-3 py-3 font-bold">L</th><th scope="col" className="px-3 py-3 font-bold">XL</th><th scope="col" className="px-3 py-3 font-bold">XXL</th></tr></thead>
                         <tbody className="divide-y divide-[#d9d3cc]"><tr><th scope="row" className="bg-[#f1ede8] px-3 py-3 font-bold uppercase tracking-[.08em]">Length</th><td className="px-3 py-3">24.5</td><td className="px-3 py-3">25</td><td className="px-3 py-3">25.5</td><td className="px-3 py-3">25.9</td><td className="px-3 py-3">26.4</td></tr><tr><th scope="row" className="bg-[#f1ede8] px-3 py-3 font-bold uppercase tracking-[.08em]">Chest</th><td className="px-3 py-3">14.2</td><td className="px-3 py-3">15.4</td><td className="px-3 py-3">16.3</td><td className="px-3 py-3">17.3</td><td className="px-3 py-3">18.3</td></tr></tbody>
                       </table>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </section>}
       </main>
       {zoomOpen && product && <div role="dialog" aria-modal="true" aria-label={`Foto ampliada de ${product.name}`} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#050505]/95 p-4" onClick={() => setZoomOpen(false)}>
         <button type="button" aria-label="Cerrar foto ampliada" onClick={() => setZoomOpen(false)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white hover:text-[#171717]"><X size={21} /></button>
         <img src={product.image} alt={`${product.name}, ${product.brand}`} onClick={(event) => event.stopPropagation()} className="max-h-[88vh] max-w-[94vw] object-contain" />
         <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[9px] font-bold uppercase tracking-[.14em] text-white/75">{product.name} · toca fuera para cerrar</p>
       </div>}
      <BottomNav active="shop" onVip={() => setLocation('/vip')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} />
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      {cartOpen && <div className="fixed inset-0 z-50"><button data-testid="button-close-detail-cart-overlay" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-[#171717]/35 backdrop-blur-[1px]" /><aside role="dialog" aria-modal="true" aria-labelledby="detail-cart-title" className="absolute bottom-0 right-0 top-0 flex w-full max-w-[410px] flex-col bg-[#f6f4f0] px-5 py-6 shadow-2xl md:px-7"><div className="flex items-center justify-between border-b border-[#d9d3cc] pb-5"><div><p className="section-label text-[#d93731]">Tu selección</p><h2 id="detail-cart-title" className="editorial-title mt-1 text-[25px] font-bold uppercase">Carrito <span className="font-mono text-[11px] text-[#8b857e]">({cartItems.length})</span></h2></div><button data-testid="button-close-detail-cart" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" className="flex h-9 w-9 items-center justify-center border border-[#d9d3cc]"><X size={18} strokeWidth={1.5} /></button></div>{cartItems.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center"><ShoppingBag size={27} strokeWidth={1.3} className="text-[#d93731]" /><p className="mt-4 text-[13px] font-bold uppercase">Tu bolsa está vacía</p><Link href="/products" data-testid="link-detail-empty-cart-products" onClick={() => setCartOpen(false)} className="mt-5 border border-[#171717] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em]">Ver productos</Link></div> : <><div className="flex-1 overflow-y-auto py-5">{cartItems.map((item, index) => <div key={`${item.id}-${index}`} className="flex gap-3 border-b border-[#ded8d1] py-4 first:pt-0"><img src={item.image} alt="" className="h-[78px] w-[62px] object-cover" /><div className="min-w-0 flex-1"><p className="text-[8px] font-bold uppercase tracking-[.12em] text-[#8b857e]">{item.brand}</p><p className="mt-1 text-[11px] font-semibold leading-[1.3]">{item.name}</p>{item.selectedSize && <p className="mt-1 text-[9px] uppercase tracking-[.08em] text-[#8b857e]">Talla {item.selectedSize}</p>}<p className="mt-2 text-[11px] font-bold">{item.price}</p></div><button data-testid={`button-remove-detail-cart-${item.id}-${index}`} onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.name}`} className="self-start text-[#8b857e] hover:text-[#d93731]"><X size={16} /></button></div>)}</div>{orderFormOpen ? <div className="flex-1 overflow-y-auto"><OrderForm cartItems={cartItems} total={total} onConfirm={handleDetailOrderConfirm} /></div> : <div className="border-t border-[#171717] pt-5"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.1em]">Total</span><strong data-testid="text-detail-cart-total" className="text-[18px]">{`Bs. ${total}`}</strong></div><button data-testid="button-detail-cart-checkout" onClick={handleDetailCartCheckout} className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-[#25D366] text-[10px] font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-[#1da851]"><MessageCircle size={16} /> Completar datos del pedido <ArrowRight size={16} /></button><Link href="/products" data-testid="link-detail-continue-shopping" onClick={() => setCartOpen(false)} className="mt-4 block text-center text-[9px] font-bold uppercase tracking-[.08em] text-[#8b857e] underline underline-offset-4">Seguir comprando</Link></div>}</>}</aside></div>}
      {confirmedCustomer && <OrderConfirmed customer={confirmedCustomer} cartItems={cartItems} total={total} onClose={() => setConfirmedCustomer(null)} />}
      {toast && <div data-testid="status-detail-toast" role="status" className="fixed bottom-[82px] left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap bg-[#171717] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-white shadow-md">{toast}</div>}
    </div>
  );
}

function SocialPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { cartItems } = useShop();
  const [preRegistration, setPreRegistration] = useState({ fullName: '', phone: '', city: '', message: '' });
  const [preRegistrationSent, setPreRegistrationSent] = useState(false);
  const socialLinks = [
    { name: 'Instagram', handle: '@olym.shop', href: 'https://www.instagram.com/olym.shop?igsi=dGJ0czViaHEyMzE0', color: '#E1306C', icon: FaInstagram },
    { name: 'Facebook', handle: 'Enlace pendiente', color: '#1877F2', icon: FaFacebookF },
    { name: 'WhatsApp', handle: '+52 222 378 6688', href: storeWhatsAppUrl, color: '#25D366', icon: FaWhatsapp },
    { name: 'TikTok', handle: '@olymposhop8', href: 'https://www.tiktok.com/@olymposhop8?_r=1&_t=ZS-99C3jER7LYD', color: '#FF0050', icon: FaTiktok },
  ];
  const handlePreRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = [
      '🌐 Vengo de la tienda virtual.',
      'Quiero 🛑 pre-inscribirme para ser de los primeros en recibir los primeros lanzamientos.',
      `Nombre completo: ${preRegistration.fullName.trim()}`,
      `Número de teléfono: ${preRegistration.phone.trim()}`,
      `Ciudad de México: ${preRegistration.city.trim()}`,
      preRegistration.message.trim() ? `Mensaje adicional: ${preRegistration.message.trim()}` : '',
    ].filter(Boolean).join('\n');
    window.open(`${storeWhatsAppUrl}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setPreRegistrationSent(true);
  };

  return (
    <div className="social-page page-shell min-h-[100dvh] bg-[#101010] pb-[76px] text-white">
      <Header cartCount={cartItems.length} onMenu={() => setMenuOpen(true)} onShop={() => setLocation('/products')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} />
      <main className="px-5 py-12 md:px-12 md:py-20">
        <section className="mx-auto max-w-[820px]" aria-labelledby="social-title">
          <p className="section-label text-[#df3933]">Conecta con Olympo</p>
          <h1 id="social-title" data-testid="text-social-title" className="mt-3 max-w-[720px] font-black uppercase leading-[.86] tracking-[-.07em] text-[clamp(2.7rem,9vw,6.6rem)]">Visita nuestras redes sociales</h1>
          <p className="mt-6 max-w-[440px] text-[12px] leading-[1.6] text-white/65 md:text-[14px]">Sigue cada lanzamiento, novedad y movimiento de Olympo online.</p>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {socialLinks.map(({ name, handle, href, color, icon: Icon }) => {
              const iconColor = name === 'TikTok' ? '#fff' : color;
              const card = <><div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-black transition-transform duration-300 group-hover:scale-110" style={{ color: iconColor, boxShadow: `0 0 26px ${color}66, inset 0 0 18px ${color}22` }}><Icon size={29} /></div><strong className="mt-6 text-[11px] uppercase tracking-[.08em]">{name}</strong><span className="mt-2 text-center text-[9px] text-white/55">{handle}</span></>;
              return href
                ? <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={`Visitar ${name}`} className="group flex min-h-[190px] flex-col items-center justify-center border border-white/15 bg-white/[.04] p-4 text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/[.08]">{card}</a>
                : <div key={name} aria-disabled="true" className="group flex min-h-[190px] cursor-not-allowed flex-col items-center justify-center border border-white/10 bg-white/[.02] p-4 text-white/70">{card}</div>;
            })}
          </div>
          <section className="mt-16 border-t border-white/15 pt-10" aria-labelledby="pre-registration-title">
            <p className="section-label text-[#df3933]">Acceso anticipado</p>
            <h2 id="pre-registration-title" data-testid="text-pre-registration-title" className="mt-3 max-w-[660px] font-black uppercase leading-[.9] tracking-[-.06em] text-[clamp(2rem,7vw,4.5rem)]">Pre-inscríbete para ser de los primeros</h2>
            <p className="mt-5 max-w-[480px] text-[12px] leading-[1.6] text-white/65 md:text-[14px]">Déjanos tus datos y recibe primero las novedades y los próximos lanzamientos.</p>
            <form onSubmit={handlePreRegistration} className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.12em] text-white/65"><UserRound size={14} /> Nombre completo</span>
                <input required value={preRegistration.fullName} onChange={(event) => setPreRegistration((current) => ({ ...current, fullName: event.target.value }))} className="h-12 w-full border border-white/15 bg-white/[.05] px-4 text-[12px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#df3933]" placeholder="Tu nombre completo" />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.12em] text-white/65"><Phone size={14} /> Número de teléfono</span>
                <input required type="tel" value={preRegistration.phone} onChange={(event) => setPreRegistration((current) => ({ ...current, phone: event.target.value }))} className="h-12 w-full border border-white/15 bg-white/[.05] px-4 text-[12px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#df3933]" placeholder="+52 222 378 6688" />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.12em] text-white/65"><MapPin size={14} /> Ciudad de México</span>
                <input required value={preRegistration.city} onChange={(event) => setPreRegistration((current) => ({ ...current, city: event.target.value }))} className="h-12 w-full border border-white/15 bg-white/[.05] px-4 text-[12px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#df3933]" placeholder="Tu ciudad o alcaldía" />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.12em] text-white/65"><MessageCircle size={14} /> Mensaje adicional</span>
                <textarea value={preRegistration.message} onChange={(event) => setPreRegistration((current) => ({ ...current, message: event.target.value }))} rows={1} className="min-h-12 w-full resize-y border border-white/15 bg-white/[.05] px-4 py-3 text-[12px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#df3933]" placeholder="Cuéntanos algo más (opcional)" />
              </label>
              <div className="md:col-span-2">
                <button type="submit" data-testid="button-pre-registration-submit" className="group flex h-13 w-full items-center justify-between bg-[#df3933] px-5 text-[10px] font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-[#f04a43]">
                  <span className="flex items-center gap-2"><MessageCircle size={17} /> Enviar pre-inscripción</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                {preRegistrationSent && <p role="status" className="mt-3 text-[10px] text-[#25D366]">Tu mensaje está listo para enviarse por WhatsApp.</p>}
              </div>
            </form>
          </section>
        </section>
      </main>
      <BottomNav active="home" onVip={() => setLocation('/vip')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} />
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

function VipPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { cartItems } = useShop();
  const enterVip = () => window.open(storeWhatsAppUrl, '_blank', 'noopener,noreferrer');
  const benefits = [
    { label: 'Early access', detail: 'Accede antes del lanzamiento público.', icon: Zap },
    { label: 'Nuevos drops', detail: 'Entérate primero de cada lanzamiento.', icon: Flame },
    { label: 'Preventas', detail: 'Reserva antes de que se agote el stock.', icon: Tag },
    { label: 'Stock limitado', detail: 'Mayor posibilidad de conseguir tu talla.', icon: Box },
  ];
  return (
    <div className="vip-page page-shell min-h-[100dvh] bg-[#0b0b0b] pb-[76px] text-[#f5f3ef]">
      <Header cartCount={cartItems.length} onMenu={() => setMenuOpen(true)} onShop={() => setLocation('/products')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} />
      <main>
        <section className="vip-hero relative isolate overflow-hidden" aria-labelledby="vip-hero-title">
          <div className="vip-photo absolute inset-y-0 right-0 z-0" aria-hidden="true">
            <img src="/vip-athlete.webp" alt="" loading="eager" decoding="async" />
          </div>
          <div className="relative z-10 flex min-h-[443px] flex-col justify-between px-5 pb-7 pt-8 md:min-h-[525px] md:px-12 md:pb-10 md:pt-12">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#d73832]">
                <span className="vip-live-dot h-1.5 w-1.5 rounded-full bg-[#e33a34]" />
                Acceso privado
              </div>
            </div>
            <div className="max-w-[700px]">
               <p className="vip-kicker mb-3 text-[clamp(1.65rem,7vw,3rem)] font-black uppercase leading-none tracking-[-.055em] text-white">OLYMPO  VIP</p>
              <h1 id="vip-hero-title" data-testid="text-vip-hero-title" className="vip-display text-[clamp(.75rem,2vw,1rem)] font-bold uppercase leading-none tracking-[.4em] text-[#e13832]">
                 Early access
              </h1>
              <p className="mt-7 max-w-[370px] text-[12px] leading-[1.55] text-white/80 md:text-[14px]">
                 Accede antes que nadie a nuevos drops, unidades limitadas y lanzamientos exclusivos.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
               <button data-testid="button-vip-enter-hero" onClick={enterVip} className="vip-button group flex h-[52px] w-full max-w-[285px] items-center justify-between bg-white px-4 text-[10px] font-bold uppercase tracking-[.13em] text-[#111] transition-colors hover:bg-[#df3933] hover:text-white">
                 Entrar al VIP
                <ArrowRight size={18} strokeWidth={1.7} className="transition-transform group-hover:translate-x-1" />
              </button>
              <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.08em] text-white/75"><LockKeyhole size={12} strokeWidth={1.5} /> Acceso privado</span>
            </div>
          </div>
        </section>

        <section id="benefits" className="vip-benefits border-y border-[#e7e7e7] bg-white px-5 py-6 text-[#111] md:px-12 md:py-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
               <p className="section-label text-[#d73832]">Qué desbloqueas</p>
                <h2 data-testid="text-vip-benefits-title" className="vip-heading mt-1 text-[25px] font-bold uppercase leading-none tracking-[-.055em] text-[#111]">Beneficios VIP</h2>
            </div>
             <span className="font-mono text-[9px] text-[#999]">04 ventajas</span>
          </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-[#e7e7e7] bg-[#e7e7e7] md:grid-cols-4">
            {benefits.map(({ label, detail, icon: Icon }, index) => (
               <article key={label} data-testid={`card-vip-benefit-${index}`} className="vip-benefit-card group min-h-[122px] bg-white p-4 transition-colors hover:bg-[#df3933]">
                <div className="flex items-start justify-between">
                   <Icon size={29} strokeWidth={1.8} className="text-[#111] transition-colors group-hover:text-white" />
                   <span className="font-mono text-[9px] text-[#999] transition-colors group-hover:text-white/65">0{index + 1}</span>
                </div>
                <h3 className="mt-7 text-[11px] font-bold uppercase tracking-[.04em] text-[#d52f2f]">{label}</h3>
                <p className="mt-1 text-[10px] text-[#111] transition-colors group-hover:text-white/75">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vip-editorial relative overflow-hidden bg-black px-5 py-10 text-white md:px-12 md:py-14">
          <span className="absolute -right-2 -top-6 select-none text-[8rem] font-black leading-none tracking-[-.12em] text-white/[.045]" aria-hidden="true">VIP</span>
          <div className="relative max-w-[720px]">
             <p className="section-label mb-6 text-[#d73832]">Beneficios VIP</p>
            <h2 data-testid="text-vip-editorial-title" className="vip-editorial-title max-w-[620px] text-[clamp(2.5rem,9vw,5.9rem)] font-black uppercase leading-[.82] tracking-[-.075em]">
               Primero el VIP.<br /><span className="text-[#d73832]">Después el resto.</span>
            </h2>
            <div className="mt-8 flex max-w-[430px] items-start gap-3 border-l-2 border-[#d73832] pl-4">
              <p className="text-[12px] leading-[1.55] text-white/75 md:text-[13px]">
                 Los drops más buscados <span className="text-[#d73832]">no esperan.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="vip-final-cta relative overflow-hidden bg-[#0b0b0b] px-5 py-10 md:px-12 md:py-12">
          <div className="vip-red-line absolute bottom-0 left-5 top-0 w-px bg-[#d73832] md:left-12" aria-hidden="true" />
          <div className="pl-5 md:pl-8">
            <p className="section-label text-white/45">Acceso privado</p>
            <h2 data-testid="text-vip-final-title" className="vip-heading mt-3 text-[clamp(2rem,8vw,4.7rem)] font-black uppercase leading-[.86] tracking-[-.07em]">¿Quieres llegar antes?</h2>
            <p className="mt-4 max-w-[390px] text-[11px] leading-[1.5] text-white/70">Acceso mediante grupo privado de WhatsApp.</p>
            <button data-testid="button-vip-enter-final" onClick={enterVip} className="mt-7 flex h-[45px] w-full max-w-[285px] items-center justify-between bg-[#df3933] px-4 text-[10px] font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-[#f04a43]">
              <span className="flex items-center gap-2"><MessageCircle size={16} strokeWidth={1.7} /> Entrar al VIP</span>
              <ArrowRight size={18} strokeWidth={1.7} />
            </button>
          </div>
        </section>
      </main>
      <BottomNav active="vip" onVip={() => setLocation('/vip')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} />
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }

function replaceLegacyCurrency(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current: Node | null = walker.nextNode();
  while (current) {
    if (current.nodeValue?.includes('Bs.')) current.nodeValue = current.nodeValue.replaceAll('Bs.', 'MXN $');
    current = walker.nextNode();
  }
}

function Router() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location]);
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/collection" component={CollectionPage} /><Route path="/social" component={SocialPage} /><Route path="/vip" component={VipPage} /><Route path="/checkout" component={CheckoutPage} /><Route path="/products" component={ProductsPage} /><Route path="/products/:id" component={ProductDetailPage} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}
function App() {
  useEffect(() => {
    replaceLegacyCurrency(document.body);
    const currencyObserver = new MutationObserver(() => replaceLegacyCurrency(document.body));
    const entranceTimer = window.setTimeout(() => playEntranceSound(), 1000);
    const startMusicOnScroll = () => {
      startBackgroundMusic(true);
    };
    window.addEventListener('scroll', startMusicOnScroll, { once: true, passive: true });
    window.addEventListener('touchmove', startMusicOnScroll, { once: true, passive: true });
    window.addEventListener('wheel', startMusicOnScroll, { once: true, passive: true });
    currencyObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      window.clearTimeout(entranceTimer);
      window.removeEventListener('scroll', startMusicOnScroll);
      window.removeEventListener('touchmove', startMusicOnScroll);
      window.removeEventListener('wheel', startMusicOnScroll);
      currencyObserver.disconnect();
    };
  }, []);
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ShopProvider><Router /></ShopProvider></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;