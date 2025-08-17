import Layout2About from "@/components/Layout2About";
import Layout2Footer from "@/components/Layout2Footer";
import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow">
        <Layout2About />
      </div>
      <Layout2Footer />
    </div>
  );
};

export default About;
