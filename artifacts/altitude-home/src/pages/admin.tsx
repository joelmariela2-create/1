import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  EyeOff,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  Truck,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  getGetAdminSummaryQueryKey,
  getListOrdersQueryKey,
  getListProductsQueryKey,
  useCreateProduct,
  useDeleteProduct,
  useGetAdminSummary,
  useListOrders,
  useListProducts,
  useRequestUploadUrl,
  useUpdateOrder,
  useUpdateProduct,
} from '@workspace/api-client-react';
import type { Order, OrderStatus, Product, ProductInput } from '@workspace/api-client-react';

const red = '#d83932';
const ink = '#171717';
const paper = '#f4f1ec';
const muted = '#77716b';
const categories = ['Compresión', 'Poleras', 'Hoodies', 'Joggers', 'Shorts', 'Accesorios'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const statuses: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

type ProductDraft = {
  name: string;
  price: string;
  description: string;
  category: string;
  stock: string;
  selectedSizes: string[];
  imageUrls: string[];
  featured: boolean;
  active: boolean;
};

const emptyDraft = (): ProductDraft => ({
  name: '',
  price: '',
  description: '',
  category: categories[0],
  stock: '0',
  selectedSizes: ['M'],
  imageUrls: [],
  featured: false,
  active: true,
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(amount).replace('BOB', 'Bs');

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'No pudimos completar la acción. Intenta de nuevo.';
};

function AdminSkeleton() {
  return (
    <div className="admin-skeleton" aria-label="Cargando panel">
      <div className="admin-skeleton-line wide" />
      <div className="admin-skeleton-grid">
        {Array.from({ length: 4 }).map((_, index) => <div className="admin-skeleton-card" key={index} />)}
      </div>
      <div className="admin-skeleton-table" />
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const item = statuses.find((entry) => entry.value === status) ?? statuses[0];
  return <span className={`admin-status status-${status}`} data-testid={`status-order-${status}`}>{item.label}</span>;
}

function AdminSidebar({ current, onClose }: { current: 'dashboard' | 'products' | 'orders'; onClose?: () => void }) {
  const [, setLocation] = useLocation();
  const links = [
    { id: 'dashboard' as const, label: 'Resumen', icon: LayoutDashboard, href: '/admin' },
    { id: 'products' as const, label: 'Productos', icon: Package, href: '/admin/products' },
    { id: 'orders' as const, label: 'Pedidos', icon: ShoppingBag, href: '/admin/orders' },
  ];
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <div className="admin-mark">
          <span className="admin-mark-dot" />
          <span className="admin-mark-word">ALTITUDE</span>
        </div>
        <span className="admin-private">PRIVATE OFFICE</span>
      </div>
      <nav className="admin-nav" aria-label="Navegación administrativa">
        <span className="admin-nav-label">Workspace</span>
        {links.map(({ id, label, icon: Icon, href }) => (
          <button
            key={id}
            type="button"
            data-testid={`button-nav-${id}`}
            className={`admin-nav-item ${current === id ? 'is-active' : ''}`}
            onClick={() => { setLocation(href); onClose?.(); }}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
            {current === id && <span className="admin-nav-active-bar" />}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <div className="admin-signal"><Activity size={15} /><span>Datos en vivo</span><i /></div>
        <button type="button" className="admin-store-link" data-testid="button-back-store" onClick={() => setLocation('/')}>
          Ver tienda <ArrowUpRight size={14} />
        </button>
      </div>
    </aside>
  );
}

function AdminHeader({
  title,
  eyebrow,
  onMenu,
  onRefresh,
  refreshing,
  onSignOut,
}: {
  title: string;
  eyebrow: string;
  onMenu: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onSignOut: () => void;
}) {
  return (
    <header className="admin-header">
      <button className="admin-mobile-menu" type="button" data-testid="button-open-admin-menu" onClick={onMenu} aria-label="Abrir menú"><Menu size={21} /></button>
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1 data-testid="heading-admin-page">{title}</h1>
      </div>
      <div className="admin-header-actions">
        <button type="button" className="admin-icon-button" data-testid="button-refresh-admin" onClick={onRefresh} aria-label="Actualizar datos">
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
        </button>
        <div className="admin-user-chip"><span className="admin-avatar">A</span><span className="admin-user-name">Owner</span></div>
        <button type="button" className="admin-logout" data-testid="button-admin-logout" onClick={onSignOut}><LogOut size={15} /> Salir</button>
      </div>
    </header>
  );
}

function MetricCard({ label, value, note, icon: Icon, accent }: { label: string; value: string; note: string; icon: typeof Package; accent?: boolean }) {
  return (
    <article className={`admin-metric ${accent ? 'is-accent' : ''}`} data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="admin-metric-head"><span>{label}</span><Icon size={17} strokeWidth={1.7} /></div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="admin-empty" data-testid="empty-admin-state">
      <div className="admin-empty-icon"><Package size={23} strokeWidth={1.5} /></div>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}

function AccessDenied() {
  const [, setLocation] = useLocation();
  return (
    <main className="admin-access-denied">
      <div className="admin-denied-symbol"><ShieldAlert size={34} strokeWidth={1.4} /></div>
      <p className="admin-eyebrow">ALTITUDE / Private office</p>
      <h1>Acceso reservado<br /><em>al dueño.</em></h1>
      <p className="admin-denied-copy">Tu cuenta está autenticada, pero no tiene permisos para operar el catálogo ni los pedidos.</p>
      <button type="button" data-testid="button-denied-store" className="admin-primary-button" onClick={() => setLocation('/')}>Volver a la tienda <ArrowUpRight size={16} /></button>
    </main>
  );
}

function ProductEditor({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ProductDraft>(() => product ? {
    name: product.name,
    price: String(product.price),
    description: product.description ?? '',
    category: product.category,
    stock: String(product.stock),
    selectedSizes: product.sizes ?? [],
    imageUrls: product.imageUrls?.length ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []),
    featured: product.featured,
    active: product.active,
  } : emptyDraft());
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const uploadUrl = useRequestUploadUrl();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const updateDraft = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const toggleSize = (size: string) => updateDraft('selectedSizes', draft.selectedSizes.includes(size) ? draft.selectedSizes.filter((item) => item !== size) : [...draft.selectedSizes, size]);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setFormError('');
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const response = await uploadUrl.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type || 'image/jpeg' } });
        const put = await fetch(response.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type || 'image/jpeg' }, body: file });
        if (!put.ok) throw new Error('La imagen no pudo subirse.');
        uploaded.push(`/api/storage${response.objectPath}`);
      }
      updateDraft('imageUrls', [...draft.imageUrls, ...uploaded]);
      setNotice(`${uploaded.length} imagen${uploaded.length > 1 ? 'es' : ''} lista${uploaded.length > 1 ? 's' : ''} para guardar.`);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!draft.name.trim() || !draft.category || draft.selectedSizes.length === 0) {
      setFormError('Completa nombre, categoría y al menos una talla.');
      return;
    }
    const payload: ProductInput = {
      name: draft.name.trim(),
      price: Number(draft.price) || 0,
      description: draft.description.trim() || null,
      category: draft.category,
      imageUrl: draft.imageUrls[0] ?? null,
      imageUrls: draft.imageUrls,
      sizes: draft.selectedSizes,
      stock: Math.max(0, Number(draft.stock) || 0),
      featured: draft.featured,
      active: draft.active,
    };
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
      setNotice(product ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      window.setTimeout(onSaved, 480);
    };
    if (product) updateProduct.mutate({ id: product.id, data: payload }, { onSuccess, onError: (error) => setFormError(getErrorMessage(error)) });
    else createProduct.mutate({ data: payload }, { onSuccess, onError: (error) => setFormError(getErrorMessage(error)) });
  };
  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="editor-heading">
        <div className="admin-editor-top">
          <div><p className="admin-eyebrow">Catálogo / {product ? `SKU ${product.id}` : 'Nuevo registro'}</p><h2 id="editor-heading">{product ? 'Editar producto' : 'Añadir producto'}</h2></div>
          <button type="button" className="admin-close" data-testid="button-close-product-editor" onClick={onClose} aria-label="Cerrar editor"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="admin-product-form">
          <div className="admin-form-main">
            <div className="admin-form-section">
              <div className="admin-section-title"><span>01</span><div><h3>Información esencial</h3><p>Lo que verá tu cliente en la tienda.</p></div></div>
              <label className="admin-field full"><span>Nombre del producto</span><input data-testid="input-product-name" value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} placeholder="Ej. Core Compression Tee" autoFocus /></label>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Precio <small>BOB</small></span><input data-testid="input-product-price" type="number" min="0" step="1" value={draft.price} onChange={(event) => updateDraft('price', event.target.value)} placeholder="0" /></label>
                <label className="admin-field"><span>Categoría</span><select data-testid="select-product-category" value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              </div>
              <label className="admin-field full"><span>Descripción</span><textarea data-testid="textarea-product-description" value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} placeholder="Una descripción breve, útil y concreta." rows={4} /></label>
            </div>
            <div className="admin-form-section">
              <div className="admin-section-title"><span>02</span><div><h3>Inventario</h3><p>Controla disponibilidad por talla.</p></div></div>
              <label className="admin-field"><span>Stock total</span><input data-testid="input-product-stock" type="number" min="0" step="1" value={draft.stock} onChange={(event) => updateDraft('stock', event.target.value)} /></label>
              <div className="admin-field"><span>Tallas disponibles</span><div className="admin-size-pills">{sizes.map((size) => <button type="button" key={size} data-testid={`button-size-${size}`} className={draft.selectedSizes.includes(size) ? 'selected' : ''} onClick={() => toggleSize(size)}>{size}</button>)}</div></div>
            </div>
            <div className="admin-form-section">
              <div className="admin-section-title"><span>03</span><div><h3>Visibilidad</h3><p>Decide cómo aparece en ALTITUDE.</p></div></div>
              <div className="admin-toggle-row"><div><strong>Visible en la tienda</strong><small>Los clientes pueden encontrarlo y comprarlo.</small></div><button type="button" data-testid="button-toggle-product-active" className={`admin-switch ${draft.active ? 'on' : ''}`} onClick={() => updateDraft('active', !draft.active)} aria-label="Cambiar visibilidad"><i /></button></div>
              <div className="admin-toggle-row"><div><strong>Producto destacado</strong><small>Aparece en selecciones editoriales de inicio.</small></div><button type="button" data-testid="button-toggle-product-featured" className={`admin-switch ${draft.featured ? 'on' : ''}`} onClick={() => updateDraft('featured', !draft.featured)} aria-label="Cambiar destacado"><i /></button></div>
            </div>
          </div>
          <div className="admin-form-media">
            <div className="admin-form-section media-section">
              <div className="admin-section-title"><span>04</span><div><h3>Imágenes</h3><p>Primera imagen = portada.</p></div></div>
              <label className="admin-upload-zone" data-testid="label-upload-product-images">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} disabled={uploading} />
                <span className="admin-upload-icon">{uploading ? <RefreshCw className="spin" size={22} /> : <UploadCloud size={22} />}</span>
                <strong>{uploading ? 'Subiendo imágenes…' : 'Subir imágenes'}</strong>
                <small>JPG, PNG o WEBP · hasta 10 MB</small>
              </label>
              <div className="admin-media-grid">
                {draft.imageUrls.map((url, index) => <div className="admin-media-thumb" key={`${url}-${index}`}><img src={url} alt={`Vista ${index + 1} de ${draft.name || 'producto'}`} /><span>{index === 0 ? 'Portada' : `${index + 1}`}</span><button type="button" data-testid={`button-remove-image-${index}`} onClick={() => updateDraft('imageUrls', draft.imageUrls.filter((_, imageIndex) => imageIndex !== index))} aria-label={`Eliminar imagen ${index + 1}`}><X size={13} /></button></div>)}
              </div>
              {!draft.imageUrls.length && <div className="admin-media-empty"><ImagePlus size={18} /><span>Aún no hay imágenes</span></div>}
            </div>
            <div className="admin-editor-note"><Check size={15} /><span>Los cambios se publican cuando guardas. Puedes volver a editar este producto en cualquier momento.</span></div>
          </div>
          {formError && <div className="admin-form-error"><AlertCircle size={16} /> {formError}</div>}
          {notice && !formError && <div className="admin-form-success"><Check size={16} /> {notice}</div>}
          <div className="admin-editor-actions"><button type="button" className="admin-ghost-button" data-testid="button-cancel-product" onClick={onClose}>Cancelar</button><button type="submit" className="admin-primary-button" data-testid="button-save-product" disabled={saving || uploading}>{saving ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear producto'}<ChevronRight size={16} /></button></div>
        </form>
      </section>
    </div>
  );
}

