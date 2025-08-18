import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";

const Enterprise = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              Enterprise
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Coming soon...
            </p>
          </div>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Enterprise;
