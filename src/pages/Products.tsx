import Layout2Products from "@/components/Layout2Products";
import Layout2Footer from "@/components/Layout2Footer";
import Navbar from "@/components/Navbar";

const Products = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow">
        <Layout2Products />
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Products;
