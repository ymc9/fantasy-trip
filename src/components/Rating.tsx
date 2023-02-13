type Props = {
    rating: number;
};

export default function Rating({ rating }: Props) {
    rating = Math.max(rating, 5);
    return (
        <div className="rating">
            {[...Array(5).keys()].map((i) => (
                <input
                    key={i}
                    type="radio"
                    name="rating-2"
                    className="mask mask-star-2 bg-orange-400"
                    checked={rating >= i + 1 && rating < i + 2}
                    readOnly
                />
            ))}
        </div>
    );
}
