import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { z } from 'zod';
import { getAvailibility, getEventTypeForSlug } from '../../../lib/cal-com';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const bookingRouter = createTRPCRouter({
    isAvailable: publicProcedure
        .input(
            z.object({
                tour: z.string(),
                start: z.date(),
            })
        )
        .query(async ({ input }) => {
            const eventType = await getEventTypeForSlug(input.tour);
            if (!eventType) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Event-type for tour ${input.tour} not found`,
                });
            }
            const availability = await getAvailibility(eventType.id);
            console.log(`Event-type ${eventType.id} availability: ${JSON.stringify(availability)}`);
            return availability.busy.every(({ start, end }) => {
                const startMoment = dayjs(start);
                const endMoment = dayjs(end);
                const queryStart = dayjs(input.start);
                return queryStart.isBefore(startMoment) || queryStart.isAfter(endMoment);
            });
        }),

    getOccupiedDates: publicProcedure
        .input(
            z.object({
                tour: z.string(),
            })
        )
        .query(async ({ input }) => {
            const eventType = await getEventTypeForSlug(input.tour);
            if (!eventType) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Event-type for tour ${input.tour} not found`,
                });
            }
            const availability = await getAvailibility(eventType.id);
            return { dates: availability.busy.map(({ start }) => dayjs(start).startOf('day').toDate()) };
        }),
});
