import { create } from "zustand";

export interface CartItem {
    id: string; // warungProductId
    instanceId: string; // Unique ID for same product with different modifiers
    name: string;
    price: number;
    basePrice: number; // Price without modifiers/wholesale
    discount: number;
    quantity: number;
    stockQty: number;
    barcode: string;
    modifiers: any[];
    wholesalePrices: any[]; // Store tiers for this product
}

interface CartState {
    items: CartItem[];
    customer: any | null;
    discountAmount: number;
    discountType: "FIXED" | "PERCENT";
    taxAmount: number;
    taxType: "FIXED" | "PERCENT";

    addItem: (wp: any, selectedModifiers?: any[]) => void;
    updateQty: (instanceId: string, quantity: number) => void;
    updateItemDiscount: (instanceId: string, discount: number) => void;
    removeItem: (instanceId: string) => void;
    setCustomer: (customer: any | null) => void;
    setDiscount: (amount: number, type?: "FIXED" | "PERCENT") => void;
    setTax: (amount: number, type?: "FIXED" | "PERCENT") => void;
    clearCart: () => void;
    totalItems: () => number;
    subtotal: () => number;
    calculateDiscount: () => number;
    calculateTax: () => number;
    totalPrice: () => number;
}

const calculateItemPrice = (basePrice: number, quantity: number, modifiers: any[], wholesalePrices: any[]) => {
    let price = basePrice;

    // 1. Check Wholesale
    if (wholesalePrices && wholesalePrices.length > 0) {
        const sortedTiers = [...wholesalePrices].sort((a, b) => b.minQty - a.minQty);
        const tier = sortedTiers.find(t => quantity >= t.minQty);
        if (tier) {
            price = Number(tier.price);
        }
    }

    // 2. Add Modifiers
    const modifierTotal = modifiers.reduce((sum, m) => sum + Number(m.price), 0);
    return price + modifierTotal;
};

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    customer: null,
    discountAmount: 0,
    discountType: "FIXED",
    taxAmount: 0,
    taxType: "FIXED",

    addItem: (wp, selectedModifiers = []) => {
        const items = get().items;
        const modIds = [...selectedModifiers].map(m => m.id).sort().join(",");
        const instanceId = `${wp.id}-${modIds}`;

        const existing = items.find((i) => i.instanceId === instanceId);

        if (existing) {
            const newQty = existing.quantity + 1;
            if (newQty > wp.stockQty) return;

            const newPrice = calculateItemPrice(existing.basePrice, newQty, existing.modifiers, existing.wholesalePrices);

            set({
                items: items.map((i) =>
                    i.instanceId === instanceId ? { ...i, quantity: newQty, price: newPrice } : i
                ),
            });
        } else {
            if (wp.stockQty <= 0) return;

            const basePrice = Number(wp.sellingPrice);
            const finalPrice = calculateItemPrice(basePrice, 1, selectedModifiers, wp.wholesalePrices || []);

            set({
                items: [
                    ...items,
                    {
                        id: wp.id,
                        instanceId,
                        name: wp.product.name,
                        basePrice,
                        price: finalPrice,
                        discount: 0,
                        quantity: 1,
                        stockQty: wp.stockQty,
                        barcode: wp.product.barcode,
                        modifiers: selectedModifiers,
                        wholesalePrices: wp.wholesalePrices || [],
                    },
                ],
            });
        }
    },
    updateQty: (instanceId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(instanceId);
            return;
        }
        const items = get().items;
        const item = items.find((i) => i.instanceId === instanceId);
        if (!item || quantity > item.stockQty) return;

        const newPrice = calculateItemPrice(item.basePrice, quantity, item.modifiers, item.wholesalePrices);

        set({
            items: items.map((i) => (i.instanceId === instanceId ? { ...i, quantity, price: newPrice } : i)),
        });
    },
    updateItemDiscount: (instanceId, discount) => {
        set({
            items: get().items.map((i) => (i.instanceId === instanceId ? { ...i, discount } : i)),
        });
    },
    removeItem: (instanceId) => {
        set({ items: get().items.filter((i) => i.instanceId !== instanceId) });
    },
    setCustomer: (customer) => set({ customer }),
    setDiscount: (discountAmount, type) =>
        set({
            discountAmount,
            discountType: type || get().discountType,
        }),
    setTax: (taxAmount, type) =>
        set({
            taxAmount,
            taxType: type || get().taxType,
        }),
    clearCart: () =>
        set({
            items: [],
            customer: null,
            discountAmount: 0,
            discountType: "FIXED",
            taxAmount: 0,
            taxType: "FIXED",
        }),
    totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: () => get().items.reduce((sum, i) => sum + i.quantity * (i.price - i.discount), 0),
    calculateDiscount: () => {
        const { discountAmount, discountType, subtotal } = get();
        if (discountType === "PERCENT") {
            return (subtotal() * discountAmount) / 100;
        }
        return discountAmount;
    },
    calculateTax: () => {
        const { taxAmount, taxType, subtotal } = get();
        if (taxType === "PERCENT") {
            return (subtotal() * taxAmount) / 100;
        }
        return taxAmount;
    },
    totalPrice: () => {
        const sub = get().subtotal();
        const disc = get().calculateDiscount();
        const tax = get().calculateTax();
        return sub - disc + tax;
    },
}));
