import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Layout2Hero from "@/components/Layout2Hero";
import Layout2Products from "@/components/Layout2Products";
import Layout2About from "@/components/Layout2About";
import Layout2Testimonials from "@/components/Layout2Testimonials";
import Layout2Contact from "@/components/Layout2Contact";
import Layout2Footer from "@/components/Layout2Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Layout2Hero />
        <Layout2Products />
        <Layout2About />
        <Layout2Testimonials />
        <Layout2Contact />
      </div>
      <Layout2Footer />
      
      {/* Admin Access Link - Hidden at bottom */}
      <div className="p-4 text-center bg-muted">
        <Link to="/admin-auth" className="text-sm text-muted-foreground hover:text-primary">
          Admin Access
        </Link>
      </div>
    </div>
  );
};

export default Index;
