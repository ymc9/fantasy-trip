import invariant from 'tiny-invariant';

invariant(process.env.NEXT_PUBLIC_STRAPI_API_URL, 'Missing NEXT_PUBLIC_STRAPI_API_URL');
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export interface StrapiResponsePayload {
    id: number;
    attributes: Record<string, unknown>;
}

export interface StrapiSingleResponse {
    data: StrapiResponsePayload;
}

export interface StrapiBatchResponse {
    data: Array<StrapiResponsePayload>;
}

export interface StrapiEntity {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
}

export interface StrapiImage extends Record<string, unknown> {
    name: string;
    width: number;
    height: number;
    url: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Destination extends StrapiEntity {
    country: string;
    city: string;
    description: string;
    slug: string;
    image: string;
    bannerImage: string;
    tours?: Tour[];
}

export interface Tour extends StrapiEntity {
    id: number;
    name: string;
    description: string;
    slug: string;
    price: number;
    duration: number;
    rating: number;
    images: string[];
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function decodeImage(payload: StrapiResponsePayload) {
    if (!payload?.attributes?.url) {
        return undefined;
    } else {
        return strapiUrl + (payload.attributes as StrapiImage).url;
    }
}

async function fetchStrapi(path: string) {
    const res = await fetch(`${strapiUrl}${path}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data }: StrapiBatchResponse = await res.json();
    return data;
}

export async function getDestinations(includeTours = false) {
    const populate = ['populate[image]=*', 'populate[bannerImage]=*'];
    if (includeTours) {
        populate.push('populate[tours][populate]=*');
    }
    const data = await fetchStrapi(`/api/destinations?${populate.join('&')}}`);
    return data.map((item) => makeDestination(item));
}

export async function getDestination(slug: string, includeTours = false) {
    const populate = ['populate[image]=*', 'populate[bannerImage]=*'];
    if (includeTours) {
        populate.push('populate[tours][populate]=*');
    }
    const data = await fetchStrapi(`/api/destinations?filters[slug][$eq]=${slug}&${populate.join('&')}`);
    return data[0] ? makeDestination(data[0]) : undefined;
}

export async function getToursForDestination(destination: string) {
    const data = await fetchStrapi(`/api/tours?filters[destination][slug][$eq]=${destination}&populate=images`);
    return data[0] ? makeTour(data[0]) : undefined;
}

function makeDestination(payload: StrapiResponsePayload) {
    return {
        id: payload.id,
        country: payload.attributes.country,
        city: payload.attributes.city,
        createdAt: new Date(payload.attributes.createdAt as string),
        updatedAt: new Date(payload.attributes.updatedAt as string),
        description: payload.attributes.description,
        slug: payload.attributes.slug,
        image: decodeImage((payload.attributes.image as StrapiSingleResponse).data),
        bannerImage: decodeImage((payload.attributes.bannerImage as StrapiSingleResponse)?.data),
        tours: payload.attributes.tours
            ? (payload.attributes.tours as StrapiBatchResponse).data.map((tour) => makeTour(tour))
            : undefined,
    } as Destination;
}

function makeTour(payload: StrapiResponsePayload) {
    return {
        id: payload.id,
        name: payload.attributes.name,
        description: payload.attributes.description,
        slug: payload.attributes.slug,
        price: payload.attributes.price,
        duration: payload.attributes.duration,
        rating: payload.attributes.rating,
        images: (payload.attributes.images as StrapiBatchResponse).data.map((image) => decodeImage(image)),
    } as Tour;
}
