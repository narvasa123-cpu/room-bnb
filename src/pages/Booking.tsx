import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || role !== 'tenant') {
      toast.error('Only tenants can make bookings');
      navigate('/');
      return;
    }

    fetchProperty();
  }, [id, user, role]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles(full_name, email)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      toast.error('Failed to load property');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn) {
      toast.error('Please select a check-in date');
      return;
    }

    setSubmitting(true);

    try {
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          property_id: id,
          tenant_id: user?.id,
          check_in: checkIn,
          check_out: checkOut || null,
          notes,
          status: 'pending'
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      await supabase.from('notifications').insert({
        user_id: property.landlord_id,
        type: 'booking',
        title: 'New Booking Request',
        message: `You have a new booking request for ${property.title}`,
        link: `/dashboard/landlord`
      });

      toast.success('Booking request submitted! Waiting for landlord approval.');
      navigate('/dashboard/tenant');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Book Property</h1>
          <p className="text-muted-foreground mb-8">Fill in the details to request a booking</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="checkIn">Check-in Date *</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="checkOut">Check-out Date (Optional)</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Leave empty for indefinite stay
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requests or information for the landlord..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Booking Request'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Property Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.images?.[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {property.address}, {property.city}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-2xl font-bold text-primary">
                      ₱{property.rent.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </p>
                    {property.deposit && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Deposit: ₱{property.deposit.toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
