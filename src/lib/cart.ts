import type { CartItem, Customer } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useCart } from './hooks';
import { getTour, type Tour as StrapiTour } from './tour';

export type CartItemInfo = Omit<CartItem, 'tour'> & { tour: StrapiTour };

export interface CartInfo {
    customer: Customer;
    items: CartItemInfo[];
}

export function useMyCart() {
    const [data, setData] = useState<CartInfo | undefined>(undefined);

    const { findFirst } = useCart();
    const { data: cartData, ...rest } = findFirst({ include: { items: true, customer: true } });

    useEffect(() => {
        if (cartData) {
            Promise.all(cartData.items.map(async (item) => ({ item, tour: await getTour(item.tour) })))
                .then((tuples) => {
                    const cartItems = tuples
                        // filter out cart items that don't have a tour
                        .filter((tuple): tuple is { item: CartItem; tour: StrapiTour } => !!tuple.tour)
                        .map(({ item, tour }) => ({
                            ...item,
                            tour,
                        }));

                    setData({
                        customer: cartData.customer,
                        items: cartItems,
                    });
                })
                .catch((reason) => {
                    console.error('Failed to load tours:', reason);
                });
        }
    }, [cartData]);

    return { data, ...rest };
}