function DashboardView({ products, orders, summary, onProducts, onOrders }: { products: Product[]; orders: Order[]; summary?: { productCount: number; lowStockCount: number; orderCount: number; pendingOrderCount: number; revenue: number }; onProducts: () => void; onOrders: () => void }) {
  const latestOrders = orders.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);
  return (
    <>
      <section className="admin-welcome"><div><p className="admin-eyebrow">Lunes, operación ALTITUDE</p><h2>Todo bajo control<span>.</span></h2><p className="admin-welcome-copy">Una lectura rápida de tu tienda para decidir qué sigue.</p></div><div className="admin-welcome-stamp"><span>ALT / 001</span><small>Owner workspace</small></div></section>
      <section className="admin-metrics">
        <MetricCard label="Productos" value={String(summary?.productCount ?? products.length)} note="en catálogo" icon={Package} />
        <MetricCard label="Stock bajo" value={String(summary?.lowStockCount ?? products.filter((product) => product.stock <= 5).length)} note="requieren atención" icon={AlertCircle} accent />
        <MetricCard label="Pedidos" value={String(summary?.orderCount ?? orders.length)} note="histórico total" icon={ShoppingBag} />
        <MetricCard label="Ingresos" value={formatCurrency(summary?.revenue ?? orders.reduce((total, order) => total + order.total, 0))} note="acumulado registrado" icon={CircleDollarSign} />
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-order-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Últimos movimientos</p><h3>Pedidos recientes</h3></div><button type="button" data-testid="button-view-all-orders" onClick={onOrders}>Ver todos <ArrowUpRight size={14} /></button></div>{latestOrders.length ? <div className="admin-recent-list">{latestOrders.map((order) => <div className="admin-recent-order" key={order.id} data-testid={`row-recent-order-${order.id}`}><span className="admin-order-number">#{String(order.id).padStart(4, '0')}</span><div className="admin-order-customer"><strong>{order.customerName}</strong><small>{order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'} · {formatDate(order.createdAt)}</small></div><StatusPill status={order.status} /><strong className="admin-order-total">{formatCurrency(order.total)}</strong></div>)}</div> : <EmptyState title="Aún no hay pedidos" detail="Cuando llegue tu primera venta aparecerá aquí." />}</section>
        <section className="admin-panel admin-stock-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Inventario</p><h3>Atención necesaria</h3></div><button type="button" data-testid="button-view-all-products" onClick={onProducts}>Gestionar <ArrowUpRight size={14} /></button></div><div className="admin-stock-summary"><div className="stock-summary-number"><strong>{summary?.lowStockCount ?? products.filter((product) => product.stock <= 5).length}</strong><span>productos con<br />stock bajo</span></div><div className="stock-bar"><i style={{ width: `${Math.min(100, Math.max(8, (products.filter((product) => product.stock <= 5).length / Math.max(products.length, 1)) * 100))}%` }} /></div></div><div className="admin-stock-list">{products.filter((product) => product.stock <= 5).slice(0, 4).map((product) => <div key={product.id} className="admin-stock-row"><div className="admin-stock-image">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <Package size={15} />}</div><span>{product.name}</span><strong className={product.stock === 0 ? 'out' : ''}>{product.stock === 0 ? 'Agotado' : `${product.stock} uds.`}</strong></div>)}{products.filter((product) => product.stock <= 5).length === 0 && <p className="admin-all-good"><Check size={15} /> El inventario está saludable.</p>}</div></section>
      </div>
    </>
  );
}

function ProductsView({ products, onEdit, onCreate, onDelete }: { products: Product[]; onEdit: (product: Product) => void; onCreate: () => void; onDelete: (product: Product) => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'low'>('all');
  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'active' ? product.active : product.stock <= 5);
    return matchesSearch && matchesFilter;
  }), [products, search, filter]);
  return (
    <section className="admin-list-page">
      <div className="admin-list-toolbar"><div className="admin-search"><Search size={16} /><input data-testid="input-search-products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar producto o categoría" /><kbd>⌘ K</kbd></div><button type="button" data-testid="button-add-product" className="admin-primary-button" onClick={onCreate}><Plus size={17} /> Añadir producto</button></div>
      <div className="admin-filter-tabs">{[['all', 'Todos'], ['active', 'Visibles'], ['low', 'Stock bajo']].map(([value, label]) => <button type="button" key={value} data-testid={`button-filter-products-${value}`} className={filter === value ? 'active' : ''} onClick={() => setFilter(value as typeof filter)}>{label}<span>{value === 'all' ? products.length : value === 'active' ? products.filter((product) => product.active).length : products.filter((product) => product.stock <= 5).length}</span></button>)}</div>
      <div className="admin-table-wrap">{filtered.length ? <table className="admin-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Destacado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id} data-testid={`row-product-${product.id}`}><td><div className="admin-product-cell"><div className="admin-product-image">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <Package size={18} />}</div><div><strong>{product.name}</strong><small>ID / {product.id}</small></div></div></td><td><span className="admin-category">{product.category}</span></td><td><strong>{formatCurrency(product.price)}</strong></td><td><strong className={product.stock <= 5 ? 'stock-warning' : ''}>{product.stock}</strong></td><td><span className={`admin-visibility ${product.active ? 'visible' : 'hidden'}`}>{product.active ? <Eye size={13} /> : <EyeOff size={13} />}{product.active ? 'Visible' : 'Oculto'}</span></td><td>{product.featured ? <span className="admin-featured">FEATURED</span> : <span className="admin-muted-dash">—</span>}</td><td><div className="admin-row-actions"><button type="button" data-testid={`button-edit-product-${product.id}`} onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`}><Pencil size={15} /></button><button type="button" data-testid={`button-delete-product-${product.id}`} onClick={() => onDelete(product)} aria-label={`Eliminar ${product.name}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table> : <EmptyState title={search ? 'Sin coincidencias' : 'Catálogo vacío'} detail={search ? 'Prueba otra búsqueda o limpia el filtro.' : 'Añade tu primera prenda para comenzar a operar.'} action={!search ? <button type="button" className="admin-primary-button" data-testid="button-empty-add-product" onClick={onCreate}><Plus size={16} /> Añadir producto</button> : undefined} />}</div>
    </section>
  );
}

