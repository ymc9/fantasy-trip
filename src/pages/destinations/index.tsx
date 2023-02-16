import { type NextPage } from 'next';
import Link from 'next/link';
import { type Destination as StrapiDestination, getDestinations } from '../../lib/destination';

type Props = {
    destinations: StrapiDestination[];
};

const DestinationsPage: NextPage<Props> = ({ destinations }) => {
    return (
        <main className="min-h-screen">
            <div className="flex w-full flex-col items-center justify-center bg-[url('/img/destinations-banner.jpg')] py-28">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                        Our Destinations
                    </h1>
                </div>
            </div>
            <div className="container mx-auto flex flex-col">
                <div className="mt-12 flex w-full flex-wrap justify-start gap-4">
                    {destinations.map((dst) => (
                        <Link key={dst.id} href={`/destinations/${dst.slug}`}>
                            <div
                                className="flex h-80 w-80 items-center justify-center rounded-xl bg-cover shadow-xl"
                                style={{ backgroundImage: `url(${dst.image})` }}
                            >
                                <div className="flex items-baseline">
                                    <p className="text-3xl font-semibold text-white">{dst.city}</p>
                                    <p className="ml-2 text-xl text-white ">{dst.country}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default DestinationsPage;

export async function getStaticProps() {
    const destinations = await getDestinations(true);
    return {
        props: { destinations },
    };
}
