import type { Order, OrderItem } from '@prisma/client';
import { useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { useOrder } from './hooks';
import { getTour, type Tour as StrapiTour } from './tour';

export type OrderItemInfo = Omit<OrderItem, 'tour'> & { tour: StrapiTour };

export interface OrderInfo {
    items: OrderItemInfo[];
}

export async function fillOrderTours(order: Order & { items: OrderItem[] }) {
    const itemTours = await Promise.all(order.items.map(async (item) => ({ item, tour: await getTour(item.tour) })));
    return {
        items: itemTours
            .filter(({ tour }) => !!tour)
            .map(({ item, tour }) => {
                invariant(tour);
                return { ...item, tour: tour };
            }),
    };
}

export function useMyOrder(initialData: OrderInfo | null = null) {
    const [data, setData] = useState<OrderInfo | null>(initialData);
    const { findFirst } = useOrder();
    const { data: orderData, ...rest } = findFirst({
        include: { customer: true, items: true },
        where: { status: { equals: 'DRAFT' } },
        orderBy: { createdAt: 'desc' },
    });

    useEffect(() => {
        if (orderData) {
            fillOrderTours(orderData)
                .then((orderInfo) => {
                    setData(orderInfo);
                })
                .catch((reason) => {
                    console.error('Failed to load tours:', reason);
                });
        }
    }, [orderData]);

    return { data, ...rest };
}
