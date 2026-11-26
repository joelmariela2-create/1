const amountFormatter = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 });

/** Precio de tienda con precisión monoespaciada: "730 BS". */
export const formatBs = (value: number) => `${amountFormatter.format(value)} BS`;
