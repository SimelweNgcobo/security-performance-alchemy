import Layout2Testimonials from "@/components/Layout2Testimonials";
import Layout2Footer from "@/components/Layout2Footer";
import Navbar from "@/components/Navbar";

const Testimonials = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow">
        <Layout2Testimonials />
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Testimonials;
