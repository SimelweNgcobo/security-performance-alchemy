import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Layout2Hero from "@/components/Layout2Hero";
import Layout2About from "@/components/Layout2About";
import Layout2Testimonials from "@/components/Layout2Testimonials";
import Layout2Contact from "@/components/Layout2Contact";
import Layout2Footer from "@/components/Layout2Footer";
import CustomLabelUpload from "@/components/CustomLabelUpload";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Layout2Hero />
        <Layout2About />
        <Layout2Testimonials />
        <section className="py-20 px-6 md:px-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Need a Custom Label?</h2>
              <p className="text-lg text-muted-foreground">Upload your design and our team will create your perfect label</p>
            </div>
            <CustomLabelUpload />
          </div>
        </section>
        <Layout2Contact />
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Index;
