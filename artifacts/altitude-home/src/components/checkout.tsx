import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, MessageCircle, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useCreateOrder } from '@workspace/api-client-react';
import { formatBs } from '@/lib/format';
import { boliviaDepartments } from '@/lib/bolivia';
import { storeWhatsAppUrl } from '@/lib/store-links';
import { cartItemKey, useShop, type CartItem } from '@/lib/shop';

type CustomerData = { name: string; phone: string; country: string; city: string; address: string };

function createOrderMessage(customer: CustomerData, cartItems: CartItem[], total: number) {
  const summary = cartItems.map((item) => `${item.quantity > 1 ? `${item.quantity}× ` : ''}${item.name}${item.selectedSize ? ` · talla ${item.selectedSize}` : ''}`).join(', ');
  const units = cartItems.reduce((count, item) => count + item.quantity, 0);
  return `🌐 VENGO DE LA TIENDA VIRTUAL 🛒\n\n«🛍️ MI PEDIDO SELECCIONADO 📦\n\n📦 PEDIDO: ${summary}\n🔢 CANTIDAD: ${units}\n💰 TOTAL: ${formatBs(total)}\n💱 MONEDA: BOLIVIANOS (Bs.)\n\n📊 DATOS DEL CLIENTE:\n📝 NOMBRE COMPLETO: ${customer.name}\n📲 TELÉFONO: ${customer.phone}\n🇧🇴 PAÍS: ${customer.country}\n🗺️ DEPARTAMENTO: ${customer.city}\n🏠 DOMICILIO: ${customer.address}»`;
}

