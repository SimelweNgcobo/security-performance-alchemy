import Layout2Testimonials from "@/components/Layout2Testimonials";
import Navbar from "@/components/Navbar";

const Testimonials = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Layout2Testimonials />
      </div>
    </div>
  );
};

export default Testimonials;
