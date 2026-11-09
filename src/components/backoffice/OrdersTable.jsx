// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import './orders-table.css';

const PER_PAGE = 8;
const LIFECYCLE = { pending: 0, confirmed: 1, shipped: 2, cancelled: 3 };
const STATUSES = ['pending', 'confirmed', 'shipped', 'cancelled'];
const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', cancelled: 'Cancelled' };

const FILTERS = [
    { key: 'all', label: 'All', fc: '#9A9A9A', fill: 'linear-gradient(180deg, #3A3A3A 0%, #262626 100%)', ink: '#F5F5F5', cap: '#7DD584', capInk: '#0E0E0E' },
    { key: 'shipped', label: 'Shipped', fc: '#48E781', grad: 'var(--dt1-shipped-grad)', ink: 'var(--dt1-shipped-ink)' },
    { key: 'confirmed', label: 'Confirmed', fc: '#60a5fa', grad: 'var(--dt1-confirmed-grad)', ink: 'var(--dt1-confirmed-ink)' },
    { key: 'pending', label: 'Pending', fc: '#F7CC32', grad: 'var(--dt1-pending-grad)', ink: 'var(--dt1-pending-ink)' },
    { key: 'cancelled', label: 'Cancelled', fc: '#FF2F2F', grad: 'var(--dt1-cancelled-grad)', ink: 'var(--dt1-cancelled-ink)' },
];

function money(n) {
    return `$${Number(n || 0).toFixed(0)}`;
}

function initials(name) {
    if (!name) return '—';
    const parts = name.trim().split(/\s+/);
    const v = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
    return v || name.slice(0, 2).toUpperCase();
}

