/* eslint-disable @typescript-eslint/no-misused-promises */
import { PayPalButtons } from '@paypal/react-paypal-js';
import { type Customer } from '@prisma/client';
import dayjs from 'dayjs';
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import Router from 'next/router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { fillCartTours, type CartInfo, type CartItemInfo } from '../lib/cart';
import { useCustomer } from '../lib/hooks';
import { getCustomerDb } from '../server/customer-db';
import { api } from '../utils/api';

type Inputs = {
    firstName: string;
    lastName: string;
    email: string;
};

type Props = {
    customer: Customer | null;
    cart: CartInfo | null;
};

const LineItem = ({ item }: { item: CartItemInfo }) => {
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

const CheckoutPage: NextPage<Props> = ({ customer, cart }) => {
    const { update: updateCustomer } = useCustomer();
    const { register, handleSubmit } = useForm<Inputs>({
        defaultValues: { firstName: customer?.firstName, lastName: customer?.lastName, email: customer?.email },
    });
    const createOrder = api.order.create.useMutation().mutateAsync;

    // batck query for polling availability of cart items
    const itemAvailability = api.useQueries((t) => {
        const cartItems = cart?.items ?? [];
        return cartItems.map((item) =>
            t.booking.isAvailable({ tour: item.tour.slug, start: item.date }, { refetchInterval: 10000 })
        );
    });

    const allAvailable = itemAvailability.every((x) => x.data);

    const onSaveContact: SubmitHandler<Inputs> = async (data) => {
        invariant(customer);
        await updateCustomer({
            where: { id: customer?.id },
            data,
        });
    };

    const getOrderTotal = () => {
        if (!cart) {
            return 0;
        }
        return cart.items.reduce((acc, item) => acc + item.tour.price * item.quantity, 0) || 0;
    };

    const captureOrder = async (details: { id: string; status: string }) => {
        invariant(customer);
        invariant(cart);

        const order = await createOrder({
            customerId: customer.id,
            items: cart.items.map((item) => ({
                tour: item.tour.slug,
                date: item.date,
                quantity: item.quantity,
            })),
            captureDetails: details,
        });
        console.log('Created order:', order);

        // empty cart
        await updateCustomer({
            where: { id: customer?.id },
            data: {
                cart: {
                    delete: true,
                },
            },
        });
    };

    return (
        <div className="container mx-auto flex w-full flex-col py-16">
            <h1 className="text-3xl font-semibold">Checkout</h1>
            <div className="divider"></div>
            {customer && cart ? (
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
                            {cart.items.map((item) => (
                                <LineItem key={item.id} item={item} />
                            ))}
                        </div>

                        <PayPalButtons
                            className="mt-4"
                            style={{ layout: 'horizontal', label: 'checkout', tagline: false, height: 40 }}
                            disabled={!allAvailable}
                            onClick={async (_, actions) => {
                                if (!allAvailable) {
                                    alert('Some of the tours are not available anymore. Please check your cart.');
                                    await actions.reject();
                                    await Router.push('/cart');
                                } else {
                                    await actions.resolve();
                                }
                            }}
                            createOrder={async (_, actions) => {
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
                                    await captureOrder(details);
                                    await Router.push('/thankyou');
                                } else {
                                    alert('Something went wrong during the payment process. Please try again.');
                                }
                            }}
                        />

                        {!allAvailable && (
                            <div>
                                <p className="text-red-700">Some tours are not available anymore.</p>
                                <Link href="/cart" className="underline">
                                    Check your cart
                                </Link>{' '}
                            </div>
                        )}

                        <div className="italic">
                            PayPal sandbox account
                            <p>sb-4qwp825107022@personal.example.com</p>
                            <p>pwd: abcd1234</p>
                        </div>
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

export default CheckoutPage;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
    const db = getCustomerDb(req);
    const r = await db.customer.findFirst({
        include: {
            cart: { include: { items: true } },
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
