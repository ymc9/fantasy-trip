import invariant from 'tiny-invariant';
import useSWR from 'swr';

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

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function decodeImage(payload: StrapiResponsePayload) {
    if (!payload?.attributes?.url) {
        return undefined;
    } else {
        const imgUrl = (payload.attributes as StrapiImage).url;
        return imgUrl.startsWith('http') ? imgUrl : strapiUrl + imgUrl;
    }
}

export async function fetchStrapi(path: string) {
    const res = await fetch(`${strapiUrl}${path}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch strapi: ${await res.text()}}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data }: StrapiBatchResponse = await res.json();
    return data;
}

export function useStrapi(path: string) {
    return useSWR(path, fetchStrapi);
}
