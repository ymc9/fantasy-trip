/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import dayjs from 'dayjs';
import invariant from 'tiny-invariant';

const CAL_COM_API_ENDPOINT = 'https://api.cal.com/v1';

invariant(process.env.CAL_COM_API_KEY, 'Missing CAL_COM_API_KEY');
const apiKey = process.env.CAL_COM_API_KEY;

invariant(process.env.CAL_COM_USERNAME, 'Missing CAL_COM_USERNAME');
const username = process.env.CAL_COM_USERNAME;

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
    const fetchResult = await fetch(`${CAL_COM_API_ENDPOINT}/event-types?apiKey=${apiKey}`);
    if (!fetchResult.ok) {
        throw new Error(`Failed to fetch event types: ${JSON.stringify(await fetchResult.text())}`);
    }
    const { event_types: eventTypes }: { event_types: EventType[] } = await fetchResult.json();
    return eventTypes;
}

export async function getEventTypeForSlug(slug: string) {
    const all = await getEventTypes();
    return all.find((eventType) => eventType.slug === slug);
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
    if (!fetchResult.ok) {
        throw new Error(`Failed to create event type: ${JSON.stringify(await fetchResult.text())}`);
    }
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
    if (!fetchResult.ok) {
        throw new Error(`Failed to update event type: ${JSON.stringify(await fetchResult.text())}`);
    }
    return fetchResult.json();
}

export async function removeEventType(id: number) {
    const fetchResult = await fetch(`${CAL_COM_API_ENDPOINT}/event-types/${id}?apiKey=${apiKey}`, {
        method: 'DELETE',
    });
    if (!fetchResult.ok) {
        throw new Error(`Failed to remove event type: ${JSON.stringify(await fetchResult.text())}`);
    }
    return fetchResult.json();
}

export interface Booking {
    id: number;
    eventTypeId: number;
    name: string;
    email: string;
    notes?: string;
    start: string;
    end: string;
    location: string;
    description: string;
    metadata?: object;
}

export async function createBooking(data: Omit<Booking, 'id'>) {
    const bookingData = {
        ...data,
        language: 'en',
        timeZone: 'America/Los_Angeles',
        metadata: data.metadata ?? {},
        customInputs: [],
    };
    console.log('createBooking', bookingData);
    const fetchResult = await fetch(`${CAL_COM_API_ENDPOINT}/bookings?apiKey=${apiKey}`, {
        method: 'POST',
        body: JSON.stringify(bookingData),
        headers: {
            'content-type': 'application/json',
        },
    });
    if (!fetchResult.ok) {
        throw new Error(`Failed to create booking: ${JSON.stringify(await fetchResult.text())}`);
    }
    return (await fetchResult.json()) as Booking;
}

export interface Availability {
    busy: Array<{ start: string; end: string }>;
    timeZone: string;
}

export async function getAvailibility(eventTypeId: number): Promise<Availability> {
    const query = `${CAL_COM_API_ENDPOINT}/availability?apiKey=${apiKey}&username=${username}&dateFrom=${dayjs().format(
        'YYYY-MM-DD'
    )}&dateTo=${dayjs().add(1, 'years').format('YYYY-MM-DD')}&eventTypeId=${eventTypeId}`;
    console.log(query);
    const fetchResult = await fetch(query);
    if (!fetchResult.ok) {
        throw new Error(`Failed to get availibility: ${JSON.stringify(await fetchResult.text())}`);
    }
    return fetchResult.json();
}