function openOrderWhatsApp(message: string) {
  const whatsappUrl = `${storeWhatsAppUrl}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

function OrderForm({ cartItems, total, onConfirm }: { cartItems: CartItem[]; total: number; onConfirm: (customer: CustomerData, message: string) => void }) {
  const [customer, setCustomer] = useState<CustomerData>({ name: '', phone: '', country: 'Bolivia', city: '', address: '' });
  const [messageOverride, setMessageOverride] = useState<string | null>(null);
  const [error, setError] = useState('');
  const createOrder = useCreateOrder();
  const units = cartItems.reduce((count, item) => count + item.quantity, 0);
  const previewMessage = messageOverride ?? createOrderMessage(customer, cartItems, total);
  const updateCustomer = (field: keyof CustomerData, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
    setMessageOverride(null);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await createOrder.mutateAsync({
        data: {
          customerName: customer.name.trim(),
          phone: customer.phone.trim(),
          country: customer.country,
          city: customer.city,
          address: customer.address.trim(),
          items: cartItems.map((item) => ({
            productId: Number(item.id) || 0,
            productName: item.name,
            size: item.selectedSize ?? null,
            quantity: item.quantity,
            unitPrice: item.priceValue,
            imageUrl: item.image || null,
          })),
          total,
        },
      });
      onConfirm(customer, previewMessage);
    } catch {
      setError('No pudimos guardar tu pedido. Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-form ck-form">
      <section className="ck-card" aria-labelledby="ck-summary-title">
        <div className="ck-section-head">
          <span className="ck-step">01</span>
          <h2 id="ck-summary-title" className="ck-section-title">Resumen del pedido</h2>
          <span className="ck-count">{units} {units === 1 ? 'artículo' : 'artículos'}</span>
        </div>
        <ul className="ck-items">
          {cartItems.map((item, index) => (
            <li key={cartItemKey(item)} className="ck-item">
              <img
                data-testid={`img-order-preview-${item.id}-${index}`}
                className="ck-item-image"
                src={item.image}
                alt={item.name}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <div className="ck-item-info">
                <p className="ck-item-brand">{item.brand}</p>
                <p className="ck-item-name">{item.name}</p>
                <p className="ck-item-meta">
                  {item.selectedSize && <span>Talla {item.selectedSize}</span>}
                  <span className="ck-item-qty">×{item.quantity}</span>
                </p>
              </div>
              <span className="ck-item-price tabular-nums">{formatBs(item.priceValue * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="ck-totals">
          <div>
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatBs(total)}</dd>
          </div>
          <div>
            <dt>Envío</dt>
            <dd>Se coordina por WhatsApp</dd>
          </div>
          <div className="ck-total-row">
            <dt>Total</dt>
            <dd data-testid="text-order-summary-total" className="tabular-nums">{formatBs(total)}</dd>
          </div>
        </dl>
      </section>

      <section className="ck-card" aria-labelledby="ck-delivery-title">
        <div className="ck-section-head">
          <span className="ck-step">02</span>
          <h2 id="ck-delivery-title" className="ck-section-title">Datos de entrega</h2>
        </div>
        <div className="ck-fields">
          <label className="ck-field">
            <span>Nombre completo 📋</span>
            <input data-testid="input-order-name" required value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} placeholder="Escribe tu nombre" autoComplete="name" />
          </label>
          <label className="ck-field">
            <span>Teléfono</span>
            <div className="ck-phone">
              <span className="ck-phone-prefix">+591</span>
              <input data-testid="input-order-phone" required type="tel" inputMode="tel" value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} placeholder="Número local" autoComplete="tel" />
            </div>
          </label>
          <div className="ck-grid-2">
            <label className="ck-field">
              <span>País</span>
              <select data-testid="select-order-country" required value={customer.country} onChange={(event) => updateCustomer('country', event.target.value)}>
                <option value="Bolivia">🇧🇴 Bolivia</option>
              </select>
            </label>
            <label className="ck-field">
              <span>Departamento</span>
              <select data-testid="select-order-city" required value={customer.city} onChange={(event) => updateCustomer('city', event.target.value)}>
                <option value="">Selecciona tu departamento</option>
                {boliviaDepartments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
          </div>
          <label className="ck-field">
            <span>Domicilio 🏠</span>
            <input data-testid="input-order-address" required autoComplete="street-address" value={customer.address} onChange={(event) => updateCustomer('address', event.target.value)} placeholder="Calle y número de casa" />
          </label>
        </div>
      </section>

      <details className="ck-card ck-details">
        <summary className="ck-details-summary">
          <span className="ck-step">03</span>
          <span className="ck-details-label">Mensaje para WhatsApp</span>
          <span className="ck-details-hint">Opcional</span>
          <ChevronDown size={16} className="ck-details-icon" aria-hidden="true" />
        </summary>
        <div className="ck-details-body">
          <p className="ck-details-help">Así se enviará tu pedido. Puedes editarlo antes de confirmar.</p>
          <textarea
            data-testid="textarea-order-whatsapp-preview"
            aria-label="Mensaje para WhatsApp"
            value={previewMessage}
            onChange={(event) => setMessageOverride(event.target.value)}
            rows={10}
            spellCheck={false}
          />
        </div>
      </details>

      {error && <p role="alert" className="ck-error">{error}</p>}

      <div className="ck-bar">
        <div className="ck-bar-total">
          <span>Total</span>
          <strong className="tabular-nums">{formatBs(total)}</strong>
        </div>
        <button data-testid="button-confirm-order" type="submit" disabled={createOrder.isPending} className="ck-submit">
          {createOrder.isPending ? 'Guardando…' : 'Confirmar pedido'}
          <ArrowRight size={16} />
        </button>
      </div>
      <p className="ck-note"><MessageCircle size={13} aria-hidden="true" /> Tus datos se envían con el pedido por WhatsApp.</p>
    </form>
  );
}

function OrderConfirmed({ customer, onClose }: { customer: CustomerData; onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#0A0A0A]/55 px-5 py-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="order-confirmed-title">
    <div className="flex min-h-full items-center justify-center">
      <div className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[390px] flex-col overflow-y-auto border border-[#E5E5E1] bg-[#F9F9F7] text-center shadow-2xl">
        <img src="/pedido-confirmado.svg" alt="Pedido confirmado" loading="lazy" decoding="async" className="h-[220px] w-full shrink-0 object-cover" />
        <div className="px-6 py-7">
          <p className="section-label text-[#0047FF]">ALTITUDE / gracias</p>
          <h2 id="order-confirmed-title" className="editorial-title mt-2 text-[27px] font-bold uppercase">Pedido confirmado</h2>
          <p className="mt-3 text-[12px] leading-[1.5] text-[#6B6B66]">Recibimos tu solicitud, {customer.name.split(' ')[0]}. Tu pedido fue enviado a WhatsApp y te escribimos para coordinar la entrega.</p>
          <button data-testid="button-close-confirmation" onClick={onClose} className="mt-5 w-full border border-[#0A0A0A] py-3 text-[10px] font-bold uppercase tracking-[.1em] transition-colors hover:bg-[#0A0A0A] hover:text-white">Volver a la tienda</button>
        </div>
      </div>
    </div>
  </div>;
}

export function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { cartItems, clearCart } = useShop();
  const [confirmedCustomer, setConfirmedCustomer] = useState<CustomerData | null>(null);
  const total = cartItems.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
  const handleOrderConfirm = (customer: CustomerData, message: string) => {
    openOrderWhatsApp(message);
    setConfirmedCustomer(customer);
  };

  if (cartItems.length === 0) {
    return <div className="page-shell flex min-h-[100dvh] flex-col items-center justify-center bg-[#F9F9F7] px-5 text-center">
      <ShoppingBag size={30} className="text-[#0047FF]" />
      <p className="section-label mt-4 text-[#0047FF]">Tu bolsa está vacía</p>
      <h1 className="editorial-title mt-2 text-[28px] font-bold uppercase">Añade un producto para continuar</h1>
      <button onClick={() => setLocation('/products')} className="mt-6 bg-[#0A0A0A] px-5 py-4 text-[10px] font-bold uppercase tracking-[.1em] text-white">Ver productos</button>
    </div>;
  }

  return <div className="checkout-page page-shell min-h-[100dvh] bg-[#F9F9F7] px-5 pb-4 pt-2 text-[#0A0A0A] md:px-10 md:pb-7 md:pt-6">
    <header className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
      <button aria-label="Volver a la tienda" onClick={() => setLocation('/products')} className="flex min-h-11 items-center gap-2 whitespace-nowrap text-[12px] font-extrabold uppercase tracking-[.08em] text-[#0A0A0A] transition-colors hover:text-[#0047FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]">
        <ArrowLeft size={20} strokeWidth={2.2} /> <span>Volver a la tienda</span>
      </button>
      <span className="altitude-wordmark text-[25px]">ALTITUDE online</span>
    </header>
    <main className="mx-auto max-w-[560px] py-2 md:py-8">
      <p className="section-label text-[#0047FF]">ALTITUDE / checkout</p>
      <h1 className="editorial-title mt-1 text-[clamp(2.2rem,6vw,4rem)] font-bold uppercase leading-[.9]">Confirma tu pedido</h1>
      <p className="ck-lede mt-2 max-w-[420px] text-[12px] leading-[1.35] text-[#6B6B66]">Revisa tu selección y completa tus datos para coordinar la entrega en Bolivia.</p>
      <ul className="ck-assurance" aria-label="Beneficios de tu compra">
        <li><Truck size={15} aria-hidden="true" /><span>Envíos a todo el país</span></li>
        <li><MessageCircle size={15} aria-hidden="true" /><span>Confirmación por WhatsApp</span></li>
        <li><CheckCircle2 size={15} aria-hidden="true" /><span>Marcas originales</span></li>
      </ul>
      <OrderForm cartItems={cartItems} total={total} onConfirm={handleOrderConfirm} />
    </main>
    {confirmedCustomer && <OrderConfirmed customer={confirmedCustomer} onClose={() => { clearCart(); setConfirmedCustomer(null); setLocation('/products'); }} />}
  </div>;
}
