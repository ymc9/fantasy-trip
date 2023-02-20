import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Destinations from '../components/Destinations';
import Tour from '../components/Tour';
import { getDestinations, type Destination as StrapiDestination } from '../lib/destination';
import { getTours, type Tour as StrapiTour } from '../lib/tour';

type Props = {
    destinations: StrapiDestination[];
    tours: StrapiTour[];
};

const Home: NextPage<Props> = ({ destinations, tours }) => {
    return (
        <>
            <Head>
                <title>Fantasy Trip</title>
                <meta name="description" content="A fantasy tour booking app" />
                <link rel="icon" href="/img/baloon.png" />
            </Head>
            <main className="min-h-screen">
                <div className="flex w-full flex-col items-center justify-center bg-[url('/img/home-banner.jpg')] py-28">
                    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                        <h2 className="text-3xl font-semibold text-white">Find your special tour today</h2>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                            With FantasyTrip
                        </h1>
                        <Link className="btn-primary btn-lg btn" href="/tours">
                            View Tours
                        </Link>
                    </div>
                </div>

                <div className="mx-auto flex flex-col items-center justify-center bg-white py-20">
                    <div className="container flex w-full flex-col items-center">
                        <h1 className="mb-12 text-3xl font-semibold">Our Destinations</h1>
                        <div>
                            <Destinations destinations={destinations} />
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex flex-col items-center justify-center bg-slate-100 py-20">
                    <div className="container flex w-full flex-col items-center">
                        <h1 className="mb-12 text-3xl font-semibold">Most Popular Tours</h1>
                        <div className="flex flex-wrap justify-center gap-4">
                            {tours.map((tour) => (
                                <Link href={`/tours/${tour.slug}`} key={tour.slug}>
                                    <Tour tour={tour} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;

export async function getStaticProps() {
    const destinations = await getDestinations();
    const tours = await getTours();
    return {
        props: { destinations, tours },
    };
}
