import type { GetStaticProps, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegClock } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import invariant from 'tiny-invariant';
import { getTour, getTours, type Tour as StrapiTour } from '../../lib/strapi';

type Props = {
    tour: StrapiTour;
};

const TourPage: NextPage<Props> = ({ tour }) => {
    invariant(tour.destination);
    return (
        <div className="mx-auto my-12 flex flex-col items-center">
            <div
                className="mx-auto flex w-full flex-col items-center justify-center bg-cover bg-center py-40 shadow-xl"
                style={{
                    backgroundImage: tour.images[0] ? `url(${tour.images[0]})` : undefined,
                }}
            ></div>

            <div className="mx-auto flex flex-col items-center">
                <h1 className="mt-16 self-start text-left text-4xl font-semibold">{tour.name}</h1>
                <div className="divider" />

                <div className="mt-8 flex w-full justify-center">
                    <div>
                        <section className="flex w-full items-center justify-start">
                            <FaRegClock />
                            <p className="ml-2">{tour.duration} HOURS</p>
                            <Link href={`/destinations/${tour.destination.slug}`}>
                                <p className="ml-4">
                                    {tour.destination.city}/{tour.destination.country}
                                </p>
                            </Link>
                        </section>

                        <section className="mt-8 w-full">
                            <Carousel>
                                {tour.images.map((image, i) => (
                                    <div key={i} className="h-96 w-full">
                                        <Image src={image} className="rounded-lg" fill={true} alt="tour image" />
                                    </div>
                                ))}
                            </Carousel>
                        </section>

                        <section className="prose mt-8">
                            <ReactMarkdown>{tour.description}</ReactMarkdown>
                        </section>
                        <section>
                            <h2 className="mt-12 text-2xl font-bold">Reviews</h2>
                        </section>
                    </div>
                    <div className="p-8">
                        <p>${tour.price.toFixed(2)}</p>
                        <form className="form-control">
                            <label className="label">
                                <span className="label-text">First Name</span>
                            </label>
                            <input type="text" required className="input-bordered input input-sm w-full max-w-xs" />
                            <label className="label">
                                <span className="label-text">Last Name</span>
                            </label>
                            <input type="text" required className="input-bordered input input-sm w-full max-w-xs" />
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input type="email" required className="input-bordered input input-sm w-full max-w-xs" />
                            <label className="label">
                                <span className="label-text">Date</span>
                            </label>
                            <input type="date" required className="input-bordered input input-sm w-full max-w-xs" />
                            <button className="btn-primary btn mt-4">Add to cart</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourPage;

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    invariant(params);
    const tour = await getTour(params.slug as string, true);

    if (tour) {
        console.log(tour);
        return {
            props: { tour },
        };
    } else {
        return {
            notFound: true,
        };
    }
};

export async function getStaticPaths() {
    const tours = await getTours();
    return {
        paths: tours.map((tour) => ({ params: { slug: tour.slug } })),
        fallback: false,
    };
}
