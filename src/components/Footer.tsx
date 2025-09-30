import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">BoardingFinder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting tenants with quality boarding houses and apartments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Tenants</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/properties" className="hover:text-primary">Browse Properties</Link></li>
              <li><Link to="/auth" className="hover:text-primary">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Landlords</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/auth?mode=signup&role=landlord" className="hover:text-primary">List Your Property</Link></li>
              <li><Link to="/dashboard/landlord" className="hover:text-primary">Landlord Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary">Help Center</Link></li>
              <li><Link to="#" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2024 BoardingFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
