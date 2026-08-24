import { ArrowRight } from 'lucide-react';

const vipWhatsAppUrl = 'https://wa.me/59170000000';

function VipHero() {
  return (
    <main className="vip-hero-page">
      <section className="vip-hero" aria-label="ALTITUDE VIP Early Access">
        <img
          src="/vip-hero-reference.jpg"
          alt="ALTITUDE VIP Early Access"
          className="vip-hero-image"
          width={720}
          height={1600}
          fetchPriority="high"
        />
        <button
          type="button"
          data-testid="button-enter-vip"
          aria-label="Entrar al grupo VIP por WhatsApp"
          onClick={() => window.open(vipWhatsAppUrl, '_blank', 'noopener,noreferrer')}
          className="vip-hero-cta"
        >
          <span>Entrar al VIP</span>
          <ArrowRight size={22} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </section>
    </main>
  );
}

export default VipHero;