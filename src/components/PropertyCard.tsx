import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Star } from 'lucide-react';

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  city: string;
  rent: number;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  status: string;
  featured?: boolean;
  averageRating?: number;
}

const PropertyCard = ({
  id,
  title,
  address,
  city,
  rent,
  images,
  bedrooms,
  bathrooms,
  area_sqm,
  status,
  featured,
  averageRating,
}: PropertyCardProps) => {
  const imageUrl = images && images.length > 0 ? images[0] : '/placeholder.svg';

  return (
    <Link to={`/property/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          {featured && (
            <Badge className="absolute top-2 left-2 bg-secondary">
              Featured
            </Badge>
          )}
          <Badge
            className="absolute top-2 right-2"
            variant={status === 'available' ? 'default' : 'secondary'}
          >
            {status}
          </Badge>
        </div>

        <CardHeader className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{city}</span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {bedrooms && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{bathrooms}</span>
              </div>
            )}
            {area_sqm && (
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                <span>{area_sqm}m²</span>
              </div>
            )}
          </div>

          {averageRating && (
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-secondary fill-secondary mr-1" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="w-full">
            <p className="text-2xl font-bold text-primary">
              ₱{rent.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PropertyCard;
