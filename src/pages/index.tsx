import { type NextPage } from 'next';
import Head from 'next/head';
import Destinations from '../components/Destinations';
import { type Destination, getDestinations } from '../lib/strapi';

type Props = {
    destinations: Destination[];
};

const Home: NextPage<Props> = ({ destinations }) => {
    return (
        <>
            <Head>
                <title>Fantasy Trip</title>
                <meta name="description" content="A fantasy tour booking app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="min-h-screen">
                <div className="flex w-full flex-col items-center justify-center bg-[url('/img/home-banner.jpg')] py-28">
                    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                        <h2 className="text-3xl font-semibold text-white">Find your special tour today</h2>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                            With FantasyTrip
                        </h1>
                        <a className="btn-primary btn-lg btn">View Tours</a>
                    </div>
                </div>

                <div className="container mx-auto flex flex-col items-center justify-center bg-white py-20">
                    <h1 className="mb-12 text-3xl font-semibold">Our Destinations</h1>
                    <div>
                        <Destinations destinations={destinations} />
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;

export async function getStaticProps() {
    const destinations = await getDestinations();
    return {
        props: { destinations },
    };
}
