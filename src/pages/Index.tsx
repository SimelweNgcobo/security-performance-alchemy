import Layout2Hero from "@/components/Layout2Hero";
import Layout2Products from "@/components/Layout2Products";
import Layout2About from "@/components/Layout2About";
import Layout2Testimonials from "@/components/Layout2Testimonials";
import Layout2Contact from "@/components/Layout2Contact";
import Layout2Footer from "@/components/Layout2Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Layout2Hero />
      <Layout2Products />
      <Layout2About />
      <Layout2Testimonials />
      <Layout2Contact />
      <Layout2Footer />
    </div>
  );
};

export default Index;