export default function OrdersTable({ orders, loading, onStatusChange }) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortKey, setSortKey] = useState('order');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(() => new Set());
    const [toastMsg, setToastMsg] = useState('');
    const [enter, setEnter] = useState(true);

    const sectionRef = useRef(null);
    const wrapRef = useRef(null);
    const markerRef = useRef(null);
    const toastTimer = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setEnter(false), 1100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const counts = useMemo(() => {
        const c = { all: orders.length };
        STATUSES.forEach((s) => {
            c[s] = orders.filter((o) => o.status === s).length;
        });
        return c;
    }, [orders]);

    const filtered = useMemo(
        () => orders.filter((o) => statusFilter === 'all' || o.status === statusFilter),
        [orders, statusFilter]
    );

    const sorted = useMemo(() => {
        const arr = [...filtered];
        const dir = sortDir === 'asc' ? 1 : -1;
        arr.sort((a, b) => {
            let av; let bv;
            if (sortKey === 'order') {
                av = new Date(a.created_at || a.created_date || 0).getTime();
                bv = new Date(b.created_at || b.created_date || 0).getTime();
            } else if (sortKey === 'total') {
                av = a.total; bv = b.total;
            } else if (sortKey === 'status') {
                av = LIFECYCLE[a.status]; bv = LIFECYCLE[b.status];
            } else if (sortKey === 'email') {
                av = (a.email || '').toLowerCase();
                bv = (b.email || '').toLowerCase();
                return dir * av.localeCompare(bv);
            } else {
                av = (a.customer_name || '').toLowerCase();
                bv = (b.customer_name || '').toLowerCase();
                return dir * av.localeCompare(bv);
            }
            return dir * (av - bv);
        });
        return arr;
    }, [filtered, sortKey, sortDir]);

    const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const curPage = Math.min(page, pages);
    const slice = sorted.slice((curPage - 1) * PER_PAGE, curPage * PER_PAGE);
    const showTable = !loading && sorted.length > 0;

    const sort = (k) => {
        if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(k);
            setSortDir(k === 'order' || k === 'total' ? 'desc' : 'asc');
        }
    };

    const showToast = (msg) => {
        setToastMsg(msg);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastMsg(''), 2600);
    };

    const moveTo = (rowEl) => {
        const m = markerRef.current;
        const w = wrapRef.current;
        if (!m || !w || !rowEl) return;
        const wr = w.getBoundingClientRect();
        const rr = rowEl.getBoundingClientRect();
        const y = rr.top - wr.top - w.clientTop;
        m.style.height = `${rr.height}px`;
        m.style.translate = `0 ${y}px`;
        m.setAttribute('data-on', '1');
    };

    const moveOff = () => {
        if (markerRef.current) markerRef.current.setAttribute('data-on', '0');
    };

    const togglePick = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const visibleIds = slice.map((o) => o.id);
    const allOnPageChecked = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
    const someOnPageChecked = visibleIds.some((id) => selected.has(id)) && !allOnPageChecked;

    const toggleAll = (checked) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) visibleIds.forEach((id) => next.add(id));
            else visibleIds.forEach((id) => next.delete(id));
            return next;
        });
    };

    const exportRows = (scope) => {
        const list = scope === 'selected' ? orders.filter((o) => selected.has(o.id)) : sorted;
        if (!list.length) {
            showToast('Nothing to export');
            return;
        }
        const csv = ['Order,Customer,Email,Total,Status']
            .concat(
                list.map((o) =>
                    [
                        `#${o.order_number}`,
                        `"${(o.customer_name || '').replace(/"/g, '""')}"`,
                        o.email || '',
                        o.total,
                        o.status,
                    ].join(',')
                )
            )
            .join('\n');
        showToast(`${list.length} order${list.length === 1 ? '' : 's'} ready to export`);
        return csv;
    };

    const selectedCount = selected.size;
    const bulkOn = selectedCount > 0;
    const meterPct = sorted.length ? ((Math.min(curPage, pages) * PER_PAGE > sorted.length ? sorted.length : curPage * PER_PAGE) / sorted.length) * 100 : 0;
    const shownCount = Math.min(curPage * PER_PAGE, sorted.length);

    return (
        <section className="dt1-section" data-dt1 data-dt1-enter={enter ? '' : undefined} ref={sectionRef} data-dt1-marker="">
            <div className="dt1-card" data-dt1-bulk={bulkOn ? 'on' : 'off'}>
                <div className="dt1-shell" data-dt1-toast={toastMsg ? 'on' : 'off'}>
                    <div className="dt1-head">
                        <div className="dt1-titles">
                            <h3 className="dt1-title">Orders</h3>
                            <p className="dt1-meta">
                                {orders.length} order{orders.length === 1 ? '' : 's'} · {PER_PAGE} per page
                            </p>
                        </div>
                        <span className="dt1-export">
                            <button type="button" className="dt1-btn dt1-btn--beam" onClick={() => exportRows('all')}>
                                <span className="dt1-beam-track" aria-hidden="true">
                                    <span className="dt1-beam" />
                                </span>
                                Export CSV
                            </button>
                        </span>
                    </div>

                    <div className="dt1-toolwrap">
                        <div className="dt1-tools">
                            <div className="dt1-chips" role="group" aria-label="Filter by status">
                                {FILTERS.map((f, i) => (
                                    <button
                                        key={f.key}
                                        type="button"
                                        className="dt1-fcard"
                                        data-filter={f.key}
                                        aria-pressed={statusFilter === f.key}
                                        style={{
                                            '--dt1-i': i,
                                            '--dt1-fc': f.fc,
                                            '--dt1-fc-fill': f.grad || f.fill,
                                            '--dt1-fc-ink': f.ink,
                                            '--dt1-fc-cap': f.cap,
                                            '--dt1-fc-cap-ink': f.capInk,
                                        }}
                                        onClick={() => setStatusFilter(f.key)}
                                    >
                                        {f.key !== 'all' && <span className="dt1-fcard-dot" aria-hidden="true" />}
                                        <span className="dt1-fcard-name">{f.label}</span>
                                        <span className="dt1-fcard-n">{counts[f.key] ?? 0}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="dt1-bulk" aria-live="polite">
                            <span className="dt1-bulk-n">{selectedCount} selected</span>
                            <span className="dt1-spacer" />
                            <button type="button" className="dt1-btn dt1-btn--ghost" onClick={() => setSelected(new Set())}>
                                Clear
                            </button>
                            <button type="button" className="dt1-btn dt1-btn--primary dt1-btn--beam" onClick={() => exportRows('selected')}>
                                <span className="dt1-beam-track" aria-hidden="true">
                                    <span className="dt1-beam" />
                                </span>
                                Export selected
                            </button>
                        </div>
                    </div>

                    <div className="dt1-tablewrap" ref={wrapRef} onMouseLeave={moveOff}>
                        <div className="dt1-marker" data-dt1-marker ref={markerRef} aria-hidden="true" />

                        {showTable && (
                            <table className="dt1-table">
                                <thead className="dt1-thead">
                                    <tr>
                                        <th className="dt1-th dt1-th--pick" scope="col">
                                            <label className="dt1-check">
                                                <input
                                                    type="checkbox"
                                                    className="dt1-check-input"
                                                    aria-label="Select all orders on this page"
                                                    checked={allOnPageChecked}
                                                    ref={(el) => {
                                                        if (el) el.indeterminate = someOnPageChecked;
                                                    }}
                                                    onChange={(e) => toggleAll(e.target.checked)}
                                                />
                                                <span className="dt1-check-box" aria-hidden="true">
                                                    <svg className="dt1-check-icon" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    </svg>
                                                </span>
                                            </label>
                                        </th>
                                        {[
                                            { k: 'order', label: 'Order' },
                                            { k: 'customer', label: 'Customer' },
                                            { k: 'email', label: 'Email' },
                                            { k: 'total', label: 'Total' },
                                            { k: 'status', label: 'Status' },
                                        ].map((col) => (
                                            <th
                                                key={col.k}
                                                className={`dt1-th dt1-th--${col.k}`}
                                                scope="col"
                                                aria-sort={sortKey === col.k ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                                            >
                                                <button type="button" className="dt1-sort" onClick={() => sort(col.k)}>
                                                    {col.label}
                                                    <svg className="dt1-sort-ind" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
                                                    </svg>
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="dt1-tbody">
                                    {slice.map((o, i) => (
                                        <tr
                                            key={o.id}
                                            className="dt1-row"
                                            style={{ '--dt1-i': i }}
                                            data-status={o.status}
                                            onMouseEnter={(e) => moveTo(e.currentTarget)}
                                        >
                                            <td className="dt1-cell dt1-cell--pick">
                                                <span className="dt1-rowline" aria-hidden="true" />
                                                <label className="dt1-check">
                                                    <input
                                                        type="checkbox"
                                                        className="dt1-check-input"
                                                        aria-label={`Select order ${o.order_number}`}
                                                        checked={selected.has(o.id)}
                                                        onChange={() => togglePick(o.id)}
                                                    />
                                                    <span className="dt1-check-box" aria-hidden="true">
                                                        <svg className="dt1-check-icon" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                        </svg>
                                                    </span>
                                                </label>
                                            </td>
                                            <td className="dt1-cell dt1-cell--order">
                                                <span className="dt1-order">#{o.order_number}</span>
                                                {o.created_at && (
                                                    <span className="block text-[10px] text-foreground/40 mt-0.5">
                                                        {new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="dt1-cell dt1-cell--cust">
                                                <span className="dt1-avatar" aria-hidden="true">{initials(o.customer_name)}</span>
                                                <span className="dt1-name">{o.customer_name || '—'}</span>
                                            </td>
                                            <td className="dt1-cell dt1-cell--email">
                                                <span className="dt1-email">{o.email || '—'}</span>
                                            </td>
                                            <td className="dt1-cell dt1-cell--total">
                                                <span className="dt1-total">{money(o.total)}</span>
                                            </td>
                                            <td className="dt1-cell dt1-cell--status">
                                                <select
                                                    className={`dt1-badge dt1-badge--${o.status} dt1-status-select`}
                                                    value={o.status}
                                                    aria-label={`Status for order ${o.order_number}`}
                                                    onChange={(e) => onStatusChange?.(o.id, e.target.value)}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {loading && (
                            <div className="dt1-skel" aria-hidden="true">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="dt1-skel-row" />
                                ))}
                            </div>
                        )}

                        {!loading && sorted.length === 0 && (
                            <div className="dt1-empty">
                                <span className="dt1-empty-ico">
                                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
                                        <path d="M1.75 6.25h12.5M6 6.25v7" stroke="currentColor" strokeWidth="1.3" />
                                    </svg>
                                </span>
                                <span className="dt1-empty-t">
                                    {orders.length === 0 ? 'No orders yet' : 'No orders match this filter'}
                                </span>
                                <p className="dt1-empty-p">
                                    Orders placed in the storefront will appear here with their status, total and customer details.
                                </p>
                            </div>
                        )}
                    </div>

                    {showTable && (
                        <div className="dt1-foot">
                            <div className="dt1-range">
                                Showing {shownCount} of {sorted.length}
                            </div>
                            <div className="dt1-meter" aria-hidden="true">
                                <span className="dt1-meter-fill" style={{ width: `${meterPct.toFixed(1)}%` }} />
                            </div>
                            <div className="dt1-pager">
                                <button
                                    type="button"
                                    className="dt1-page"
                                    aria-label="Previous page"
                                    disabled={curPage <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                {Array.from({ length: pages }).map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="dt1-page"
                                        aria-current={curPage === i + 1 ? 'page' : undefined}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    className="dt1-page"
                                    aria-label="Next page"
                                    disabled={curPage >= pages}
                                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                >
                                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="dt1-toast" role="status" aria-live="polite">
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="m3 8.5 3.2 3.2L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{toastMsg}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}