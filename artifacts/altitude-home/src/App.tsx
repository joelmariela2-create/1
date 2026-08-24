import { type ReactNode, type TouchEvent, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowLeft, ArrowRight, ChevronRight, Crown, CreditCard, Heart, House, ListFilter,
  MapPin, Menu, MessageCircle, Plus, RefreshCw, Search, ShieldCheck, ShoppingBag,
  ShoppingCart, Truck, UserRound, X,
} from 'lucide-react';

const queryClient = new QueryClient();
const vipWhatsAppUrl = 'https://wa.me/59170000000';

type Campaign = {
  label: string;
  title: string;
  image: string;
  position: string;
  tone: 'light' | 'dark';
  id: string;
};

const campaigns: Campaign[] = [
  { label: 'Nuevo drop', title: 'Naruto', image: '/naruto-collection.png', position: 'center 35%', tone: 'light', id: 'youngla' },
  { label: 'Naruto', title: 'Colección', image: '/naruto-live-now.jpg', position: 'center 35%', tone: 'light', id: 'naruto' },
  { label: 'Gymshark', title: 'Nuevos ingresos', image: '/gymshark-logo.png', position: 'center 35%', tone: 'light', id: 'gymshark-featured' },
  { label: 'YoungLA', title: 'Nueva colección', image: '/youngla-logo.png', position: 'center 35%', tone: 'light', id: 'youngla-featured' },
];

