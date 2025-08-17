import Layout2Products from "@/components/Layout2Products";
import Navbar from "@/components/Navbar";

const Products = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow">
        <Layout2Products />
      </div>
    </div>
  );
};

export default Products;
