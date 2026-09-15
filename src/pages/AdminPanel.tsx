import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Archive, BarChart3, Boxes, ChevronLeft, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings, ShieldCheck, Users, X } from 'lucide-react'
import { adminApi, AdminProduct } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const nav = [
  ['Dashboard', '/admin', LayoutDashboard],
  ['Products', '/admin/products', Package],
  ['Orders', '/admin/orders', Boxes],
  ['Artisans', '/admin/artisans', Users],
  ['Inventory', '/admin/inventory', BarChart3],
  ['Settings', '/admin/settings', Settings],
] as const

function Shell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) navigate('/admin/login', { replace: true })
  }, [isLoading, navigate, user])
  if (isLoading || !user || user.role !== 'admin') return <div className="min-h-screen bg-obsidian" />
  return <div className="min-h-screen bg-obsidian text-ivory">
    <button onClick={() => setOpen(!open)} className="fixed left-5 top-5 z-40 rounded-full border border-ivory/10 bg-elevated p-3 lg:hidden" aria-label="Open admin menu">{open ? <X size={18} /> : <Menu size={18} />}</button>
    <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-72 border-r border-ivory/10 bg-elevated p-6 transition-transform lg:translate-x-0`}>
      <div className="flex items-center gap-3 border-b border-ivory/10 pb-8"><ShieldCheck className="text-gold" size={22} /><span className="text-xs tracking-[0.25em]">KALAA / ADMIN</span></div>
      <nav className="mt-8 space-y-2">{nav.map(([label, href, Icon]) => <Link onClick={() => setOpen(false)} key={label} to={href} className="flex items-center gap-3 px-4 py-3 text-sm text-muted transition-colors hover:bg-hover hover:text-gold"><Icon size={17} />{label}</Link>)}</nav>
      <button onClick={() => { logout(); navigate('/admin/login') }} className="absolute bottom-8 left-6 flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-gold"><LogOut size={17} />Logout</button>
    </aside>
    <main className="lg:pl-72"><div className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-10 lg:pt-12">{children}</div></main>
  </div>
}

function Stat({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <div className="border border-ivory/10 bg-elevated p-6"><p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p><p className="mt-4 font-display text-4xl text-ivory">{value}</p>{detail && <p className="mt-2 text-xs text-gold">{detail}</p>}</div>
}

function DashboardHome() {
  const [data, setData] = useState<any>()
  const [products, setProducts] = useState<AdminProduct[]>([])
  useEffect(() => { Promise.all([adminApi.dashboard(), adminApi.products()]).then(([dashboard, catalogue]) => { setData(dashboard); setProducts(catalogue) }).catch(() => setData(null)) }, [])
  const metrics = data?.metrics || {}
  return <Shell><header className="mb-10"><p className="eyebrow">Overview</p><h1 className="mt-4 font-display text-5xl">Good evening, curator.</h1><p className="mt-3 text-muted">The living pulse of KALAA marketplace.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Total products" value={metrics.total_artworks ?? '—'} /><Stat label="Total orders" value={metrics.total_orders ?? metrics.total_sales ?? '—'} /><Stat label="Artisans" value={metrics.total_artisans ?? '—'} /><Stat label="Platform revenue" value={metrics.platform_revenue != null ? `₹${metrics.platform_revenue.toLocaleString()}` : '—'} /></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-3"><section className="border border-ivory/10 bg-elevated p-6 lg:col-span-2"><h2 className="font-display text-2xl">Recent orders</h2>{(data?.recent_orders || []).length === 0 ? <p className="mt-8 text-sm text-muted">No completed orders yet.</p> : data.recent_orders.map((order: any) => <div key={order.id} className="mt-5 flex justify-between border-b border-ivory/10 pb-4 text-sm"><span>{order.order_number}</span><span className="text-gold">₹{order.total_amount}</span></div>)}</section><section className="border border-ivory/10 bg-elevated p-6"><h2 className="font-display text-2xl">Attention</h2><div className="mt-6 space-y-4 text-sm"><div className="flex justify-between"><span className="text-muted">Pending verification</span><span className="text-gold">{metrics.pending_verification ?? '—'}</span></div><div className="flex justify-between"><span className="text-muted">Low stock</span><span className="text-gold">{products.filter(product => product.stock < 3).length}</span></div></div></section></div>
  </Shell>
}

const emptyProduct = { name: '', price: 0, category_id: undefined as number | undefined, description: '', tags: [] as string[], colors: [] as string[], sizes: [] as string[], stock: 0, featured: false, best_seller: false, artisan_id: '', status: 'draft' }

function ProductForm({ editId }: { editId?: string }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyProduct)
  const [artisans, setArtisans] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { Promise.all([adminApi.artisans(), adminApi.categories()]).then(([a, c]) => { setArtisans(a); setCategories(c) }); if (editId) adminApi.product(editId).then(product => setForm({ ...emptyProduct, ...product })) }, [editId])
  const update = (key: string, value: unknown) => setForm(current => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); try { const saved = editId ? await adminApi.updateProduct(editId, form) : await adminApi.createProduct(form as any); if (imageFile) await adminApi.uploadProductImage(saved.id, imageFile); navigate('/admin/products') } catch (err) { setError('Unable to save product. Check the fields and try again.') } }
  return <Shell><button onClick={() => navigate('/admin/products')} className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted hover:text-gold"><ChevronLeft size={15} />Products</button><header className="mb-8"><p className="eyebrow">{editId ? 'Edit catalogue' : 'New catalogue entry'}</p><h1 className="mt-4 font-display text-5xl">{editId ? 'Refine product' : 'Add a product'}</h1></header>{error && <p className="mb-6 border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}<form onSubmit={submit} className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><Field label="Product name" value={form.name} onChange={v => update('name', v)} required /><Field label="Description" value={form.description} onChange={v => update('description', v)} textarea /><div className="grid gap-6 sm:grid-cols-2"><Field label="Price (INR)" type="number" value={form.price} onChange={v => update('price', Number(v))} required /><Field label="Stock" type="number" value={form.stock} onChange={v => update('stock', Number(v))} required /></div><div className="grid gap-6 sm:grid-cols-2"><Select label="Artisan" value={form.artisan_id} options={artisans.map(a => [a.id, `${a.name} · ${a.status}`])} onChange={v => update('artisan_id', v)} required /><Select label="Category" value={String(form.category_id || '')} options={categories.map(c => [String(c.id), c.name])} onChange={v => update('category_id', v ? Number(v) : undefined)} /></div><Field label="Tags (comma separated)" value={form.tags.join(', ')} onChange={v => update('tags', v.split(',').map(s => s.trim()).filter(Boolean))} /><Field label="Colors (comma separated)" value={form.colors.join(', ')} onChange={v => update('colors', v.split(',').map(s => s.trim()).filter(Boolean))} /><Field label="Sizes (comma separated)" value={form.sizes.join(', ')} onChange={v => update('sizes', v.split(',').map(s => s.trim()).filter(Boolean))} /><label className="block text-[10px] uppercase tracking-[0.16em] text-muted">Product image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => setImageFile(e.target.files?.[0] || null)} className="mt-2 block w-full border border-dashed border-ivory/20 bg-elevated px-4 py-4 text-sm normal-case tracking-normal text-muted file:mr-4 file:border-0 file:bg-gold file:px-3 file:py-2 file:text-xs file:text-obsidian" /></label></div><aside className="h-fit space-y-6 border border-ivory/10 bg-elevated p-6"><Select label="Status" value={form.status} options={['draft', 'listed', 'verified', 'featured', 'archived'].map(v => [v, v])} onChange={v => update('status', v)} /><label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" checked={form.featured} onChange={e => update('featured', e.target.checked)} />Featured</label><label className="flex items-center gap-3 text-sm text-muted"><input type="checkbox" checked={form.best_seller} onChange={e => update('best_seller', e.target.checked)} />Best seller</label><button className="w-full bg-gold px-5 py-4 text-[10px] font-semibold tracking-[0.2em] text-obsidian">{editId ? 'SAVE CHANGES' : 'CREATE PRODUCT'}</button></aside></form></Shell>
}

function Field({ label, value, onChange, textarea = false, type = 'text', required = false }: { label: string; value: string | number; onChange: (value: string) => void; textarea?: boolean; type?: string; required?: boolean }) {
  const Component = textarea ? 'textarea' : 'input'
  return <label className="block text-[10px] uppercase tracking-[0.16em] text-muted">{label}<Component required={required} type={textarea ? undefined : type} value={value} onChange={e => onChange(e.target.value)} className="mt-2 min-h-12 w-full border border-ivory/10 bg-elevated px-4 py-3 text-sm normal-case tracking-normal text-ivory outline-none focus:border-gold" /></label>
}
function Select({ label, value, options, onChange, required = false }: { label: string; value: string; options: string[][]; onChange: (value: string) => void; required?: boolean }) {
  return <label className="block text-[10px] uppercase tracking-[0.16em] text-muted">{label}<select required={required} value={value} onChange={e => onChange(e.target.value)} className="mt-2 w-full border border-ivory/10 bg-elevated px-4 py-3 text-sm normal-case tracking-normal text-ivory outline-none focus:border-gold"><option value="">Select</option>{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
}

function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const load = () => adminApi.products({ search: query, ...(status ? { status_filter: status } : {}) }).then(setProducts)
  useEffect(load, [status])
  return <Shell><header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Operations / {window.location.pathname === '/admin/inventory' ? 'Inventory' : 'Catalogue'}</p><h1 className="mt-4 font-display text-5xl">{window.location.pathname === '/admin/inventory' ? 'Inventory' : 'Products'}</h1></div><button onClick={() => navigate('/admin/products/new')} className="flex items-center justify-center gap-2 bg-gold px-5 py-3 font-mono text-[10px] font-semibold tracking-[0.15em] text-obsidian"><Plus size={15} /> Create artwork</button></header><div className="mb-6 flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center border border-ivory/10 bg-elevated px-4"><Search size={16} className="text-muted" /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search products..." className="w-full bg-transparent px-3 py-3 text-sm text-ivory outline-none" /></div><select value={status} onChange={e => setStatus(e.target.value)} className="border border-ivory/10 bg-elevated px-4 py-3 text-sm text-ivory"><option value="">All statuses</option>{['draft', 'listed', 'verified', 'featured', 'archived'].map(s => <option key={s}>{s}</option>)}</select></div><div className="overflow-x-auto border border-ivory/10 bg-elevated"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-ivory/10 font-mono text-[10px] uppercase tracking-[0.15em] text-muted"><tr><th className="p-5">Product</th><th>Artisan</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Provenance</th><th className="p-5 text-right">Actions</th></tr></thead><tbody>{products.map(product => <tr key={product.id} className="border-b border-ivory/10 last:border-0"><td className="p-5"><div className="flex items-center gap-4">{product.image ? <img src={product.image} className="h-12 w-12 object-cover" alt="" /> : <div className="h-12 w-12 bg-secondary" />}<div><p>{product.name}</p><p className="mt-1 font-mono text-[10px] text-muted">{product.id}</p></div></div></td><td className="text-muted">{product.artisan || 'Unassigned'}</td><td className="text-muted">{product.category || '—'}</td><td>₹{product.price.toLocaleString()}</td><td className={product.stock < 3 ? 'text-gold' : 'text-muted'}>{product.stock} {product.stock < 1 ? ' / OUT OF STOCK' : product.stock < 3 ? ' / LOW STOCK' : ''}</td><td><span className="border border-gold/30 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-gold">{product.status}</span></td><td className="font-mono text-[10px] uppercase tracking-wider text-gold">{product.status === 'verified' ? 'Verified' : 'Pending'}</td><td className="p-5 text-right"><button onClick={() => navigate(`/admin/products/${product.id}/edit`)} className="mr-4 font-mono text-xs text-gold">Edit</button><button onClick={async () => { if (confirm('Archive this product?')) { await adminApi.archiveProduct(product.id); load() } }} className="text-xs text-muted hover:text-red-300"><Archive size={15} /></button></td></tr>)}</tbody></table>{products.length === 0 && <p className="p-12 text-center text-sm text-muted">No products found.</p>}</div></Shell>
}

function ResourceList({ type }: { type: 'orders' | 'artisans' }) {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => { (type === 'orders' ? adminApi.orders() : adminApi.artisans()).then(setItems) }, [type])
  return <Shell><p className="eyebrow">{type === 'orders' ? 'Commerce' : 'Community'}</p><h1 className="mb-8 mt-4 font-display text-5xl capitalize">{type}</h1><div className="border border-ivory/10 bg-elevated">{items.length === 0 ? <p className="p-12 text-sm text-muted">No {type} yet.</p> : items.map(item => <div key={item.id} className="flex flex-wrap justify-between gap-4 border-b border-ivory/10 p-5 text-sm last:border-0"><span>{item.order_number || item.name}</span><span className="text-muted">{item.status}</span><span className="text-gold">{item.total_amount != null ? `₹${item.total_amount}` : item.email}</span></div>)}</div></Shell>
}

export default function AdminPanel() {
  const { id } = useParams()
  const path = window.location.pathname
  if (path.endsWith('/new')) return <ProductForm />
  if (path.includes('/edit')) return <ProductForm editId={id} />
  if (path === '/admin/products' || path === '/admin/inventory') return <Products />
  if (path === '/admin/orders') return <ResourceList type="orders" />
  if (path === '/admin/artisans') return <ResourceList type="artisans" />
  return <DashboardHome />
}
