import Layout2Contact from "@/components/Layout2Contact";
import Layout2Footer from "@/components/Layout2Footer";
import Navbar from "@/components/Navbar";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow">
        <Layout2Contact />
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Contact;
