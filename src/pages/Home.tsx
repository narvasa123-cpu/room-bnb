import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/integrations/supabase/client';
import { Search, Home, Shield, MessageSquare } from 'lucide-react';

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('featured', true)
      .eq('status', 'available')
      .limit(6);

    if (data) setFeaturedProperties(data);
  };

  const handleSearch = () => {
    if (searchTerm) {
      window.location.href = `/properties?search=${encodeURIComponent(searchTerm)}`;
    } else {
      window.location.href = '/properties';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Find Your Perfect
              <span className="text-primary"> Boarding House</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with verified landlords and discover quality properties near you
            </p>

            <div className="flex gap-2 max-w-2xl mx-auto mt-8">
              <Input
                placeholder="Search by location, city, or property name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12"
              />
              <Button size="lg" onClick={handleSearch}>
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/properties">
                <Button size="lg" variant="default">
                  Browse Properties
                </Button>
              </Link>
              <Link to="/auth?mode=signup&role=landlord">
                <Button size="lg" variant="secondary">
                  List Your Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose BoardingFinder?</h2>
            <p className="text-muted-foreground">The easiest way to find your next home</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Quality Properties</h3>
              <p className="text-muted-foreground">
                Browse verified listings from trusted landlords
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure Booking</h3>
              <p className="text-muted-foreground">
                Safe and transparent reservation process
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Direct Communication</h3>
              <p className="text-muted-foreground">
                Chat directly with landlords and get instant responses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
              <p className="text-muted-foreground">Hand-picked properties just for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/properties">
                <Button size="lg" variant="outline">
                  View All Properties
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
