import React, { createContext, useContext, useEffect, useState } from 'react';

export const FREE_GIFT_NAME = 'Mini Orbital Gloss (Supernova)';
export const FREE_GIFT_THRESHOLD = 75;

const CartContext = createContext();

export function CartProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem('lumen_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('lumen_cart', JSON.stringify(items));
        } catch {
            // ignore
        }
    }, [items]);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const toggleCart = () => setIsOpen((prev) => !prev);

    const addItem = (product, quantity = 1) => {
        setItems((prev) => {
            const key = `${product.id || product.slug}-${product.shade_name || 'default'}`;
            const existingIndex = prev.findIndex((i) => i.key === key);
            if (existingIndex > -1) {
                const next = [...prev];
                next[existingIndex] = {
                    ...next[existingIndex],
                    quantity: next[existingIndex].quantity + quantity,
                };
                return next;
            }
            return [
                ...prev,
                {
                    key,
                    product_id: product.id,
                    slug: product.slug,
                    name: product.name,
                    shade_name: product.shade_name,
                    shade_hex: product.shade_hex,
                    price: Number(product.price || 0),
                    quantity,
                    image_url: product.image_url,
                },
            ];
        });
        setIsOpen(true);
    };

    const removeItem = (key) => {
        setItems((prev) => prev.filter((i) => i.key !== key && i.product_id !== key));
    };

    const setQuantity = (key, quantity) => {
        if (quantity <= 0) {
            removeItem(key);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.key === key || i.product_id === key ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setItems([]);
        try {
            localStorage.removeItem('lumen_cart');
        } catch {
            // ignore
        }
    };

    const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                isOpen,
                openCart,
                closeCart,
                toggleCart,
                items,
                subtotal,
                count,
                addItem,
                removeItem,
                setQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
