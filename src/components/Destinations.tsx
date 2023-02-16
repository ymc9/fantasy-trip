import Link from 'next/link';
import type { Destination as StrapiDestination } from '../lib/destination';

type Props = {
    destinations: StrapiDestination[];
};

export default function Destinations({ destinations }: Props) {
    return (
        <ul className="flex gap-8">
            {destinations.map((dst) => (
                <li key={dst.id}>
                    <Destination destination={dst} />
                </li>
            ))}
        </ul>
    );
}

function Destination({ destination }: { destination: StrapiDestination }) {
    return (
        <Link href={`/destinations/${destination.slug}`}>
            <div
                className="flex h-52 w-52 items-center justify-center overflow-hidden rounded-full bg-cover shadow-lg"
                style={{ backgroundImage: `url(${destination.image})` }}
            >
                <div className="flex">
                    <p className="text-3xl font-semibold text-white">{destination.city}</p>
                    <p className="ml-2 self-end text-lg text-white">{destination.country}</p>
                </div>
            </div>
        </Link>
    );
}
