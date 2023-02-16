import Image from 'next/image';
import type { Tour as StrapiTour } from '../lib/tour';
import Rating from './Rating';

type Props = {
    tour: StrapiTour;
};

export default function Tour({ tour }: Props) {
    return (
        <div className="card card-compact w-96 bg-base-100 shadow-xl">
            <figure className="relative h-72 w-full">
                {tour.images[0] && <Image className="object-cover" fill={true} src={tour.images[0]} alt={tour.name} />}
            </figure>
            <div className="card-body">
                <h2 className="card-title text-lg">{tour.name}</h2>
                <div className="flex w-full justify-between">
                    <Rating rating={tour.rating} />
                    <p className="text-right text-orange-500">${tour.price.toFixed(2)}</p>
                </div>
                <div className="card-actions justify-end">
                    <button className="btn-primary btn">Book Now</button>
                </div>
            </div>
        </div>
    );
}
