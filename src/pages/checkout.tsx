/* eslint-disable @typescript-eslint/no-misused-promises */
import { PayPalButtons } from '@paypal/react-paypal-js';
import { OrderStatus, type Customer } from '@prisma/client';
import dayjs from 'dayjs';
import type { GetServerSideProps, NextPage } from 'next';
import Router from 'next/router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { useCustomer, useOrder } from '../lib/hooks';
import { fillOrderTours, useMyOrder, type OrderInfo, type OrderItemInfo } from '../lib/order';
import { getCustomerDb } from '../server/customer-db';
import { api } from '../utils/api';

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

const CheckoutPage: NextPage<Props> = ({ customer, order: initOrder }) => {
    const { data: order, mutate: mutateOrder } = useMyOrder(initOrder);
    const { del: deleteOrder } = useOrder();
    const { update: updateCustomer } = useCustomer();
    const { register, handleSubmit } = useForm<Inputs>({
        defaultValues: { firstName: customer?.firstName, lastName: customer?.lastName, email: customer?.email },
    });
    const completeOrder = api.order.complete.useMutation();

    const onSaveContact: SubmitHandler<Inputs> = async (data) => {
        invariant(customer);
        await updateCustomer({
            where: { id: customer?.id },
            data,
        });
        await mutateOrder();
    };

    const onDiscardOrder = async () => {
        invariant(order);
        await deleteOrder({ where: { id: order.id } });
        await Router.push('/tours');
    };

    const getOrderTotal = () => {
        if (!order) {
            return 0;
        }
        return order.items.reduce((acc, item) => acc + item.tour.price * item.quantity, 0) || 0;
    };

    const setOrderCompleted = async (details: { id: string; status: string }) => {
        invariant(order);
        await completeOrder.mutateAsync({ orderId: order.id, captureDetails: details });
    };

    return (
        <div className="container mx-auto flex w-full flex-col py-16">
            <h1 className="text-3xl font-semibold">Checkout</h1>
            <div className="divider"></div>

            {order && (
                <div className="flex items-start justify-center gap-8">
                    <div className="flex w-96 flex-col rounded-lg border p-8">
                        <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>
                        <form className="form-control w-full" onSubmit={handleSubmit(onSaveContact)}>
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
                            <input type="submit" className="btn-primary btn mt-4" value="Save Contact Info" />
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

                        <PayPalButtons
                            className="mt-4"
                            style={{ layout: 'horizontal', label: 'checkout', tagline: false, height: 40 }}
                            createOrder={(_, actions) => {
                                console.log('Creating Paypal order:', getOrderTotal());
                                return actions.order.create({
                                    purchase_units: [
                                        {
                                            amount: {
                                                value: getOrderTotal().toString(),
                                            },
                                        },
                                    ],
                                });
                            }}
                            onApprove={async (_, actions) => {
                                const details = await actions.order?.capture();
                                if (details && details.status === 'COMPLETED') {
                                    console.log('Payment captures successfully:', details);
                                    await setOrderCompleted(details);
                                    await Router.push('/thankyou');
                                } else {
                                    alert('Something went wrong during the payment process. Please try again.');
                                }
                            }}
                        />

                        <button className="btn-outline btn" onClick={onDiscardOrder}>
                            Discard Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
    const db = getCustomerDb(req);
    const r = await db.customer.findFirst({
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
