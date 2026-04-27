import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
}

export default function StarRating({ rating, max = 5, size = 16 }: StarRatingProps) {
  const normalizedRating = (rating / 10) * max;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.floor(normalizedRating)
              ? 'fill-accent-gold text-accent-gold'
              : i < normalizedRating
                ? 'fill-accent-gold/50 text-accent-gold'
                : 'text-text-muted'
          }
        />
      ))}
      <span className="ml-1 font-mono text-sm text-text-secondary">{rating.toFixed(1)}</span>
    </div>
  );
}
