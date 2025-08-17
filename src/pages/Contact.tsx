import Layout2Contact from "@/components/Layout2Contact";
import Navbar from "@/components/Navbar";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow">
        <Layout2Contact />
      </div>
    </div>
  );
};

export default Contact;
