import type { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import Tour from '../../components/Tour';
import { getTours, type Tour as StrapiTour } from '../../lib/tour';

type Props = {
    tours: StrapiTour[];
};

const ToursPage: NextPage<Props> = ({ tours }) => {
    return (
        <main className="min-h-screen">
            <div className="flex w-full flex-col items-center justify-center bg-[url('/img/tours-banner.jpg')] py-28">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[5rem]">Our Tours</h1>
                </div>
            </div>
            <div className="container mx-auto flex flex-col">
                <div className="mt-12 flex w-full flex-wrap justify-start gap-4">
                    {tours.map((tour) => (
                        <Link key={tour.id} href={`/tours/${tour.slug}`}>
                            <Tour tour={tour} />
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default ToursPage;

export const getStaticProps: GetStaticProps<Props> = async () => {
    const tours = await getTours(undefined, true);
    return {
        props: { tours },
        revalidate: 60,
    };
};
