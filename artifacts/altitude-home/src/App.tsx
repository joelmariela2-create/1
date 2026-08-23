import { type ReactNode, type TouchEvent, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowRight,
  ChevronRight,
  Crown,
  CreditCard,
  Heart,
  House,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react';

const queryClient = new QueryClient();

type Campaign = {
  label: string;
  title: string;
  image: string;
  position: string;
  tone: 'light' | 'dark';
  id: string;
};

const campaigns: Campaign[] = [
  {
    label: 'YoungLA',
    title: 'Nuevo drop',
    image: '/naruto-collection.png',
    position: 'center',
    tone: 'light',
    id: 'youngla',
  },
  {
    label: 'Gymshark',
    title: 'Nuevos ingresos',
    image: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=1400',
    position: 'center 42%',
    tone: 'light',
    id: 'gymshark',
  },
  {
    label: 'Altitude VIP',
    title: 'Acceso anticipado',
    image: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1400',
    position: 'center 38%',
    tone: 'light',
    id: 'vip',
  },
];

const products = [
  { id: 'elevated-tee', name: 'Camiseta Essential Core', brand: 'ALTITUDE', price: 'Bs. 249', image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=800', color: 'Carbón' },
  { id: 'everyday-tee', name: 'Camiseta Everyday Heavy', brand: 'YoungLA', price: 'Bs. 289', image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800', color: 'Piedra' },
  { id: 'pace-short', name: 'Short de entrenamiento Pace 5”', brand: 'Gymshark', price: 'Bs. 319', image: 'https://images.pexels.com/photos/6550851/pexels-photo-6550851.jpeg?auto=compress&cs=tinysrgb&w=800', color: 'Negro' },
  { id: 'studio-hoodie', name: 'Hoodie con cierre Studio', brand: 'ALTITUDE VIP', price: 'Bs. 429', image: 'https://images.pexels.com/photos/6347547/pexels-photo-6347547.jpeg?auto=compress&cs=tinysrgb&w=800', color: 'Espresso' },
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
        <button data-testid="button-open-menu" onClick={onMenu} aria-label="Abrir menú" className="group flex h-9 w-9 items-center justify-center transition-colors hover:text-[#ec413b]">
          <Menu size={23} strokeWidth={1.7} className="transition-transform group-hover:scale-90" />
        </button>
        <button data-testid="button-home-logo" onClick={() => scrollToSection('top')} className="altitude-wordmark text-[25px] md:text-[32px]">ALTITUDE</button>
        <div className="flex items-center gap-2">
          <button data-testid="button-search" onClick={() => window.alert('La búsqueda estará disponible muy pronto.')} aria-label="Buscar productos" className="flex h-9 w-9 items-center justify-center transition-colors hover:text-[#ec413b]">
            <Search size={23} strokeWidth={1.7} />
          </button>
          <button data-testid="button-open-cart" onClick={() => window.alert('Tu carrito está listo para despegar.')} aria-label="Abrir carrito" className="relative flex h-9 w-9 items-center justify-center transition-colors hover:text-[#ec413b]">
            <ShoppingCart size={24} strokeWidth={1.7} />
            {cartCount > 0 && <span data-testid="text-cart-count" className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#ca2f2b] px-1 text-[9px] font-bold text-white">{cartCount}</span>}
          </button>
        </div>
      </header>
      <nav className="desktop-nav hidden h-11 items-center justify-center gap-12 border-b border-[#e6e2de] bg-white text-[10px] font-semibold uppercase tracking-[.15em] text-[#252525]">
        <button data-testid="button-nav-shop" onClick={() => scrollToSection('new-releases')}>Tienda</button>
        <button data-testid="button-nav-showroom" onClick={() => scrollToSection('showroom')}>Showroom</button>
        <button data-testid="button-nav-vip" onClick={() => scrollToSection('vip-access')} className="text-[#ec413b]">Acceso VIP</button>
        <button data-testid="button-nav-benefits" onClick={() => scrollToSection('vip-access')}>Beneficios</button>
      </nav>
    </>
  );
}

function CampaignHero({ onShop }: { onShop: (campaign: Campaign) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const campaign = campaigns[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % campaigns.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    const delta = endX === undefined ? 0 : endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 45) return;
    setActiveIndex((index) => (index + (delta < 0 ? 1 : campaigns.length - 1)) % campaigns.length);
  };
  const benefits = [
    { label: 'Envíos nacionales', detail: 'A toda Bolivia', icon: Truck },
    { label: 'Productos originales', detail: 'Marcas 100% auténticas', icon: ShieldCheck },
    { label: 'Pago seguro', detail: 'Contra entrega', icon: CreditCard },
    { label: 'Cambios fáciles', detail: 'Compra con confianza', icon: RefreshCw },
  ];

  return (
    <section id="campaign-hero" className="campaign-hero relative flex min-h-[calc(100dvh-170px)] flex-col overflow-hidden bg-[#050505] text-[#151515]" aria-label="Campaña destacada" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
       <img
         className="campaign-image absolute inset-0 h-full w-full object-contain"
         src={campaign.image}
         alt={`${campaign.label} ${campaign.title}`}
       />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08)_0%,rgba(0,0,0,0)_42%,rgba(0,0,0,.2)_100%)]" />
      <div className="relative z-10 flex flex-1 flex-col justify-between px-5 pb-6 pt-8 md:px-10 md:pb-8 md:pt-12">
        <div key={`${campaign.id}-content`} className="campaign-content absolute bottom-[52px] left-5 right-5 max-w-[520px]">
          <div className="flex flex-col items-start gap-2">
            <button data-testid={`button-collection-${campaign.id}`} onClick={() => onShop(campaign)} className="hero-cta group flex h-[50px] w-[280px] items-center justify-between border border-white bg-transparent px-5 text-[11px] font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-white hover:text-[#151515]">
              Ver colección <ArrowRight size={20} strokeWidth={1.7} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button data-testid={`button-all-products-${campaign.id}`} onClick={() => scrollToSection('new-releases')} className="hero-cta group flex h-[47px] w-[262px] items-center justify-between border border-white bg-transparent px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white transition-colors hover:bg-white hover:text-[#151515]">
              Ver todos los productos <ArrowRight size={19} strokeWidth={1.7} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
      <div id="vip-access" className="relative z-10 grid grid-cols-4 border-t border-[#dedad6] bg-white/95 backdrop-blur-md">
        {benefits.map(({ label, detail, icon: Icon }, index) => (
          <div data-testid={`benefit-${index}`} key={label} className={`hero-benefit flex min-h-[93px] flex-col items-center justify-center px-1 text-center ${index < benefits.length - 1 ? 'border-r border-[#dedad6]' : ''}`}>
            <Icon size={22} strokeWidth={1.45} className="mb-2 text-[#252525]" />
            <strong className="max-w-[78px] text-[8px] font-bold uppercase leading-[1.18] tracking-[.03em] md:max-w-none md:text-[10px]">{label}</strong>
            <span className="mt-1 hidden text-[8px] text-[#77716c] md:block">{detail}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[108px] left-10 z-10 flex translate-x-0 items-center gap-3 md:bottom-[116px] md:left-12" aria-label="Seleccionar campaña">
        {campaigns.map((item, index) => <button key={item.id} type="button" aria-label={`Mostrar ${item.label}`} aria-current={index === activeIndex ? 'true' : undefined} onClick={() => setActiveIndex(index)} className={`h-2 rounded-full border transition-all duration-300 ${index === activeIndex ? 'w-5 border-[#ec413b] bg-[#ec413b]' : 'w-2 border-white/80 bg-white/70'}`} data-testid={`dot-${item.id}`} />)}
      </div>
    </section>
  );
}

function ProductRail({ onAdd }: { onAdd: (name: string) => void }) {
  return (
    <section id="new-releases" className="px-5 pb-7 pt-1 md:px-8">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="section-label mb-1 text-[#7c7772]">Recién llegados</p>
          <h2 className="editorial-title text-[20px] font-bold uppercase tracking-[-.04em]">Nuevos lanzamientos</h2>
        </div>
        <button data-testid="button-view-all" onClick={() => window.alert('Muy pronto: toda la tienda ALTITUDE.')} className="group flex items-center gap-1 pb-0.5 text-[9px] font-bold uppercase text-[#ca2f2b]">Ver todo <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></button>
      </div>
      <div className="scrollbar-hide -mx-5 flex snap-x gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {products.map((product) => (
          <article key={product.id} className="w-[145px] shrink-0 snap-start md:w-auto" data-testid={`card-product-${product.id}`}>
            <div className="group relative aspect-[.78] overflow-hidden bg-[#eeecea]">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover object-center grayscale-[.08] transition-transform duration-500 group-hover:scale-105" />
              <button data-testid={`button-favorite-${product.id}`} aria-label={`Añadir ${product.name} a favoritos`} onClick={(event) => { event.stopPropagation(); window.alert(`${product.name} guardado en favoritos.`); }} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90"><Heart size={14} strokeWidth={1.6} /></button>
              <button data-testid={`button-add-${product.id}`} onClick={() => onAdd(product.name)} className="absolute bottom-2 left-2 right-2 flex h-8 items-center justify-center gap-2 bg-white/95 text-[9px] font-bold uppercase tracking-[.08em] opacity-0 transition-opacity group-hover:opacity-100">Añadir <Plus size={13} /></button>
            </div>
            <div className="pt-2">
              <p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8a837d]">{product.brand}</p>
              <h3 className="mt-1 truncate text-[11px] font-semibold">{product.name}</h3>
              <p className="mt-1 text-[11px] font-medium">{product.price}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const links = [
    ['Nuevos lanzamientos', 'new-releases'],
    ['YoungLA Nuevo drop', 'youngla'],
    ['Gymshark Nuevos ingresos', 'gymshark'],
    ['ALTITUDE VIP', 'vip-access'],
    ['Showroom La Paz', 'showroom'],
  ];
  return (
    <div className="fixed inset-0 z-50">
      <button data-testid="button-close-drawer-overlay" aria-label="Cerrar menú" onClick={onClose} className="absolute inset-0 bg-[#171717]/30 backdrop-blur-[1px]" />
      <aside className="relative h-full w-[82%] max-w-[350px] bg-white px-6 py-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e6e2de] pb-5">
          <span className="altitude-wordmark text-[25px]">ALTITUDE</span>
          <button data-testid="button-close-menu" onClick={onClose} aria-label="Cerrar menú"><X size={22} strokeWidth={1.6} /></button>
        </div>
        <p className="section-label mt-9 text-[#8b857e]">Explorar</p>
        <nav className="mt-4 flex flex-col">
          {links.map(([label, id]) => <button data-testid={`button-drawer-${id}`} key={id} onClick={() => { onClose(); scrollToSection(id); }} className="flex items-center justify-between border-b border-[#efebe7] py-4 text-left text-[13px] font-semibold uppercase tracking-[.03em]">{label}<ChevronRight size={16} strokeWidth={1.4} className="text-[#ca2f2b]" /></button>)}
        </nav>
        <div className="absolute bottom-8 left-6 right-6 border-t border-[#e6e2de] pt-5 text-[11px] leading-[1.7] text-[#6c6660]">
          <p className="font-semibold text-[#252525]">Compra con confianza</p>
          <p>Envíos a toda Bolivia · Marcas originales</p>
        </div>
      </aside>
    </div>
  );
}

function BottomNav({ onVip }: { onVip: () => void }) {
  const items = [
    { label: 'Inicio', icon: House, action: () => scrollToSection('top'), id: 'home' },
    { label: 'Tienda', icon: ShoppingBag, action: () => scrollToSection('new-releases'), id: 'shop' },
    { label: 'Showroom', icon: MapPin, action: () => scrollToSection('showroom'), id: 'showroom' },
    { label: 'VIP', icon: Crown, action: onVip, id: 'vip' },
    { label: 'WhatsApp', icon: MessageCircle, action: () => window.open('https://wa.me/59170000000', '_blank'), id: 'whatsapp' },
  ];
  return <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex h-[67px] items-center justify-around border-t px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">{items.map(({ label, icon: Icon, action, id }) => <button data-testid={`button-bottom-${id}`} key={id} onClick={action} className="flex min-w-[52px] flex-col items-center gap-1 text-[8px] font-semibold uppercase tracking-[-.01em]"><Icon size={21} strokeWidth={id === 'home' ? 2 : 1.55} /><span>{label}</span></button>)}</nav>;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState('');
  const showroomRef = useRef<HTMLElement>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  };
  const addToCart = (name: string) => {
    setCartCount((count) => count + 1);
    notify(`${name} añadido al carrito`);
  };
  const openVip = () => {
    scrollToSection('vip-access');
    notify('Bienvenido al acceso ALTITUDE VIP');
  };

  return (
    <div id="top" className="page-shell min-h-[100dvh] bg-[#f2efe9] pb-[80px]">
      <Header cartCount={cartCount} onMenu={() => setMenuOpen(true)} />
      <main>
        <CampaignHero onShop={(item) => { scrollToSection('new-releases'); notify(`${item.label}: colección seleccionada`); }} />
        <ProductRail onAdd={addToCart} />
        <section id="showroom" ref={showroomRef} className="mx-5 mb-5 border-t border-[#e1ddda] py-5 md:mx-8">
          <div className="flex items-center justify-between">
            <div><p className="section-label mb-1 text-[#7c7772]">Visítanos</p><h2 className="editorial-title text-[20px] font-bold uppercase">Showroom La Paz</h2><p className="mt-1 text-[11px] text-[#6b6660]">Zona Sur · Av. Montenegro 1140</p></div>
            <button data-testid="button-showroom-location" onClick={() => window.open('https://maps.google.com/?q=La+Paz+Bolivia', '_blank')} aria-label="Ver showroom en el mapa" className="flex h-10 w-10 items-center justify-center border border-[#d8d3ce] transition-colors hover:border-[#ca2f2b] hover:text-[#ca2f2b]"><MapPin size={19} strokeWidth={1.5} /></button>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#e1ddda] px-5 py-7 text-center md:px-8">
        <div className="altitude-wordmark text-[27px]">ALTITUDE</div>
         <p className="mt-2 text-[9px] uppercase tracking-[.18em] text-[#8b857f]">Entrena más alto. Muévete distinto.</p>
        <div className="mt-5 flex justify-center gap-5 text-[10px] text-[#766f69]"><button data-testid="button-footer-help" onClick={() => notify('Escríbenos por WhatsApp para ayudarte.')}>Ayuda</button><button data-testid="button-footer-shipping" onClick={() => notify('Envíos a toda Bolivia.')}>Envíos</button><button data-testid="button-footer-vip" onClick={openVip}>ALTITUDE VIP</button></div>
      </footer>
      <BottomNav onVip={openVip} />
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      {toast && <div data-testid="status-toast" className="fixed bottom-[82px] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap bg-[#191919] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.06em] text-white shadow-md">{toast}</div>}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;