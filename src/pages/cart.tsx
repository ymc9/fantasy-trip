import { OrderStatus, type Customer } from '@prisma/client';
import { withPresets } from '@zenstackhq/runtime';
import dayjs from 'dayjs';
import type { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Router from 'next/router';
import pluralize from 'pluralize';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { fillCartTours, useMyCart, type CartInfo, type CartItemInfo } from '../lib/cart';
import { CUSTOMER_ID_COOKIE } from '../lib/customer';
import { useCartItem, useCustomer, useOrder } from '../lib/hooks';
import { fillOrderTours, type OrderInfo } from '../lib/order';
import { getCustomerDb } from '../server/customer-db';
import { prisma } from '../server/db';

function CartItem({ item, onChange }: { item: CartItemInfo; onChange?: (item: CartItemInfo) => void }) {
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
                        />
                    </Link>
                )}
            </div>
            <div className="flex flex-col justify-center gap-2 px-4">
                <Link href={`/tours/${item.tour.slug}`}>
                    <h2>{item.tour.name}</h2>
                </Link>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <p>{dayjs(item.date).format('YYYY-MM-DD')}</p>
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
    order: OrderInfo | null;
};

const CartPage: NextPage<Props> = ({ customer, cart: initCart, order }) => {
    const { data: cart, mutate } = useMyCart(initCart);
    const { update: updateCustomer } = useCustomer();
    const { create: createOrder } = useOrder();

    async function onItemChange() {
        await mutate();
    }

    async function onCheckout() {
        invariant(customer);
        invariant(cart);

        // create order
        await createOrder({
            data: {
                customer: { connect: { id: customer.id } },
                items: {
                    create: cart.items.map((item) => ({
                        tour: item.tour.slug,
                        date: item.date,
                        quantity: item.quantity,
                    })),
                },
                status: OrderStatus.DRAFT,
            },
        });

        // empty cart
        await updateCustomer({
            where: { id: customer.id },
            data: {
                cart: { delete: true },
            },
        });

        await Router.push('/checkout');
    }

    return (
        <div className="container mx-auto w-full py-16">
            <h1 className="text-3xl font-semibold">Shopping Cart</h1>
            <div className="divider"></div>

            {customer && cart && cart.items.length > 0 ? (
                <div className="mx-auto mt-12 flex items-start justify-center gap-4">
                    <div className="flex flex-col items-center gap-4">
                        {cart.items.map((item) => (
                            <CartItem key={item.id} item={item} onChange={() => void onItemChange()} />
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
                            <button className="btn-primary btn-wide btn" onClick={() => void onCheckout()}>
                                Checkout Now
                            </button>
                            <Link href="/tours">
                                <button className="btn-outline btn-wide btn">See More Tours</button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : order ? (
                <div>
                    <div className="mb-4">You have an order pending payment. </div>
                    <Link href="/checkout" className="btn-primary btn">
                        Go to checkout
                    </Link>
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

    const { cart, orders, ...customer } = r;

    const cartInfo = cart && (await fillCartTours(cart));
    const orderInfo = orders[0] ? await fillOrderTours(orders[0]) : null;
    return {
        props: {
            customer,
            cart: cartInfo,
            order: orderInfo,
        },
    };
};
