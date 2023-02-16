import dayjs from 'dayjs';
import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Router from 'next/router';
import { useState } from 'react';
import { type CartItemInfo, useMyCart } from '../lib/cart';
import { useCartItem } from '../lib/hooks';

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
        <div className="flex flex-row rounded-lg border border-gray-300 py-4 px-12">
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
                    <p>
                        # Adult: {item.quantity} (${item.tour.price}/pp)
                    </p>
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

const CheckoutPage: NextPage = () => {
    const { data: cart, mutate } = useMyCart();

    async function onItemChange() {
        await mutate();
    }

    return (
        <div className="container mx-auto py-16">
            <h1 className="text-3xl font-semibold">Shopping Cart</h1>
            <div className="divider"></div>

            <div className="mt-12 flex flex-col items-center gap-4">
                {cart &&
                    cart.items.map((item) => (
                        <CartItem key={item.id} item={item} onChange={() => void onItemChange()} />
                    ))}
            </div>
        </div>
    );
};

export default CheckoutPage;
