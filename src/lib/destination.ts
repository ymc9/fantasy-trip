import {
    decodeImage,
    type StrapiBatchResponse,
    type StrapiEntity,
    type StrapiResponsePayload,
    type StrapiSingleResponse,
    useStrapi,
    fetchStrapi,
} from './strapi';
import { makeTour, type Tour } from './tour';

export interface Destination extends StrapiEntity {
    country: string;
    city: string;
    description: string;
    slug: string;
    image: string;
    bannerImage: string;
    tours?: Tour[];
}

export function useDestinations(includeTours = false) {
    const r = useStrapi(buildQuery(undefined, includeTours));
    return { ...r, data: r.data?.map((item) => makeDestination(item)) };
}

export async function getDestinations(includeTours = false) {
    const data = await fetchStrapi(buildQuery(undefined, includeTours));
    return data.map((item) => makeDestination(item));
}

export function useDestination(slug: string, includeTours = false) {
    const r = useStrapi(buildQuery(slug, includeTours));
    return { ...r, data: r.data?.[0] ? makeDestination(r.data[0]) : undefined };
}

export async function getDestination(slug: string, includeTours = false) {
    const data = await fetchStrapi(buildQuery(slug, includeTours));
    return data[0] ? makeDestination(data[0]) : undefined;
}

function buildQuery(slug: string | undefined, includeTours: boolean) {
    const populate = ['populate[image]=*', 'populate[bannerImage]=*'];
    if (includeTours) {
        populate.push('populate[tours][populate]=*');
    }
    const path = slug
        ? `/api/destinations?filters[slug][$eq]=${slug}&${populate.join('&')}`
        : `/api/destinations?${populate.join('&')}`;
    return path;
}

export function makeDestination(payload: StrapiResponsePayload): Destination {
    return {
        id: payload.id,
        country: payload.attributes.country,
        city: payload.attributes.city,
        createdAt: new Date(payload.attributes.createdAt as string),
        updatedAt: new Date(payload.attributes.updatedAt as string),
        description: payload.attributes.description,
        slug: payload.attributes.slug,
        image: decodeImage((payload.attributes.image as StrapiSingleResponse)?.data),
        bannerImage: decodeImage((payload.attributes.bannerImage as StrapiSingleResponse)?.data),
        tours: payload.attributes.tours
            ? (payload.attributes.tours as StrapiBatchResponse).data.map((tour) => makeTour(tour))
            : undefined,
    } as Destination;
}
