/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import invariant from 'tiny-invariant';

const CAL_COM_API_ENDPOINT = 'https://api.cal.com/v1';

invariant(process.env.CAL_COM_API_KEY, 'Missing CAL_COM_API_KEY');
const apiKey = process.env.CAL_COM_API_KEY;

export interface EventType {
    id: number;
    title: string;
    slug: string;
    length: number;
    hidden?: boolean;
    requiresConfirmation?: boolean;
    minimumBookingNotice?: number;
    description?: string;
    metadata?: object;
    locations: Array<{ address: string; type: string }>;
}

export async function getEventTypes() {
    const r = await fetch(`${CAL_COM_API_ENDPOINT}/event-types?apiKey=${apiKey}`);
    const { event_types: eventTypes }: { event_types: EventType[] } = await r.json();
    return eventTypes;
}

export async function createEventType(data: Omit<EventType, 'id'>): Promise<any> {
    console.log('createEventType', data);
    const fetchResult = await fetch(`${CAL_COM_API_ENDPOINT}/event-types?apiKey=${apiKey}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json',
        },
    });
    return fetchResult.json();
}

export async function updateEventType(id: number, data: Partial<Omit<EventType, 'id'>>) {
    const fetchResult = await fetch(`${CAL_COM_API_ENDPOINT}/event-types/${id}?apiKey=${apiKey}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json',
        },
    });
    return fetchResult.json();
}

export async function removeEventType(id: number) {
    const fetchResult = await fetch(`${CAL_COM_API_ENDPOINT}/event-types/${id}?apiKey=${apiKey}`, {
        method: 'DELETE',
    });
    return fetchResult.json();
}

export interface Booking {
    eventTypeId: number;
    name: string;
    email: string;
    notes?: string;
    start: string;
}

export async function createBooking(data: Booking) {
    const fetchResult = await fetch(`${CAL_COM_API_ENDPOINT}/bookings?apiKey=${apiKey}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json',
        },
    });
    return fetchResult.json();
}
