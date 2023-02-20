import type { NextApiHandler } from 'next';
import invariant from 'tiny-invariant';
import { createEventType, getEventTypes, removeEventType, updateEventType } from '../../../lib/cal-com';
import { getTours } from '../../../lib/tour';

// synchronize strapi tours to cal.com event types
const handler: NextApiHandler = async (req, res) => {
    if (req.method === 'POST') {
        const tours = await getTours(undefined, true);
        console.log(tours);

        const eventTypes = await getEventTypes();
        console.log(eventTypes);

        const created: string[] = [];
        const updated: string[] = [];
        const deleted: string[] = [];

        for (const tour of tours) {
            invariant(tour.destination);

            const eventType = eventTypes.find((eventType) => eventType.slug === tour.slug);
            if (eventType) {
                console.log('Updating cal-com event type for', tour.slug);
                await updateEventType(eventType.id, {
                    title: tour.name,
                    length: tour.duration * 60,
                    requiresConfirmation: true,
                    locations: [
                        { address: `${tour.destination?.city} ${tour.destination?.country}`, type: 'inPerson' },
                    ],
                    metadata: {
                        tourId: tour.id,
                    },
                });
                updated.push(tour.slug);
            } else {
                console.log('Creating cal-com event type for', tour.slug);
                await createEventType({
                    title: tour.name,
                    slug: tour.slug,
                    requiresConfirmation: true,
                    length: tour.duration * 60,
                    locations: [
                        { address: `${tour.destination?.city} ${tour.destination?.country}`, type: 'inPerson' },
                    ],
                });
                created.push(tour.slug);
            }
        }

        for (const eventType of eventTypes) {
            if (!tours.find((tour) => tour.slug === eventType.slug)) {
                console.log('Deleting cal-com event type', eventType.slug);
                await removeEventType(eventType.id);
                deleted.push(eventType.slug);
            }
        }

        res.status(200).json({ status: 'ok', created, updated, deleted });
    } else {
        res.status(400).json({ error: 'Invalid http request method' });
    }
};

export default handler;
