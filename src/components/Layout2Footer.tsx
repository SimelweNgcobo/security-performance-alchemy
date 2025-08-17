import { Droplets } from "lucide-react";
import { Link } from "react-router-dom";

const Layout2Footer = () => {
  const links = {
    products: [
      { name: "Pure Glass", href: "/products" },
      { name: "Crystal Clear", href: "/products" },
      { name: "Pure Sport", href: "/products" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Sustainability", href: "/sustainability" },
      { name: "Quality", href: "/quality" }
    ],
    support: [
      { name: "Contact", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Shipping", href: "/shipping" }
    ]
  };

  return (
    <footer className="py-24 px-6 md:px-12 bg-gradient-to-t from-primary/3 to-background border-t border-border/30 min-h-[400px]">
      <div className="max-w-6xl mx-auto">
        {/* Simple centered layout */}
        <div className="text-center space-y-12">
          {/* Logo and tagline */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-semibold text-foreground">MyFuze</span>
            </div>
            <p className="text-muted-foreground font-light max-w-md mx-auto">
              Pure water for a healthier, more sustainable lifestyle.
            </p>
          </div>

          {/* Three-column navigation */}
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h4 className="text-base font-medium text-foreground">Products</h4>
              <ul className="space-y-3">
                {links.products.map((link, index) => (
                  <li key={index}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-light">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-medium text-foreground">Company</h4>
              <ul className="space-y-3">
                {links.company.map((link, index) => (
                  <li key={index}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-light">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-medium text-foreground">Support</h4>
              <ul className="space-y-3">
                {links.support.map((link, index) => (
                  <li key={index}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-light">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-light">hello@myfuze.co.za</p>
            <p className="text-sm text-muted-foreground font-light">1-800-PURE-H2O</p>
          </div>

          {/* Simple divider and copyright */}
          <div className="space-y-4">
            <div className="w-24 h-px bg-border/50 mx-auto"></div>
            <p className="text-xs text-muted-foreground font-light">
              © 2024 MyFuze. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Layout2Footer;
