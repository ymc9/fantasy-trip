import type { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import invariant from 'tiny-invariant';
import Tour from '../../components/Tour';
import { getDestination, getDestinations, type Destination as StrapiDestination } from '../../lib/strapi';

type Props = {
    destination: StrapiDestination;
};

const DestinationPage: NextPage<Props> = ({ destination }) => {
    return (
        <div className="mx-auto mt-12 flex flex-col items-center">
            <div
                className="mx-auto flex w-full flex-col items-center justify-center bg-center py-40 shadow-xl"
                style={{ backgroundImage: `url(${destination.bannerImage})` }}
            >
                <h1 className="text-5xl font-semibold text-white">
                    {destination.city} of {destination.country}
                </h1>
                <p className="mt-10 max-w-3xl text-center text-xl text-white">{destination.description}</p>
            </div>

            <div className="container flex flex-wrap justify-start gap-8 py-16">
                {destination.tours &&
                    destination.tours.map((tour) => (
                        <Link key={tour.id} href={`/tours/${tour.slug}`}>
                            <Tour tour={tour} />
                        </Link>
                    ))}
            </div>
        </div>
    );
};

export default DestinationPage;

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    invariant(params);
    const destination = await getDestination(params.slug as string, true);

    if (destination) {
        return {
            props: { destination },
        };
    } else {
        return {
            notFound: true,
        };
    }
};

export async function getStaticPaths() {
    const destinations = await getDestinations();
    return {
        paths: destinations.map((dst) => ({ params: { slug: dst.slug } })),
        fallback: false,
    };
}
