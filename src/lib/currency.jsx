import React, { createContext, useContext, useEffect, useState } from 'react';

export const CURRENCIES = [
    { code: 'KES', label: 'KES (Ksh)', symbol: 'Ksh', flag: '🇰🇪', rate: 130, name: 'Kenyan Shilling' },
    { code: 'USD', label: 'USD ($)', symbol: '$', flag: '🇺🇸', rate: 1, name: 'US Dollar' },
    { code: 'GBP', label: 'GBP (£)', symbol: '£', flag: '🇬🇧', rate: 0.79, name: 'British Pound' },
    { code: 'EUR', label: 'EUR (€)', symbol: '€', flag: '🇪🇺', rate: 0.92, name: 'Euro' },
];

const CurrencyContext = createContext({
    currency: 'KES',
    setCurrency: (code) => {},
    formatPrice: (amountInUSD) => '',
    convert: (amountInUSD) => 0,
    currentCurrency: CURRENCIES[0],
    currencies: CURRENCIES,
});

const STORAGE_KEY = 'sylvia_selected_currency';

export function CurrencyProvider({ children }) {
    // Default to KES as requested
    const [currency, setCurrencyState] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) || 'KES';
        } catch {
            return 'KES';
        }
    });

    const setCurrency = (code) => {
        setCurrencyState(code);
        try {
            localStorage.setItem(STORAGE_KEY, code);
        } catch {
            // ignore
        }
    };

    const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

    const convert = (amountInUSD) => {
        const num = Number(amountInUSD) || 0;
        return num * currentCurrency.rate;
    };

    const formatPrice = (amountInUSD) => {
        const num = Number(amountInUSD) || 0;
        const converted = num * currentCurrency.rate;

        if (currency === 'KES') {
            return `Ksh ${Math.round(converted).toLocaleString()}`;
        }
        if (currency === 'USD') {
            return `$${Math.round(converted).toLocaleString()}`;
        }
        if (currency === 'GBP') {
            return `£${Math.round(converted).toLocaleString()}`;
        }
        if (currency === 'EUR') {
            return `€${Math.round(converted).toLocaleString()}`;
        }
        return `${currentCurrency.symbol} ${Math.round(converted).toLocaleString()}`;
    };

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency,
                formatPrice,
                convert,
                currentCurrency,
                currencies: CURRENCIES,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}