const products = [
  { id: 'elevated-tee', name: 'Camiseta Essential Core', brand: 'ALTITUDE', price: 'Bs. 249', image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'everyday-tee', name: 'Camiseta Everyday Heavy', brand: 'YoungLA', price: 'Bs. 289', image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'pace-short', name: 'Short de entrenamiento Pace 5”', brand: 'Gymshark', price: 'Bs. 319', image: 'https://images.pexels.com/photos/6550851/pexels-photo-6550851.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'studio-hoodie', name: 'Hoodie con cierre Studio', brand: 'ALTITUDE VIP', price: 'Bs. 429', image: 'https://images.pexels.com/photos/6347547/pexels-photo-6347547.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Header({ cartCount, onMenu }: { cartCount: number; onMenu: () => void }) {
  return (
    <>
      <div className="announcement-strip flex h-7 items-center overflow-hidden bg-[#eeece9] text-[9px] font-semibold uppercase tracking-[.16em] text-[#252525]" aria-label="Información de envíos">
        <div className="announcement-track flex min-w-max items-center">
          <span className="px-4">Envíos a todo el país <span className="mx-2 text-[#c52d2a]">·</span> Productos 100% originales</span>
          <span className="px-4" aria-hidden="true">Envíos a todo el país <span className="mx-2 text-[#c52d2a]">·</span> Productos 100% originales</span>
        </div>
      </div>
      <header className="relative z-20 flex h-[62px] items-center justify-between border-b border-[#e6e2de] bg-white px-5 text-[#151515] md:h-[76px] md:px-8">
        <button data-testid="button-open-menu" onClick={onMenu} aria-label="Abrir menú" className="group relative -left-3 -top-2 flex h-8 w-8 items-center justify-center transition-colors hover:text-[#ec413b]"><Menu size={19} strokeWidth={1.7} /></button>
        <div className="relative -right-3 -top-2 flex items-center gap-2">
          <button data-testid="button-search" onClick={() => window.alert('La búsqueda estará disponible muy pronto.')} aria-label="Buscar productos" className="flex h-8 w-8 items-center justify-center transition-colors hover:text-[#ec413b]"><Search size={20} strokeWidth={1.7} /></button>
          <button data-testid="button-open-cart" onClick={() => window.alert('Tu carrito está listo para despegar.')} aria-label="Abrir carrito" className="relative flex h-8 w-8 items-center justify-center transition-colors hover:text-[#ec413b]"><ShoppingCart size={21} strokeWidth={1.7} />{cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ca2f2b] px-1 text-[9px] font-bold text-white">{cartCount}</span>}</button>
        </div>
      </header>
      <nav className="desktop-nav hidden h-11 items-center justify-center gap-12 border-b border-[#e6e2de] bg-white text-[10px] font-semibold uppercase tracking-[.15em] text-[#252525]">
        <button onClick={() => scrollToSection('new-releases')}>Tienda</button>
        <button onClick={() => scrollToSection('showroom')}>Showroom</button>
        <button onClick={() => scrollToSection('vip-access')} className="text-[#ec413b]">Acceso VIP</button>
        <button onClick={() => scrollToSection('benefits')}>Beneficios</button>
      </nav>
    </>
  );
}

function CampaignHero({ onShop }: { onShop: (campaign: Campaign) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const campaign = campaigns[activeIndex];
  useEffect(() => {
    campaigns.forEach(({ image }) => { const preload = new Image(); preload.decoding = 'async'; preload.src = image; });
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % campaigns.length), 1300);
    return () => window.clearInterval(timer);
  }, []);
  const handleTouchStart = (event: TouchEvent<HTMLElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    const delta = endX === undefined ? 0 : endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) >= 45) setActiveIndex((index) => (index + (delta < 0 ? 1 : campaigns.length - 1)) % campaigns.length);
  };
  const benefits = [
    { label: 'Envíos nacionales', detail: 'A toda Bolivia', icon: Truck },
    { label: 'Productos originales', detail: 'Marcas 100% auténticas', icon: ShieldCheck },
    { label: 'Pago seguro', detail: 'Contra entrega', icon: CreditCard },
    { label: 'Cambios fáciles', detail: 'Compra con confianza', icon: RefreshCw },
  ];
  return (
    <section id="campaign-hero" className="campaign-hero relative flex h-auto min-h-0 flex-col overflow-hidden bg-[#050505] text-[#151515] md:h-auto md:min-h-[680px]" aria-label="Campaña destacada" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <img key={campaign.id} className="campaign-image absolute inset-0 h-full w-full object-contain" src={campaign.image} alt={`${campaign.label} ${campaign.title}`} style={{ objectPosition: campaign.position, transform: campaign.id === 'youngla-featured' ? 'translateY(-24px) scale(1.08)' : campaign.id === 'youngla' ? 'translateY(-38px) scale(1.08)' : undefined, filter: campaign.id === 'youngla' ? 'contrast(0.8)' : undefined }} loading="eager" decoding="async" />
      {campaign.id === 'gymshark-featured' && <div aria-hidden="true" className="absolute bottom-[93px] left-0 right-0 z-[1] h-3 bg-[#050505]" />}
      <div className="absolute inset-0" style={{ background: campaign.id === 'youngla' ? 'linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,.02) 42%, rgba(0,0,0,.46) 100%)' : 'linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,.2) 100%)' }} />
      <div className="relative z-10 flex flex-1 flex-col justify-between px-5 pb-6 pt-8 md:px-10 md:pb-8 md:pt-12">
        <div className="campaign-content absolute bottom-[18px] left-5 right-5 max-w-[520px]">
          <button data-testid={`button-collection-${campaign.id}`} onClick={() => onShop(campaign)} className="hero-cta group flex h-[44px] w-[240px] items-center justify-between border border-white bg-transparent px-4 text-[10px] font-bold uppercase tracking-[.1em] text-white transition-colors hover:bg-white hover:text-[#151515]">Ver colección <ArrowRight size={20} strokeWidth={1.7} className="transition-transform group-hover:translate-x-1" /></button>
        </div>
      </div>
      <div id="benefits" className="relative z-10 grid grid-cols-4 border-t border-[#dedad6] bg-white/95 backdrop-blur-md">
        {benefits.map(({ label, detail, icon: Icon }, index) => <div key={label} className={`hero-benefit flex min-h-[93px] flex-col items-center justify-center px-1 text-center ${index < benefits.length - 1 ? 'border-r border-[#dedad6]' : ''}`}><Icon size={22} strokeWidth={1.45} className="mb-2 text-[#252525]" /><strong className="max-w-[78px] text-[8px] font-bold uppercase leading-[1.18] tracking-[.03em] md:max-w-none md:text-[10px]">{label}</strong><span className="mt-1 hidden text-[8px] text-[#77716c] md:block">{detail}</span></div>)}
      </div>
      <div className="absolute bottom-[98px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5" aria-label={`Campaña ${activeIndex + 1} de ${campaigns.length}`}>{Array.from({ length: 3 }, (_, index) => <span key={index} className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${activeIndex % 3 === index ? 'scale-125 bg-white' : 'bg-white/45'}`} />)}</div>
    </section>
  );
}

function ProductRail({ onAdd }: { onAdd: (name: string) => void }) {
  return <section id="new-releases" className="px-5 pb-7 pt-1 md:px-8"><div className="mb-3 flex items-end justify-between"><div><p className="section-label mb-1 text-[#7c7772]">Recién llegados</p><h2 className="editorial-title text-[20px] font-bold uppercase tracking-[-.04em]">Nuevos lanzamientos</h2></div><button onClick={() => window.alert('Muy pronto: toda la tienda ALTITUDE.')} className="group flex items-center gap-1 pb-0.5 text-[9px] font-bold uppercase text-[#ca2f2b]">Ver todo <ArrowRight size={13} /></button></div><div className="scrollbar-hide -mx-5 flex snap-x gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">{products.map((product) => <article key={product.id} className="w-[145px] shrink-0 snap-start md:w-auto"><div className="group relative aspect-[.78] overflow-hidden bg-[#eeecea]"><img src={product.image} alt={product.name} className="h-full w-full object-cover object-center grayscale-[.08] transition-transform duration-500 group-hover:scale-105" /><button onClick={() => window.alert(`${product.name} guardado en favoritos.`)} aria-label={`Añadir ${product.name} a favoritos`} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90"><Heart size={14} strokeWidth={1.6} /></button><button onClick={() => onAdd(product.name)} className="absolute bottom-2 left-2 right-2 flex h-8 items-center justify-center gap-2 bg-white/95 text-[9px] font-bold uppercase tracking-[.08em] opacity-0 transition-opacity group-hover:opacity-100">Añadir <Plus size={13} /></button></div><div className="pt-2"><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8a837d]">{product.brand}</p><h3 className="mt-1 truncate text-[11px] font-semibold">{product.name}</h3><p className="mt-1 text-[11px] font-medium">{product.price}</p></div></article>)}</div></section>;
}

function VipSection() {
  return <section id="vip-access" className="vip-hero-page"><div className="vip-hero"><img src="/vip-hero-reference.jpg" alt="ALTITUDE VIP Early Access" className="vip-hero-image" width={720} height={1600} fetchPriority="high" /><button type="button" data-testid="button-enter-vip" aria-label="Entrar al grupo VIP por WhatsApp" onClick={() => window.open(vipWhatsAppUrl, '_blank', 'noopener,noreferrer')} className="vip-hero-cta"><span>Entrar al VIP</span><ArrowRight size={22} strokeWidth={1.8} aria-hidden="true" /></button></div></section>;
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, setLocation] = useLocation();
  if (!open) return null;
  const links = [['Productos', 'products'], ['Nuevos lanzamientos', 'new-releases'], ['Nuevo drop Naruto', 'youngla'], ['Naruto', 'gymshark'], ['ALTITUDE VIP', 'vip-access'], ['Showroom La Paz', 'showroom']];
  return <div className="fixed inset-0 z-50"><button aria-label="Cerrar menú" onClick={onClose} className="absolute inset-0 bg-[#171717]/30 backdrop-blur-[1px]" /><aside className="relative h-full w-[82%] max-w-[350px] bg-white px-6 py-6 shadow-2xl"><div className="flex items-center justify-between border-b border-[#e6e2de] pb-5"><span className="altitude-wordmark text-[25px]">ALTITUDE</span><button onClick={onClose} aria-label="Cerrar menú"><X size={22} strokeWidth={1.6} /></button></div><p className="section-label mt-9 text-[#8b857e]">Explorar</p><nav className="mt-4 flex flex-col">{links.map(([label, id]) => <button key={id} onClick={() => { onClose(); id === 'products' ? setLocation('/products') : scrollToSection(id); }} className="flex items-center justify-between border-b border-[#efebe7] py-4 text-left text-[13px] font-semibold uppercase tracking-[.03em]">{label}<ChevronRight size={16} strokeWidth={1.4} className="text-[#ca2f2b]" /></button>)}</nav></aside></div>;
}

function BottomNav({ onVip }: { onVip: () => void }) {
  const [, setLocation] = useLocation();
  const items = [{ label: 'Inicio', icon: House, action: () => scrollToSection('top'), id: 'home' }, { label: 'Tienda', icon: ShoppingBag, action: () => setLocation('/products'), id: 'shop' }, { label: 'Showroom', icon: MapPin, action: () => scrollToSection('showroom'), id: 'showroom' }, { label: 'VIP', icon: Crown, action: onVip, id: 'vip' }, { label: 'WhatsApp', icon: MessageCircle, action: () => window.open(vipWhatsAppUrl, '_blank'), id: 'whatsapp' }];
  return <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex h-[67px] items-center justify-around border-t px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">{items.map(({ label, icon: Icon, action, id }) => <button key={id} onClick={action} className="flex min-w-[52px] flex-col items-center gap-1 text-[8px] font-semibold uppercase tracking-[-.01em]"><Icon size={21} strokeWidth={id === 'home' ? 2 : 1.55} /><span>{label}</span></button>)}</nav>;
}

function ProductsPage() {
  const [, setLocation] = useLocation();
  const categories = ['Todos los productos', 'Camisetas y tops', 'Shorts', 'Sudaderas con capucha y sudaderas', 'Joggers y pantalones deportivos', 'Pantalones', 'Camisetas sin mangas', 'Conjuntos deportivos', 'Camisetas de manga larga', 'Chaquetas', 'Ropa de abrigo', 'Primera capa'];
  return <div className="products-page min-h-[100dvh] bg-white text-[#111]"><header className="flex h-[76px] items-center border-b border-[#f0f0f0] px-[18px]"><button onClick={() => setLocation('/')} aria-label="Volver al inicio" className="flex h-10 w-10 items-center justify-start"><ArrowLeft size={25} strokeWidth={1.7} /></button><h1 className="flex-1 pr-10 text-center text-[15px] font-bold uppercase tracking-[-.02em]">Productos</h1></header><main className="px-[17px] pb-[78px]"><div className="border-t border-[#f0f0f0]">{categories.map((category) => <button key={category} className="flex h-[61px] w-full items-center justify-between border-b border-[#f0f0f0] text-left text-[15px] font-normal"><span>{category}</span><ChevronRight size={18} strokeWidth={1.5} /></button>)}</div></main></div>;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState('');
  return <div id="top" className="page-shell bg-[#000]"><Header cartCount={cartCount} onMenu={() => setMenuOpen(true)} /><main><VipSection /></main><Drawer open={menuOpen} onClose={() => setMenuOpen(false)} /></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function Router() { return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/products" component={ProductsPage} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }

export default App;