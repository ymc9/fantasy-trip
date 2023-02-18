/* eslint-disable @typescript-eslint/no-misused-promises */
import { OrderStatus, type Customer } from '@prisma/client';
import { withPresets } from '@zenstackhq/runtime';
import dayjs from 'dayjs';
import type { GetServerSideProps, NextPage } from 'next';
import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { CUSTOMER_ID_COOKIE, useCurrentCustomer } from '../lib/customer';
import { fillOrderTours, useMyOrder, type OrderInfo, type OrderItemInfo } from '../lib/order';
import { prisma } from '../server/db';

type Inputs = {
    firstName: string;
    lastName: string;
    email: string;
};

type Props = {
    customer: Customer | null;
    order: OrderInfo | null;
};

const LineItem = ({ item }: { item: OrderItemInfo }) => {
    return (
        <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">{item.tour.name}</div>
            <div className="flex flex-row justify-between text-sm">
                <p>{dayjs(item.date).format('YYYY-MM-DD')}</p>
                <p>
                    {item.quantity} x ${item.tour.price}/pp
                </p>
            </div>
        </div>
    );
};

const CheckoutPage: NextPage<Props> = ({ order: initOrder }) => {
    const { data: me } = useCurrentCustomer();
    const { data: order } = useMyOrder(initOrder);
    const { register, reset: resetForm, handleSubmit } = useForm<Inputs>();

    useEffect(() => {
        if (me) {
            resetForm({ firstName: me.firstName, lastName: me.lastName, email: me.email });
        }
    }, [me, resetForm]);

    const onProceedPayment: SubmitHandler<Inputs> = async (data) => {
        console.log(data);
    };

    const getOrderTotal = () => {
        if (!order) {
            return 0;
        }
        return order.items.reduce((acc, item) => acc + item.tour.price * item.quantity, 0) || 0;
    };

    return (
        <div className="container mx-auto flex w-full flex-col py-16">
            <h1 className="text-3xl font-semibold">Checkout</h1>
            <div className="divider"></div>

            {order && (
                <div className="flex items-start justify-center gap-8">
                    <div className="flex w-96 flex-col rounded-lg border p-8">
                        <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>
                        <form className="form-control w-full" onSubmit={handleSubmit(onProceedPayment)}>
                            <label className="label">
                                <span className="label-text">First Name</span>
                            </label>
                            <input
                                type="text"
                                className="input-bordered input w-full max-w-xs"
                                required
                                {...register('firstName')}
                            />
                            <label className="label">
                                <span className="label-text">Last Name</span>
                            </label>
                            <input
                                type="text"
                                required
                                className="input-bordered input w-full max-w-xs"
                                {...register('lastName')}
                            />
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                required
                                className="input-bordered input w-full max-w-xs"
                                {...register('email')}
                            />
                            <input type="submit" className="btn-primary btn mt-4" value="Proceed to Payment" />
                            <button className="btn-outline btn mt-2">Discard Order</button>
                        </form>
                    </div>
                    <div className="flex flex-col gap-4 rounded-lg border p-8">
                        <div className="flex justify-between">
                            <p className="text-lg font-semibold">Total</p>
                            <p className="text-2xl font-semibold text-orange-500">${getOrderTotal()}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {order.items.map((item) => (
                                <LineItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
    const customerId = req.cookies[CUSTOMER_ID_COOKIE];
    if (!customerId) {
        return {
            props: { customer: null, cart: null, order: null },
        };
    }

    const db = withPresets(prisma, { user: { id: customerId } });
    const r = await db.customer.findUnique({
        where: { id: customerId },
        include: {
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

    const { orders, ...customer } = r;

    const orderInfo = orders[0] ? await fillOrderTours(orders[0]) : null;
    return {
        props: {
            customer,
            order: orderInfo,
        },
    };
};
