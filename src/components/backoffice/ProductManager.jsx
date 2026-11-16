import { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Eye,
    EyeOff,
    Sparkles,
    AlertCircle,
    Search
} from 'lucide-react';
import { productsApi } from '@/api';
import { CLINICAL_PRODUCTS } from '@/data/clinicalProducts';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const emptyForm = {
        name: '',
        category: 'face',
        price: '48.00',
        shade_name: '',
        shade_hex: '#6B3B24',
        undertone: 'neutral',
        depth: 5,
        finish: 'Luminous Veil',
        badge: '',
        image_url: '/images/products/flagship-skin-tint.jpg',
        formula_notes: '',
        active: true,
    };

    const [form, setForm] = useState(emptyForm);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await productsApi.getAll(true);
            if (Array.isArray(data) && data.length > 0) {
                setProducts(data);
            } else {
                setProducts(CLINICAL_PRODUCTS);
            }
        } catch {
            setProducts(CLINICAL_PRODUCTS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 4000);
    };

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const handleOpenEdit = (prod) => {
        setEditingProduct(prod);
        setForm({
            name: prod.name,
            category: prod.category,
            price: prod.price,
            shade_name: prod.shade_name,
            shade_hex: prod.shade_hex || '#000000',
            undertone: prod.undertone || 'neutral',
            depth: prod.depth || 5,
            finish: prod.finish || '',
            badge: prod.badge || '',
            image_url: prod.image_url || '',
            formula_notes: Array.isArray(prod.formula_notes) ? prod.formula_notes.join(', ') : '',
            active: prod.active !== false,
        });
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const payload = {
            ...form,
            price: parseFloat(form.price),
            depth: parseInt(form.depth, 10),
            formula_notes: typeof form.formula_notes === 'string'
                ? form.formula_notes.split(',').map((s) => s.trim()).filter(Boolean)
                : form.formula_notes,
        };

        try {
            if (editingProduct) {
                const updated = await productsApi.update(editingProduct.id, payload);
                setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updated } : p)));
                showSuccess(`Updated ${payload.name}`);
            } else {
                const created = await productsApi.create(payload);
                setProducts((prev) => [created, ...prev]);
                showSuccess(`Created ${payload.name}`);
            }
            setModalOpen(false);
        } catch (err) {
            showError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save product');
        }
    };

    const handleToggleActive = async (prod) => {
        const nextState = !prod.active;
        setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, active: nextState } : p)));
        try {
            await productsApi.update(prod.id, { active: nextState });
            showSuccess(`${prod.name} ${nextState ? 'activated' : 'deactivated'}`);
        } catch {
            showError('Failed to update product status');
            loadProducts();
        }
    };

    const handleDelete = async (prod) => {
        if (!window.confirm(`Delete "${prod.name} (${prod.shade_name})"? This cannot be undone.`)) return;

        try {
            await productsApi.delete(prod.id);
            setProducts((prev) => prev.filter((p) => p.id !== prod.id));
            showSuccess(`Deleted ${prod.name}`);
        } catch {
            showError('Failed to delete product from database');
        }
    };

    const filtered = products.filter((p) => {
        const matchSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.shade_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
        return matchSearch && matchCat;
    });

    return (
        <div className="glass-panel overflow-hidden rounded-2xl p-5">
            {/* Notification toasts */}
            {successMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2.5 text-xs text-emerald-300">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 px-4 py-2.5 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Header with Title & Action */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                <div>
                    <h3 className="font-display text-lg font-medium">Product & Shade Catalog Management</h3>
                    <p className="text-xs text-foreground/50">
                        Create, modify prices, configure clinical shades, or toggle active status
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-mono font-medium uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Product
                </button>
            </div>

            {/* Filter toolbar */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-foreground/40" />
                    <input
                        type="text"
                        placeholder="Search formulas or shades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border/50 bg-background/50 pl-8 pr-3 text-xs outline-none focus:border-primary font-mono placeholder:text-foreground/40"
                    />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['all', 'lips', 'face', 'cheeks', 'eyes'].map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategoryFilter(cat)}
                            className={`rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-all ${
                                categoryFilter === cat
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'glass-btn text-foreground/60'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Table */}
            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 text-foreground/50">
                        <tr>
                            <th className="py-3 px-3">Formula</th>
                            <th className="py-3 px-3">Category</th>
                            <th className="py-3 px-3">Shade & Undertone</th>
                            <th className="py-3 px-3">Price (USD / KES)</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-foreground/50">
                                    Loading products from database...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-foreground/50">
                                    No products matching your search.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((prod) => (
                                <tr key={prod.id} className="transition-colors hover:bg-white/[0.02]">
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg overflow-hidden bg-black/30 shrink-0 border border-white/10">
                                                <img
                                                    src={prod.image_url}
                                                    alt={prod.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/images/products/flagship-skin-tint.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-display text-xs font-medium text-foreground truncate">{prod.name}</p>
                                                <p className="font-mono text-[10px] text-foreground/50">{prod.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/75 px-2 py-0.5 rounded-full border border-border/40 bg-card/40">
                                            {prod.category}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-4 w-4 rounded-full ring-1 ring-white/50 shrink-0"
                                                style={{ backgroundColor: prod.shade_hex }}
                                                title={prod.shade_hex}
                                            />
                                            <div>
                                                <p className="text-foreground font-medium">{prod.shade_name}</p>
                                                <p className="text-[10px] text-foreground/50 font-mono">
                                                    {prod.undertone} · Depth {prod.depth || 5}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 font-mono">
                                        <span className="font-medium text-foreground">${parseFloat(prod.price).toFixed(2)}</span>
                                        <span className="block text-[10px] text-foreground/50">
                                            Ksh {Math.round(parseFloat(prod.price) * 130).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(prod)}
                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider transition-colors ${
                                                prod.active !== false
                                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                    : 'bg-white/10 text-foreground/40 border border-white/10'
                                            }`}
                                        >
                                            {prod.active !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                            {prod.active !== false ? 'Active' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(prod)}
                                                className="glass-btn grid h-7 w-7 place-items-center rounded-full text-foreground/75 hover:text-foreground hover:border-primary/50"
                                                title="Edit product"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(prod)}
                                                className="glass-btn grid h-7 w-7 place-items-center rounded-full text-rose-400/80 hover:text-rose-400 hover:border-rose-500/50"
                                                title="Delete product"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-solid relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="font-display text-xl font-medium">
                                {editingProduct ? `Edit ${editingProduct.name}` : 'Create New Formulation'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="glass-btn grid h-8 w-8 place-items-center rounded-full text-foreground/70 hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-mono block text-foreground/70 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Sylvia Velvet Lip Contour"
                                        className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="label-mono block text-foreground/70 mb-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary"
                                    >
                                        <option value="face">Face</option>
                                        <option value="lips">Lips</option>
                                        <option value="cheeks">Cheeks</option>
                                        <option value="eyes">Eyes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="label-mono block text-foreground/70 mb-1">Price (USD)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="label-mono block text-foreground/70 mb-1">Shade Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.shade_name}
                                        onChange={(e) => setForm({ ...form, shade_name: e.target.value })}
                                        placeholder="e.g. Shade 08 Deep Cocoa"
                                        className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="label-mono block text-foreground/70 mb-1">Shade Hex Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={form.shade_hex}
                                            onChange={(e) => setForm({ ...form, shade_hex: e.target.value })}
                                            className="h-10 w-12 cursor-pointer rounded-xl border border-border/60 bg-transparent p-1"
                                        />
                                        <input
                                            type="text"
                                            value={form.shade_hex}
                                            onChange={(e) => setForm({ ...form, shade_hex: e.target.value })}
                                            className="h-10 flex-1 rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="label-mono block text-foreground/70 mb-1">Undertone</label>
                                    <select
                                        value={form.undertone}
                                        onChange={(e) => setForm({ ...form, undertone: e.target.value })}
                                        className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary"
                                    >
                                        <option value="cool">Cool</option>
                                        <option value="neutral">Neutral</option>
                                        <option value="warm">Warm</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-mono block text-foreground/70 mb-1">Depth (1-10)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={form.depth}
                                        onChange={(e) => setForm({ ...form, depth: e.target.value })}
                                        className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="label-mono block text-foreground/70 mb-1">Badge (Optional)</label>
                                    <input
                                        type="text"
                                        value={form.badge}
                                        onChange={(e) => setForm({ ...form, badge: e.target.value })}
                                        placeholder="e.g. Flagship, New, Bestseller"
                                        className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label-mono block text-foreground/70 mb-1">Finish / Formula Description</label>
                                <input
                                    type="text"
                                    value={form.finish}
                                    onChange={(e) => setForm({ ...form, finish: e.target.value })}
                                    placeholder="e.g. Luminous second-skin fluid"
                                    className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="label-mono block text-foreground/70 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={form.image_url}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="/images/products/flagship-skin-tint.jpg or external https URL"
                                    className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary font-mono"
                                />
                            </div>

                            <div>
                                <label className="label-mono block text-foreground/70 mb-1">
                                    Formula Notes (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={form.formula_notes}
                                    onChange={(e) => setForm({ ...form, formula_notes: e.target.value })}
                                    placeholder="e.g. Multi-depth hyaluronic acid, Squalane hydration, Niacinamide"
                                    className="h-10 w-full rounded-xl border border-border/60 bg-background/80 px-3 text-xs outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="prodActive"
                                    checked={form.active}
                                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                    className="h-4 w-4 rounded accent-primary"
                                />
                                <label htmlFor="prodActive" className="text-xs text-foreground/80 cursor-pointer">
                                    Active in customer storefront
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="glass-btn rounded-full px-5 py-2 text-xs uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-full bg-primary px-6 py-2 text-xs font-mono font-medium uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-95"
                                >
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