function OrdersView({ orders, onUpdate }: { orders: Order[]; onUpdate: (order: Order, status: OrderStatus) => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const filtered = useMemo(() => orders.filter((order) => {
    const matchesSearch = `${order.id} ${order.customerName} ${order.city} ${order.address ?? ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === 'all' || order.status === filter);
  }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [orders, search, filter]);
  return (
    <section className="admin-list-page">
      <div className="admin-list-toolbar"><div className="admin-search"><Search size={16} /><input data-testid="input-search-orders" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por cliente, ciudad, domicilio o pedido" /></div><div className="admin-orders-count"><Truck size={16} /> {orders.length} pedidos en total</div></div>
      <div className="admin-filter-tabs order-filters">{[['all', 'Todos'], ...statuses.map((status) => [status.value, status.label])].map(([value, label]) => <button type="button" key={value} data-testid={`button-filter-orders-${value}`} className={filter === value ? 'active' : ''} onClick={() => setFilter(value as OrderStatus | 'all')}>{label}<span>{value === 'all' ? orders.length : orders.filter((order) => order.status === value).length}</span></button>)}</div>
      <div className="admin-table-wrap">{filtered.length ? <table className="admin-table orders-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Entrega</th><th>Artículos</th><th>Total</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} data-testid={`row-order-${order.id}`}><td><strong className="admin-order-id">#{String(order.id).padStart(4, '0')}</strong><small className="admin-table-sub">{formatDate(order.createdAt)}</small></td><td><strong>{order.customerName}</strong><small className="admin-table-sub">{order.phone}</small></td><td><span>{order.city}</span><small className="admin-table-sub">{order.address || 'Domicilio no registrado'}</small><small className="admin-table-sub">{order.country}</small></td><td><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades</span></td><td><strong>{formatCurrency(order.total)}</strong></td><td><select data-testid={`select-order-status-${order.id}`} value={order.status} onChange={(event) => onUpdate(order, event.target.value as OrderStatus)}>{statuses.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}</select></td><td><button type="button" className="admin-more" data-testid={`button-order-details-${order.id}`} aria-label={`Ver pedido ${order.id}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table> : <EmptyState title="No hay pedidos para mostrar" detail={search ? 'Prueba otra búsqueda o cambia el estado.' : 'Los nuevos pedidos aparecerán aquí.'} />}</div>
    </section>
  );
}

export default function AdminPage({ section = 'dashboard', onSignOut }: { section?: 'dashboard' | 'products' | 'orders'; onSignOut: () => void }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editor, setEditor] = useState<Product | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [toast, setToast] = useState('');
  const productsQuery = useListProducts(undefined, { query: { queryKey: getListProductsQueryKey(), refetchOnMount: 'always', refetchInterval: 60000 } });
  const ordersQuery = useListOrders({ query: { queryKey: getListOrdersQueryKey(), refetchOnMount: 'always', refetchInterval: 60000 } });
  const summaryQuery = useGetAdminSummary({ query: { queryKey: getGetAdminSummaryQueryKey(), refetchOnMount: 'always', refetchInterval: 60000 } });
  const deleteProduct = useDeleteProduct();
  const updateOrder = useUpdateOrder();
  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const unauthorized = [productsQuery.error, ordersQuery.error, summaryQuery.error].some((error) => error && typeof error === 'object' && 'status' in error && Number(error.status) === 403);

  useEffect(() => {
    if (toast) {
      const timeout = window.setTimeout(() => setToast(''), 3000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [toast]);

  if (unauthorized) return <AccessDenied />;
  if (productsQuery.isLoading || ordersQuery.isLoading || summaryQuery.isLoading) return <div className="admin-app"><AdminSkeleton /></div>;
  if (productsQuery.isError || ordersQuery.isError || summaryQuery.isError) {
    return <div className="admin-app"><div className="admin-error-state"><AlertCircle size={28} /><h2>No pudimos cargar el panel</h2><p>{getErrorMessage(productsQuery.error ?? ordersQuery.error ?? summaryQuery.error)}</p><button type="button" className="admin-primary-button" data-testid="button-retry-admin" onClick={() => { productsQuery.refetch(); ordersQuery.refetch(); summaryQuery.refetch(); }}>Intentar de nuevo <RefreshCw size={15} /></button></div></div>;
  }
  const refresh = () => { productsQuery.refetch(); ordersQuery.refetch(); summaryQuery.refetch(); };
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProduct.mutate({ id: deleteTarget.id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }); setDeleteTarget(null); setToast('Producto eliminado.'); },
      onError: (error) => setToast(getErrorMessage(error)),
    });
  };
  const handleOrderUpdate = (order: Order, status: OrderStatus) => {
    if (order.status === status) return;
    updateOrder.mutate({ id: order.id, data: { status } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }); setToast(`Pedido #${String(order.id).padStart(4, '0')} actualizado.`); },
      onError: (error) => setToast(getErrorMessage(error)),
    });
  };
  const titles = { dashboard: ['Resumen', 'Dashboard'], products: ['Productos', 'Catálogo'], orders: ['Pedidos', 'Operación'] };
  return (
    <div className="admin-app">
      <AdminSidebar current={section} onClose={() => setMobileMenu(false)} />
      {mobileMenu && <div className="admin-mobile-overlay" onClick={() => setMobileMenu(false)} />}
      <div className={`admin-main ${mobileMenu ? 'menu-open' : ''}`}>
        <AdminHeader title={titles[section][0]} eyebrow={titles[section][1]} onMenu={() => setMobileMenu(true)} onRefresh={refresh} refreshing={productsQuery.isFetching || ordersQuery.isFetching || summaryQuery.isFetching} onSignOut={onSignOut} />
        <main className="admin-content">
          {section === 'dashboard' && <DashboardView products={products} orders={orders} summary={summaryQuery.data} onProducts={() => setLocation('/admin/products')} onOrders={() => setLocation('/admin/orders')} />}
          {section === 'products' && <ProductsView products={products} onEdit={(product) => setEditor(product)} onCreate={() => setEditor(null)} onDelete={setDeleteTarget} />}
          {section === 'orders' && <OrdersView orders={orders} onUpdate={handleOrderUpdate} />}
        </main>
      </div>
      {editor !== undefined && <ProductEditor product={editor} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); setToast('Cambios guardados.'); }} />}
      {deleteTarget && <div className="admin-modal-backdrop" role="presentation"><section className="admin-confirm" role="dialog" aria-modal="true" aria-labelledby="delete-heading"><div className="admin-confirm-icon"><Trash2 size={21} /></div><p className="admin-eyebrow">Eliminar producto</p><h2 id="delete-heading">¿Quitar “{deleteTarget.name}”?</h2><p>Esta acción elimina el producto del catálogo. No podrás deshacerla.</p><div className="admin-confirm-actions"><button type="button" className="admin-ghost-button" data-testid="button-cancel-delete" onClick={() => setDeleteTarget(null)}>Cancelar</button><button type="button" className="admin-danger-button" data-testid="button-confirm-delete" onClick={handleDelete} disabled={deleteProduct.isPending}>{deleteProduct.isPending ? 'Eliminando…' : 'Sí, eliminar'}</button></div></section></div>}
      {toast && <div className="admin-toast" role="status" data-testid="status-admin-toast"><Check size={16} /> {toast}</div>}
    </div>
  );
}
