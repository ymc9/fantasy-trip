import { type Destination, makeDestination } from './destination';
import {
    decodeImage,
    fetchStrapi,
    useStrapi,
    type StrapiBatchResponse,
    type StrapiEntity,
    type StrapiResponsePayload,
    type StrapiSingleResponse,
} from './strapi';

export interface Tour extends StrapiEntity {
    id: number;
    name: string;
    description: string;
    slug: string;
    price: number;
    duration: number;
    rating: number;
    images: string[];
    destination?: Destination;
}

export function useTours(destination?: string, includeDestination = false) {
    const path = buildQueryForDestination(includeDestination, destination);
    const r = useStrapi(path);
    return { ...r, data: r.data ? r.data.map((item) => makeTour(item)) : [] };
}

export async function getTours(destination?: string, includeDestination = false) {
    const path = buildQueryForDestination(includeDestination, destination);
    const data = await fetchStrapi(path);
    return data.map((item) => makeTour(item));
}

export function useTour(slug: string, includeDestination = false) {
    const path = buildQueryForSlug(includeDestination, slug);
    const r = useStrapi(path);
    return { ...r, data: r.data?.[0] ? makeTour(r.data[0]) : undefined };
}

export async function getTour(slug: string, includeDestination = false) {
    const path = buildQueryForSlug(includeDestination, slug);
    const data = await fetchStrapi(path);
    return data?.[0] ? makeTour(data[0]) : undefined;
}

function buildQueryForDestination(includeDestination: boolean, destination: string | undefined) {
    const populate = ['populate[images]=*'];
    if (includeDestination) {
        populate.push('populate[destination][populate]=*');
    }
    const path = destination
        ? `/api/tours?filters[destination][slug][$eq]=${destination}&${populate.join('&')}`
        : `/api/tours?${populate.join('&')}`;
    return path;
}

function buildQueryForSlug(includeDestination: boolean, slug: string) {
    const populate = ['populate[images]=*'];
    if (includeDestination) {
        populate.push('populate[destination][populate]=*');
    }
    return `/api/tours?filters[slug][$eq]=${slug}&${populate.join('&')}`;
}

export function makeTour(payload: StrapiResponsePayload): Tour {
    return {
        id: payload.id,
        name: payload.attributes.name,
        description: payload.attributes.description,
        slug: payload.attributes.slug,
        price: payload.attributes.price,
        duration: payload.attributes.duration,
        rating: payload.attributes.rating,
        images: (payload.attributes.images as StrapiBatchResponse)?.data.map((image) => decodeImage(image)),
        destination: payload.attributes.destination
            ? makeDestination((payload.attributes.destination as StrapiSingleResponse).data)
            : undefined,
    } as Tour;
}
