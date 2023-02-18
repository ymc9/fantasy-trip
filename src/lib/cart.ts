import type { Cart, CartItem } from '@prisma/client';
import { useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { useCart } from './hooks';
import { getTour, type Tour as StrapiTour } from './tour';

export type CartItemInfo = Omit<CartItem, 'tour'> & { tour: StrapiTour };

export interface CartInfo {
    items: CartItemInfo[];
}

export async function fillCartTours(cart: Cart & { items: CartItem[] }) {
    const itemTours = await Promise.all(cart.items.map(async (item) => ({ item, tour: await getTour(item.tour) })));
    return {
        items: itemTours
            .filter(({ tour }) => !!tour)
            .map(({ item, tour }) => {
                invariant(tour);
                return { ...item, tour };
            }),
    };
}

export function useMyCart(initialData: CartInfo | null = null) {
    const [data, setData] = useState<CartInfo | null>(initialData);

    const { findFirst } = useCart();
    const { data: cartData, ...rest } = findFirst({ include: { items: true } });

    useEffect(() => {
        if (cartData) {
            fillCartTours(cartData)
                .then((cartInfo) => {
                    setData(cartInfo);
                })
                .catch((reason) => {
                    console.error('Failed to load tours:', reason);
                });
        }
    }, [cartData]);

    return { data, ...rest };
}
