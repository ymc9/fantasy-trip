import { OrderStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { createBooking, getEventTypeForSlug } from '../../../lib/cal-com';
import { getTour } from '../../../lib/tour';
import { prisma } from '../../db';
import { createTRPCRouter, publicProcedure } from '../trpc';

invariant(process.env.PAYPAL_API_ENDPOINT);
invariant(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
invariant(process.env.PAYPAL_CLIENT_SECRET);

const paypalEndpoint = process.env.PAYPAL_API_ENDPOINT;
const paypalAuth = `Basic ${Buffer.from(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_CLIENT_SECRET
).toString('base64')}`;

export const orderRouter = createTRPCRouter({
    // create an order
    create: publicProcedure
        .input(
            z.object({
                customerId: z.string(),
                items: z.array(z.object({ tour: z.string(), date: z.date(), quantity: z.number().positive() })),
                captureDetails: z.object({ id: z.string(), status: z.string() }),
            })
        )
        .mutation(async ({ input }) => {
            // fetch order from paypal to check if it's completed
            // TODO: should check payment amount as well
            const r = await fetch(`${paypalEndpoint}/v2/checkout/orders/${input.captureDetails.id}`, {
                headers: {
                    Authorization: paypalAuth,
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const data: { status: string } = await r.json();
            console.log('Paypal order data', data);

            if (data.status === 'COMPLETED') {
                const order = await prisma.order.create({
                    include: { customer: true, items: true },
                    data: {
                        customer: { connect: { id: input.customerId } },
                        items: {
                            create: input.items,
                        },
                        status: OrderStatus.PAID,
                        captureDetails: data,
                    },
                });
                console.log('Created order:', order);

                await Promise.all(
                    order.items.map(async (item) => {
                        const tour = await getTour(item.tour, true);
                        if (!tour) {
                            throw new TRPCError({
                                code: 'BAD_REQUEST',
                                message: `Tour not found for slug ${item.tour}`,
                            });
                        }
                        invariant(tour.destination);

                        const eventType = await getEventTypeForSlug(item.tour);
                        if (!eventType) {
                            throw new TRPCError({
                                code: 'BAD_REQUEST',
                                message: `Event type not found for tour ${item.tour}`,
                            });
                        }

                        const booking = await createBooking({
                            eventTypeId: eventType.id,
                            name: `${order.customer.firstName} ${order.customer.lastName}`,
                            email: order.customer.email,
                            start: dayjs(item.date).toString(),
                            end: dayjs(item.date).add(tour.duration, 'hours').toString(),
                            description: `Booking for tour ${tour.name}`,
                            location: `${tour.destination.city} ${tour.destination.country}`,
                        });
                        console.log(`Created booking: ${JSON.stringify(booking)}`);

                        await prisma.orderItem.update({
                            where: {
                                id: item.id,
                            },
                            data: {
                                bookingId: booking.id,
                            },
                        });
                    })
                );

                return order;
            } else {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'the order is not paid yet',
                });
            }
        }),
});
