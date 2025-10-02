import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Calendar, CreditCard, Plus, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';

const LandlordDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [propertiesRes, reservationsRes, paymentsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .eq('landlord_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reservations')
          .select('*, properties!inner(landlord_id, title), profiles(full_name, email)')
          .eq('properties.landlord_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('*, reservations!inner(*, properties!inner(landlord_id))')
          .eq('reservations.properties.landlord_id', user?.id)
          .order('created_at', { ascending: false })
      ]);

      if (propertiesRes.data) setProperties(propertiesRes.data);
      if (reservationsRes.data) setReservations(reservationsRes.data);
      if (paymentsRes.data) setPayments(paymentsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleReservationAction = async (id: string, status: 'approved' | 'declined') => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update reservation');
    } else {
      toast.success(`Reservation ${status}`);
      fetchDashboardData();
    }
  };

  const handlePaymentVerification = async (id: string, verified: boolean) => {
    const { error } = await supabase
      .from('payments')
      .update({
        status: verified ? 'verified' : 'declined',
        verified_at: verified ? new Date().toISOString() : null,
        verified_by: user?.id
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update payment');
    } else {
      toast.success(`Payment ${verified ? 'verified' : 'declined'}`);
      fetchDashboardData();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Landlord Dashboard</h1>
            <p className="text-muted-foreground">Manage your properties and bookings</p>
          </div>
          <Button onClick={() => navigate('/property/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.filter(p => p.status === 'available').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReservations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>My Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No properties yet</p>
                  <Button onClick={() => navigate('/property/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {property.address}, {property.city}
                        </p>
                        <p className="text-lg font-bold text-primary mt-1">
                          ₱{property.rent.toLocaleString()}/month
                        </p>
                      </div>
                      <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/property/${property.id}`)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reservations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingReservations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending reservations</p>
                ) : (
                  pendingReservations.map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{reservation.properties?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Tenant: {reservation.profiles?.full_name || reservation.profiles?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check-in: {new Date(reservation.check_in).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleReservationAction(reservation.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReservationAction(reservation.id, 'declined')}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingPayments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending payments</p>
                ) : (
                  pendingPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">₱{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Method: {payment.method}
                          </p>
                          {payment.reference_number && (
                            <p className="text-sm text-muted-foreground">
                              Ref: {payment.reference_number}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      {payment.receipt_url && (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline block mb-2"
                        >
                          View Receipt
                        </a>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handlePaymentVerification(payment.id, true)}
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePaymentVerification(payment.id, false)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
