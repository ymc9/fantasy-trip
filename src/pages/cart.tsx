import { OrderStatus, type Customer } from '@prisma/client';
import dayjs from 'dayjs';
import type { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Router from 'next/router';
import pluralize from 'pluralize';
import { useState } from 'react';
import { fillCartTours, useMyCart, type CartInfo, type CartItemInfo } from '../lib/cart';
import { useCartItem } from '../lib/hooks';
import { getCustomerDb } from '../server/customer-db';
import { api } from '../utils/api';

function CartItem({
    item,
    available,
    onChange,
}: {
    item: CartItemInfo;
    available: boolean;
    onChange?: (item: CartItemInfo) => void;
}) {
    const { del: removeItem } = useCartItem();
    const [changing, setChanging] = useState(false);

    async function onEdit(item: CartItemInfo) {
        await Router.push(`/tours/${item.tour.slug}?cartRef=${item.id}`);
    }

    async function onRemove(item: CartItemInfo) {
        setChanging(true);
        try {
            await removeItem({ where: { id: item.id } });
        } finally {
            setChanging(false);
            onChange?.(item);
        }
    }

    return (
        <div className="flex flex-row items-center rounded-lg border border-gray-200 py-6 px-12 shadow-lg">
            <div className="relative flex h-32 w-32">
                {item.tour.images[0] && (
                    <Link href={`/tours/${item.tour.slug}`}>
                        <Image
                            className="object-fit rounded-lg"
                            src={item.tour.images[0]}
                            fill={true}
                            alt={item.tour.name}
                            priority
                        />
                    </Link>
                )}
            </div>
            <div className="flex flex-col justify-center gap-2 px-4">
                <Link href={`/tours/${item.tour.slug}`}>
                    <h2>{item.tour.name}</h2>
                </Link>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <div>
                        <span className={!available ? 'line-through' : ''}>
                            {dayjs(item.date).format('YYYY-MM-DD')}{' '}
                        </span>
                        {!available && (
                            <span className="ml-2 font-semibold text-red-700">Not available on the day</span>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <p>
                            # Adult: {item.quantity} (${item.tour.price}/pp)
                        </p>
                        <p className="font-semibold text-orange-500"> ${item.tour.price * item.quantity}</p>
                    </div>
                </div>
                <div className="flex flex-row self-end">
                    <button
                        className={`btn-link btn-xs btn ${changing ? 'loading' : ''}`}
                        onClick={() => void onEdit(item)}
                    >
                        Edit
                    </button>
                    <button
                        className={`btn-link btn-xs btn ${changing ? 'loading' : ''}`}
                        onClick={() => void onRemove(item)}
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

type Props = {
    customer: Customer | null;
    cart: CartInfo | null;
};

const CartPage: NextPage<Props> = ({ customer, cart: initCart }) => {
    const { data: cart, mutate } = useMyCart(initCart);
    const itemAvailability = api.useQueries((t) => {
        const cartItems = cart?.items ?? [];
        return cartItems.map((item) =>
            t.booking.isAvailable({ tour: item.tour.slug, start: item.date }, { refetchInterval: 10000 })
        );
    });

    const allAvailable = itemAvailability.every((x) => x.data !== false);
    const availabilityLoading = itemAvailability.some((x) => x.isLoading);

    async function onItemChange() {
        await mutate();
    }

    async function onCheckout() {
        await Router.push('/checkout');
    }

    return (
        <div className="container mx-auto w-full py-16">
            <h1 className="text-3xl font-semibold">Shopping Cart</h1>
            <div className="divider"></div>

            {customer && cart && cart.items.length > 0 ? (
                <div className="mx-auto mt-12 flex items-start justify-center gap-4">
                    <div className="flex flex-col items-center gap-4">
                        {cart.items.map((item, i) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                available={itemAvailability[i]?.data !== false}
                                onChange={() => void onItemChange()}
                            />
                        ))}
                    </div>
                    <div className="self-grow flex flex-col gap-4 rounded-lg border py-4 px-8 shadow-lg">
                        <div className="flex items-baseline justify-between">
                            <p className="font-semibold">Total: {pluralize('item', cart.items.length, true)}</p>
                            <p className="ml-4 text-2xl font-bold">
                                ${cart.items.map((item) => item.quantity * item.tour.price).reduce((a, b) => a + b)}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                className={`btn-primary btn-wide btn ${availabilityLoading ? 'loading' : ''}`}
                                onClick={() => void onCheckout()}
                                disabled={!allAvailable}
                            >
                                Checkout Now
                            </button>
                            <Link href="/tours">
                                <button className="btn-outline btn-wide btn">See More Tours</button>
                            </Link>
                        </div>
                        {!allAvailable && <p className="text-red-700">Some tours are not available.</p>}
                    </div>
                </div>
            ) : (
                <div>
                    You cart is empty. Explore our{' '}
                    <Link href="/tours" className="underline">
                        best selling tours.
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CartPage;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
    const db = getCustomerDb(req);
    const r = await db.customer.findFirst({
        include: {
            cart: { include: { items: true } },
            orders: {
                include: { items: true },
                where: { status: OrderStatus.DRAFT },
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
    });

    if (!r) {
        return { props: { customer: null, cart: null, order: null } };
    }

    const { cart, ...customer } = r;
    const cartInfo = cart && (await fillCartTours(cart));
    return {
        props: {
            customer,
            cart: cartInfo,
        },
    };
};
