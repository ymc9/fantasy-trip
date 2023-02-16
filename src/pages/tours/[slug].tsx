/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @next/next/no-img-element */
import dayjs from 'dayjs';
import type { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { FaRegClock } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import invariant from 'tiny-invariant';
import { useCart, useCustomer } from '../../lib/hooks';
import { getTour, getTours, type Tour as StrapiTour } from '../../lib/tour';
import { createId } from '@paralleldrive/cuid2';
import Cookies from 'js-cookie';
import Router from 'next/router';
import { useEffect } from 'react';

type Props = {
    tour: StrapiTour;
};

type Inputs = {
    firstName: string;
    lastName: string;
    email: string;
    date: string;
    quantity: number;
};

const TourPage: NextPage<Props> = ({ tour }) => {
    invariant(tour.destination);

    const { register, reset, handleSubmit } = useForm<Inputs>({
        defaultValues: {
            quantity: 1,
            date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        },
    });

    const { findFirst: loadCustomer, update: updateCustomer } = useCustomer();

    const { data: me } = loadCustomer({});
    const { upsert: upsertCart, create: createCart } = useCart();

    useEffect(() => {
        if (me) {
            console.log('Customer loaded:', me);
            reset({ firstName: me.firstName, lastName: me.lastName, email: me.email });
        }
    }, [reset, me]);

    const onAddCart: SubmitHandler<Inputs> = async (data) => {
        const customer = { firstName: data.firstName, lastName: data.lastName, email: data.email };
        const item = {
            tour: tour.slug,
            date: dayjs(data.date).toDate(),
            quantity: data.quantity,
        };

        console.log('Adding cart, customer:', customer, 'item:', item);

        if (me) {
            // update customer
            await updateCustomer({
                where: { id: me.id },
                data: customer,
            });

            // update customer's cart
            await upsertCart({
                where: {
                    customerId: me.id,
                },
                create: {
                    customer: {
                        connect: { id: me.id },
                    },
                    items: {
                        create: item,
                    },
                },
                update: {
                    items: {
                        create: item,
                    },
                },
            });
        } else {
            // create a new customer and cart
            const customerId = createId();
            await createCart({
                data: {
                    customer: {
                        create: { id: customerId, ...customer },
                    },
                    items: {
                        create: item,
                    },
                },
            });

            Cookies.set('ft-customer-id', customerId, { expires: 365, path: '/' });
        }

        await Router.push('/cart');
    };

    return (
        <div className="mx-auto my-12 flex flex-col items-center">
            <div
                className="mx-auto flex w-full flex-col items-center justify-center bg-cover bg-center py-40 shadow-xl"
                style={{
                    backgroundImage: tour.images[0] ? `url(${tour.images[0]})` : undefined,
                }}
            ></div>

            <div className="container mx-auto flex flex-col items-center">
                <h1 className="mt-16 self-start text-left text-4xl font-semibold">{tour.name}</h1>
                <div className="divider" />

                <div className="mt-8 flex w-full justify-center">
                    <div>
                        <section className="flex w-full items-center justify-start">
                            <FaRegClock />
                            <p className="ml-2">{tour.duration} HOURS</p>
                            <Link href={`/destinations/${tour.destination.slug}`}>
                                <p className="ml-4">
                                    {tour.destination.city}/{tour.destination.country}
                                </p>
                            </Link>
                        </section>

                        <section className="mt-8 w-full">
                            {tour.images.length && (
                                <Carousel className="max-w-2xl" autoPlay infiniteLoop showStatus={false}>
                                    {tour.images.map((image, i) => (
                                        <div key={i}>
                                            <img src={image} className="rounded-lg" alt="tour image" />
                                        </div>
                                    ))}
                                </Carousel>
                            )}
                        </section>

                        <section className="prose mt-8">
                            <ReactMarkdown>{tour.description}</ReactMarkdown>
                        </section>
                        <section>
                            <h2 className="mt-12 text-2xl font-bold">Reviews</h2>
                        </section>
                    </div>
                    <div className="p-8">
                        <p>${tour.price.toFixed(2)}</p>

                        <form className="form-control" onSubmit={handleSubmit(onAddCart)}>
                            <label className="label">
                                <span className="label-text">First Name</span>
                            </label>
                            <input
                                type="text"
                                className="input-bordered input input-sm w-full max-w-xs"
                                required
                                {...register('firstName')}
                            />

                            <label className="label">
                                <span className="label-text">Last Name</span>
                            </label>
                            <input
                                type="text"
                                required
                                className="input-bordered input input-sm w-full max-w-xs"
                                {...register('lastName')}
                            />

                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                required
                                className="input-bordered input input-sm w-full max-w-xs"
                                {...register('email')}
                            />

                            <label className="label">
                                <span className="label-text">Date</span>
                            </label>
                            <input
                                type="date"
                                required
                                className="input-bordered input input-sm w-full max-w-xs"
                                {...register('date')}
                            />

                            <label className="label">
                                <span className="label-text"># Adult</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="input-bordered input input-sm w-full max-w-xs"
                                {...register('quantity', { valueAsNumber: true })}
                            />

                            <input type="submit" className="btn-primary btn mt-4" />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourPage;

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    invariant(params);
    const tour = await getTour(params.slug as string, true);

    if (tour) {
        return {
            props: { tour },
        };
    } else {
        return {
            notFound: true,
        };
    }
};

export async function getStaticPaths() {
    const tours = await getTours();
    return {
        paths: tours.map((tour) => ({ params: { slug: tour.slug } })),
        fallback: false,
    };
}
