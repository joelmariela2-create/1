import type { CSSProperties } from 'react';

type VisualProduct = { id: string };

const productCardImageZoom: Record<string, number> = {
  // These source photos include noticeably more empty background than the
  // Golds Gym reference image, so the garment needs a little more presence.
  'youngla-polera-nocturnal-premium': 1.35,
  'youngla-shonen-premium': 1.12,
  'youngla-polera-calavera-premium': 1.04,
};

export const getProductCardImageStyle = (product: VisualProduct) => ({
  '--product-card-image-zoom': productCardImageZoom[product.id] ?? 1,
  '--product-card-image-offset-y': product.id === 'youngla-polera-calavera-premium' ? '-10px' : '0px',
} as CSSProperties);

export const getProductCardImageFit = (product: VisualProduct) =>
  product.id.includes('tom-and-jerry') || product.id === 'youngla-darc-premium-loco'
    ? 'object-contain'
    : 'object-cover';
