import Layout2About from "@/components/Layout2About";
import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Layout2About />
      </div>
    </div>
  );
};

export default About;
