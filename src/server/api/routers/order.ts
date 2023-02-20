import { OrderStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import invariant from 'tiny-invariant';
import { z } from 'zod';
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
    // complete an order
    complete: publicProcedure
        .input(
            z.object({
                orderId: z.string(),
                captureDetails: z.object({ id: z.string(), status: z.string() }),
            })
        )
        .mutation(async ({ input }) => {
            // fetch order from paypal to check if it's completed
            // TODO: should check payment amout as well
            const r = await fetch(`${paypalEndpoint}/v2/checkout/orders/${input.captureDetails.id}`, {
                headers: {
                    Authorization: paypalAuth,
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const data: { status: string } = await r.json();
            console.log('Paypal order data', data);

            if (data.status === 'COMPLETED') {
                // mark order completed
                console.log('Marking order PAID', input.orderId);
                await prisma.order.update({
                    where: { id: input.orderId },
                    data: {
                        status: OrderStatus.PAID,
                        captureDetails: data,
                    },
                });
            } else {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'the order is not paid yet',
                });
            }
        }),
});
