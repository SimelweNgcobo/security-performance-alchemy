import Layout2Products from "@/components/Layout2Products";
import Navbar from "@/components/Navbar";

const Products = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Layout2Products />
      </div>
    </div>
  );
};

export default Products;
