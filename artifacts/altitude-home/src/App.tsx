import { type ReactNode, type TouchEvent, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowLeft, ArrowRight, ChevronRight, Crown, CreditCard, Heart, House,
  LockKeyhole, MapPin, Menu, MessageCircle, PackageCheck, Plus, RefreshCw, Search,
  ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Timer, Truck, X,
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

function Header({ cartCount, onMenu, onShop, onShowroom }: { cartCount: number; onMenu: () => void; onShop?: () => void; onShowroom?: () => void }) {
  const [, setLocation] = useLocation();
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
        <button onClick={() => onShop ? onShop() : scrollToSection('new-releases')}>Tienda</button>
        <button onClick={() => onShowroom ? onShowroom() : scrollToSection('showroom')}>Showroom</button>
        <button onClick={() => setLocation('/vip')} className="text-[#ec413b]">Acceso VIP</button>
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

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location, setLocation] = useLocation();
  if (!open) return null;
  const links = [['Productos', 'products'], ['Nuevos lanzamientos', 'new-releases'], ['Nuevo drop Naruto', 'youngla'], ['Naruto', 'gymshark'], ['ALTITUDE VIP', 'vip-access'], ['Showroom La Paz', 'showroom']];
  return <div className="fixed inset-0 z-50"><button aria-label="Cerrar menú" onClick={onClose} className="absolute inset-0 bg-[#171717]/30 backdrop-blur-[1px]" /><aside className="relative h-full w-[82%] max-w-[350px] bg-white px-6 py-6 shadow-2xl"><div className="flex items-center justify-between border-b border-[#e6e2de] pb-5"><span className="altitude-wordmark text-[25px]">ALTITUDE</span><button onClick={onClose} aria-label="Cerrar menú"><X size={22} strokeWidth={1.6} /></button></div><p className="section-label mt-9 text-[#8b857e]">Explorar</p><nav className="mt-4 flex flex-col">{links.map(([label, id]) => <button key={id} onClick={() => { onClose(); if (id === 'products') setLocation('/products'); else if (id === 'vip-access') setLocation('/vip'); else if (location === '/vip') { setLocation('/'); window.setTimeout(() => scrollToSection(id), 80); } else scrollToSection(id); }} className="flex items-center justify-between border-b border-[#efebe7] py-4 text-left text-[13px] font-semibold uppercase tracking-[.03em]">{label}<ChevronRight size={16} strokeWidth={1.4} className="text-[#ca2f2b]" /></button>)}</nav></aside></div>;
}

function BottomNav({ onVip, onShowroom }: { onVip: () => void; onShowroom?: () => void }) {
  const [, setLocation] = useLocation();
  const items = [{ label: 'Inicio', icon: House, action: () => setLocation('/'), id: 'home' }, { label: 'Tienda', icon: ShoppingBag, action: () => setLocation('/products'), id: 'shop' }, { label: 'Showroom', icon: MapPin, action: onShowroom ?? (() => scrollToSection('showroom')), id: 'showroom' }, { label: 'VIP', icon: Crown, action: onVip, id: 'vip' }, { label: 'WhatsApp', icon: MessageCircle, action: () => window.open(vipWhatsAppUrl, '_blank'), id: 'whatsapp' }];
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
  const [, setLocation] = useLocation();
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2500); };
  const openVip = () => setLocation('/vip');
   return <div id="top" className="page-shell min-h-[100dvh] bg-[#f2efe9] pb-[80px]"><Header cartCount={cartCount} onMenu={() => setMenuOpen(true)} /><main className="home-main"><CampaignHero onShop={(item) => { scrollToSection('new-releases'); notify(`${item.label}: colección seleccionada`); }} /><ProductRail onAdd={(name) => { setCartCount((count) => count + 1); notify(`${name} añadido al carrito`); }} /><section id="showroom" className="mx-5 mb-5 border-t border-[#e1ddda] py-5 md:mx-8"><div className="flex items-center justify-between"><div><p className="section-label mb-1 text-[#7c7772]">Visítanos</p><h2 className="editorial-title text-[20px] font-bold uppercase">Showroom La Paz</h2><p className="mt-1 text-[11px] text-[#6b6660]">Zona Sur · Av. Montenegro 1140</p></div><button onClick={() => window.open('https://maps.google.com/?q=La+Paz+Bolivia', '_blank')} aria-label="Ver showroom en el mapa" className="flex h-10 w-10 items-center justify-center border border-[#d8d3ce] hover:border-[#ca2f2b] hover:text-[#ca2f2b]"><MapPin size={19} strokeWidth={1.5} /></button></div></section></main><footer className="border-t border-[#e1ddda] px-5 py-7 text-center md:px-8"><div className="altitude-wordmark text-[27px]">ALTITUDE</div><p className="mt-2 text-[9px] uppercase tracking-[.18em] text-[#8b857f]">Entrena más alto. Muévete distinto.</p><div className="mt-5 flex justify-center gap-5 text-[10px] text-[#766f69]"><button onClick={() => notify('Escríbenos por WhatsApp para ayudarte.')}>Ayuda</button><button onClick={() => notify('Envíos a toda Bolivia.')}>Envíos</button><button onClick={openVip}>ALTITUDE VIP</button></div></footer><BottomNav onVip={openVip} /><Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />{toast && <div className="fixed bottom-[82px] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap bg-[#191919] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-white shadow-md">{toast}</div>}</div>;
}

function VipPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const enterVip = () => window.open(vipWhatsAppUrl, '_blank', 'noopener,noreferrer');
  const benefits = [
    { label: 'Early access', detail: 'Entra antes que nadie', icon: Timer },
    { label: 'Nuevos drops', detail: 'La señal llega primero', icon: Sparkles },
    { label: 'Preventas', detail: 'Reserva tu talla', icon: PackageCheck },
    { label: 'Stock limitado', detail: 'Lo exclusivo no espera', icon: LockKeyhole },
  ];
  return (
    <div className="vip-page page-shell min-h-[100dvh] bg-[#0b0b0b] pb-[76px] text-[#f5f3ef]">
      <Header cartCount={0} onMenu={() => setMenuOpen(true)} onShop={() => setLocation('/products')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} />
      <main>
        <section className="vip-hero relative isolate overflow-hidden" aria-labelledby="vip-hero-title">
          <div className="vip-grid absolute inset-0" aria-hidden="true" />
          <div className="vip-orbit vip-orbit-one absolute" aria-hidden="true" />
          <div className="vip-orbit vip-orbit-two absolute" aria-hidden="true" />
          <div className="relative z-10 flex min-h-[443px] flex-col justify-between px-5 pb-7 pt-8 md:min-h-[525px] md:px-12 md:pb-10 md:pt-12">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#d73832]">
                <span className="vip-live-dot h-1.5 w-1.5 rounded-full bg-[#e33a34]" />
                Acceso privado
              </div>
              <span className="font-mono text-[9px] tracking-[.12em] text-white/45">AT / 001</span>
            </div>
            <div className="max-w-[700px]">
              <p className="vip-kicker mb-3 text-[10px] font-bold uppercase tracking-[.23em] text-white/60">ALTITUDE VIP</p>
              <h1 id="vip-hero-title" data-testid="text-vip-hero-title" className="vip-display max-w-[760px] text-[clamp(3.8rem,17vw,9.2rem)] font-black uppercase leading-[.78] tracking-[-.075em]">
                Early<br /><span className="text-[#e13832]">access.</span>
              </h1>
              <p className="mt-7 max-w-[370px] text-[12px] leading-[1.55] text-white/66 md:text-[14px]">
                El acceso privado para quienes quieren ver el próximo drop antes de que se abra la puerta.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
              <button data-testid="button-vip-enter-hero" onClick={enterVip} className="vip-button group flex h-[47px] w-full max-w-[285px] items-center justify-between bg-[#df3933] px-4 text-[10px] font-bold uppercase tracking-[.13em] text-white transition-colors hover:bg-[#f04a43]">
                Entrar al VIP
                <ArrowRight size={18} strokeWidth={1.7} className="transition-transform group-hover:translate-x-1" />
              </button>
              <span className="font-mono text-[9px] uppercase tracking-[.08em] text-white/40">Sin ruido. Solo lo que importa.</span>
            </div>
          </div>
          <div className="vip-hero-index absolute bottom-6 right-5 z-10 hidden font-mono text-[9px] text-white/40 md:block">01 / 04</div>
        </section>

        <section id="benefits" className="vip-benefits border-y border-white/12 bg-[#121212] px-5 py-6 md:px-12 md:py-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="section-label text-[#d73832]">Qué desbloqueas</p>
              <h2 data-testid="text-vip-benefits-title" className="vip-heading mt-1 text-[25px] font-bold uppercase leading-none tracking-[-.055em]">Beneficios VIP</h2>
            </div>
            <span className="font-mono text-[9px] text-white/35">04 ventajas</span>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden border border-white/12 bg-white/12 md:grid-cols-4">
            {benefits.map(({ label, detail, icon: Icon }, index) => (
              <article key={label} data-testid={`card-vip-benefit-${index}`} className="vip-benefit-card group min-h-[122px] bg-[#121212] p-4 transition-colors hover:bg-[#df3933]">
                <div className="flex items-start justify-between">
                  <Icon size={21} strokeWidth={1.35} className="text-[#e33a34] transition-colors group-hover:text-white" />
                  <span className="font-mono text-[9px] text-white/30 transition-colors group-hover:text-white/65">0{index + 1}</span>
                </div>
                <h3 className="mt-7 text-[11px] font-bold uppercase tracking-[.04em]">{label}</h3>
                <p className="mt-1 text-[10px] text-white/44 transition-colors group-hover:text-white/75">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vip-editorial relative overflow-hidden bg-[#e9e6e1] px-5 py-10 text-[#111] md:px-12 md:py-14">
          <span className="absolute -right-2 -top-6 select-none text-[8rem] font-black leading-none tracking-[-.12em] text-black/[.045]" aria-hidden="true">VIP</span>
          <div className="relative max-w-[720px]">
            <p className="section-label mb-6 text-[#d73832]">La señal antes de la señal</p>
            <h2 data-testid="text-vip-editorial-title" className="vip-editorial-title max-w-[620px] text-[clamp(2.5rem,9vw,5.9rem)] font-black uppercase leading-[.82] tracking-[-.075em]">
              Primero el VIP.<br /><span className="text-[#d73832]">Después el resto.</span>
            </h2>
            <div className="mt-8 flex max-w-[430px] items-start gap-3 border-l-2 border-[#d73832] pl-4">
              <p className="text-[12px] leading-[1.55] text-[#4b4844] md:text-[13px]">
                Una línea directa con lo que viene: lanzamientos, reposiciones y piezas que no llegan a todos.
              </p>
            </div>
          </div>
        </section>

        <section className="vip-final-cta relative overflow-hidden bg-[#0b0b0b] px-5 py-10 md:px-12 md:py-12">
          <div className="vip-red-line absolute bottom-0 left-5 top-0 w-px bg-[#d73832] md:left-12" aria-hidden="true" />
          <div className="pl-5 md:pl-8">
            <p className="section-label text-white/45">La próxima puerta abre pronto</p>
            <h2 data-testid="text-vip-final-title" className="vip-heading mt-3 text-[clamp(2rem,8vw,4.7rem)] font-black uppercase leading-[.86] tracking-[-.07em]">¿Quieres llegar antes?</h2>
            <p className="mt-4 max-w-[390px] text-[11px] leading-[1.5] text-white/48">Escríbenos por WhatsApp y recibe el acceso cuando se active el próximo lanzamiento.</p>
            <button data-testid="button-vip-enter-final" onClick={enterVip} className="mt-7 flex h-[45px] w-full max-w-[285px] items-center justify-between bg-[#df3933] px-4 text-[10px] font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-[#f04a43]">
              <span className="flex items-center gap-2"><MessageCircle size={16} strokeWidth={1.7} /> Entrar al VIP</span>
              <ArrowRight size={18} strokeWidth={1.7} />
            </button>
          </div>
        </section>
      </main>
      <BottomNav onVip={() => setLocation('/vip')} onShowroom={() => { setLocation('/'); window.setTimeout(() => scrollToSection('showroom'), 80); }} />
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function Router() { return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/vip" component={VipPage} /><Route path="/products" component={ProductsPage} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }

export default App;