import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useCurrency } from '@/lib/currency';

export default function CurrencySelector({ compact = false, className = '' }) {
    const { currency, setCurrency, currentCurrency, currencies } = useCurrency();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Select currency, currently ${currentCurrency.code}`}
                className={`glass-btn inline-flex items-center gap-1.5 rounded-full font-mono transition-all duration-300 hover:border-primary/50 text-foreground ${
                    compact
                        ? 'h-9 px-3 text-[11px] font-medium'
                        : 'h-10 px-4 text-xs font-medium'
                }`}
            >
                <span className="text-sm leading-none">{currentCurrency.flag}</span>
                <span className="uppercase tracking-wider">{currentCurrency.symbol}</span>
                <ChevronDown className={`h-3 w-3 text-foreground/50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label="Currency options"
                    className="glass-solid absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-border/60 bg-background/95 p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="px-3 py-1.5 border-b border-border/40">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/50">
                            Select Currency
                        </p>
                    </div>
                    <div className="mt-1 space-y-0.5">
                        {currencies.map((c) => {
                            const isSelected = c.code === currency;
                            return (
                                <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                        setCurrency(c.code);
                                        setOpen(false);
                                    }}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                                        isSelected
                                            ? 'bg-primary/15 font-semibold text-primary'
                                            : 'text-foreground/80 hover:bg-card hover:text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{c.flag}</span>
                                        <div>
                                            <p className="font-medium">{c.code} ({c.symbol})</p>
                                            <p className="text-[10px] text-foreground/50 font-normal">{c.name}</p>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

