import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Star, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [landlord, setLandlord] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);

      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      const { data: landlordData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', propertyData.landlord_id)
        .single();

      if (landlordData) setLandlord(landlordData);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('property_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (reviewsData) setReviews(reviewsData);
    } catch (error: any) {
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error('Please sign in to book a property');
      navigate('/auth');
      return;
    }

    if (role !== 'tenant') {
      toast.error('Only tenants can book properties');
      return;
    }

    navigate(`/booking/${id}`);
  };

  const handleContactLandlord = () => {
    if (!user) {
      toast.error('Please sign in to contact the landlord');
      navigate('/auth');
      return;
    }

    navigate(`/messages?user=${property.landlord_id}&property=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src={property.images?.[0] || '/placeholder.svg'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 right-4" variant={property.status === 'available' ? 'default' : 'secondary'}>
                {property.status}
              </Badge>
            </div>

            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.slice(1, 5).map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${property.title} ${idx + 2}`}
                    className="h-24 w-full object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{property.title}</CardTitle>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}, {property.city}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{property.bedrooms} Bedrooms</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{property.bathrooms} Bathrooms</span>
                    </div>
                  )}
                  {property.area_sqm && (
                    <div className="flex items-center">
                      <Square className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{property.area_sqm} m²</span>
                    </div>
                  )}
                </div>

                {reviews.length > 0 && (
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-secondary fill-secondary mr-2" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-2">({reviews.length} reviews)</span>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>

                {property.facilities && property.facilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Facilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.facilities.map((facility: string, idx: number) => (
                        <Badge key={idx} variant="outline">{facility}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{review.profiles?.full_name || 'Anonymous'}</div>
                          <div className="flex items-center">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-secondary fill-secondary" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-primary">
                  ₱{property.rent.toLocaleString()}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </CardTitle>
                {property.deposit && (
                  <p className="text-sm text-muted-foreground">
                    Deposit: ₱{property.deposit.toLocaleString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {property.status === 'available' && (
                  <Button className="w-full" size="lg" onClick={handleBookNow}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={handleContactLandlord}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Landlord
                </Button>
              </CardContent>
            </Card>

            {landlord && (
              <Card>
                <CardHeader>
                  <CardTitle>Landlord</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      {landlord.avatar_url ? (
                        <img src={landlord.avatar_url} alt={landlord.full_name} className="h-12 w-12 rounded-full" />
                      ) : (
                        <span className="text-lg font-semibold">{landlord.full_name?.[0] || 'L'}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{landlord.full_name}</p>
                      <p className="text-sm text-muted-foreground">{landlord.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
