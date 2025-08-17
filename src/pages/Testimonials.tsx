import Layout2Testimonials from "@/components/Layout2Testimonials";
import Navbar from "@/components/Navbar";

const Testimonials = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow">
        <Layout2Testimonials />
      </div>
    </div>
  );
};

export default Testimonials;
