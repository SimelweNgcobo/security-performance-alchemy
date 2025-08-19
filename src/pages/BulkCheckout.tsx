import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Truck, CreditCard, CheckCircle, ArrowLeft, Package, MapPin, Palette, Droplets } from "lucide-react";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import { toast } from "sonner";
import { PaystackButton } from 'react-paystack';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Pricing data structure
const pricingData = {
  "500ml": [
    { min: 1, max: 10, price: 10, notes: "Retail / single bottle" },
    { min: 11, max: 50, price: 9, notes: "Small packs" },
    { min: 51, max: 100, price: 8, notes: "Small events" },
    { min: 101, max: 500, price: 7.50, notes: "Bulk" },
    { min: 501, max: 1000, price: 7.00, notes: "Entry bulk" },
    { min: 1001, max: 2500, price: 6.80, notes: "Corporate" },
    { min: 2501, max: 5000, price: 6.50, notes: "Large bulk" },
    { min: 5001, max: 10000, price: 6.00, notes: "Mass supply" }
  ],
  "1L": [
    { min: 1, max: 10, price: 15, notes: "" },
    { min: 11, max: 50, price: 13.50, notes: "" },
    { min: 51, max: 100, price: 12.50, notes: "" },
    { min: 101, max: 500, price: 12.00, notes: "" },
    { min: 501, max: 1000, price: 11.50, notes: "" },
    { min: 1001, max: 5000, price: 11.00, notes: "" },
    { min: 5001, max: 10000, price: 10.50, notes: "" }
  ],
  "1.5L": [
    { min: 1, max: 10, price: 14, notes: "" },
    { min: 11, max: 50, price: 13.50, notes: "" },
    { min: 51, max: 100, price: 13, notes: "" },
    { min: 101, max: 500, price: 12.50, notes: "" },
    { min: 501, max: 1000, price: 12, notes: "" },
    { min: 1001, max: 5000, price: 11.80, notes: "" },
    { min: 5001, max: 10000, price: 11.50, notes: "" }
  ],
  "2L": [
    { min: 1, max: 10, price: 16, notes: "" },
    { min: 11, max: 50, price: 15.50, notes: "" },
    { min: 51, max: 100, price: 15, notes: "" },
    { min: 101, max: 500, price: 14.50, notes: "" },
    { min: 501, max: 1000, price: 14, notes: "" },
    { min: 1001, max: 5000, price: 13.80, notes: "" },
    { min: 5001, max: 10000, price: 13.50, notes: "" }
  ],
  "5L": [
    { min: 1, max: 10, price: 25, notes: "" },
    { min: 11, max: 50, price: 24, notes: "" },
    { min: 51, max: 100, price: 23, notes: "" },
    { min: 101, max: 500, price: 22.50, notes: "" },
    { min: 501, max: 1000, price: 22, notes: "" },
    { min: 1001, max: 5000, price: 21.50, notes: "" },
    { min: 5001, max: 10000, price: 21, notes: "" }
  ]
};

type BottleSize = keyof typeof pricingData;

interface ShippingAddress {
  fullName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

// Removed PaymentDetails interface since we use Paystack for all payment processing

const BulkCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState<BottleSize>("500ml");
  const [quantity, setQuantity] = useState<number>(1);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    phone: ""
  });
  // Removed paymentDetails state since Paystack handles all payment processing

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to access bulk purchasing");
      navigate('/auth');
    }
  }, [user, navigate]);

  // Calculate price based on quantity and size
  useEffect(() => {
    const pricing = pricingData[selectedSize];
    const tier = pricing.find(p => quantity >= p.min && quantity <= p.max);
    if (tier) {
      setCurrentPrice(tier.price);
      setTotal(quantity * tier.price);
    }
  }, [selectedSize, quantity]);

  const getCurrentPriceTier = () => {
    const pricing = pricingData[selectedSize];
    return pricing.find(p => quantity >= p.min && quantity <= p.max);
  };

  const handleSizeChange = (size: BottleSize) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    setQuantity(Math.max(0, num));
  };

  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = () => {
    const required = ['fullName', 'address1', 'city', 'province', 'postalCode', 'phone'];
    return required.every(field => shippingAddress[field as keyof ShippingAddress].trim() !== '');
  };

  const handleNextStep = () => {
    if (currentStep === 1 && quantity < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (currentStep === 2 && !validateShipping()) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Paystack configuration
  const paystackConfig = {
    reference: `BLK_${Date.now()}`,
    email: user?.email || "customer@example.com",
    amount: Math.round(total * 100), // Paystack expects amount in kobo (multiply by 100)
    publicKey: "pk_test_your_paystack_public_key", // You should use environment variable for this
  };

  const handlePaystackSuccess = async (reference: any) => {
    try {
      // Generate order number
      const orderNum = `BLK${Date.now().toString().slice(-6)}`;
      setOrderNumber(orderNum);

      // Create order in database
      const orderData = {
        order_number: orderNum,
        user_id: user?.id,
        status: "paid",
        payment_status: "paid",
        delivery_status: "processing",
        total_amount: total,
        payment_reference: reference.reference,
        shipping_address: JSON.stringify(shippingAddress),
        metadata: JSON.stringify({
          bottle_size: selectedSize,
          quantity: quantity,
          unit_price: currentPrice,
          payment_method: "paystack"
        })
      };

      const { error: orderError } = await supabase
        .from("orders")
        .insert([orderData]);

      if (orderError) {
        console.error("Error creating order:", orderError);
        toast.error("Failed to save order. Please contact support.");
        return;
      }

      toast.success("Payment successful! Order created.");
      setCurrentStep(4);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process order. Please contact support.");
    }
  };

  const handlePaystackClose = () => {
    toast.error("Payment was not completed");
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      navigate("/auth");
      return;
    }

    if (!validatePayment()) {
      toast.error("Please fill in all payment details");
      return;
    }

    // For demo purposes, we'll proceed to confirmation
    // In production, this would be handled by the PaystackButton
    setCurrentStep(4);
  };

  const steps = [
    { number: 1, title: "Product & Quantity", icon: Package },
    { number: 2, title: "Shipping Address", icon: Truck },
    { number: 3, title: "Payment Details", icon: CreditCard },
    { number: 4, title: "Confirmation", icon: CheckCircle }
  ];

  const renderStep1 = () => (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Droplets className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold text-gray-900">Choose Your Bottles</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select your preferred bottle size and quantity. Our bulk pricing tiers offer significant savings for larger orders.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Column - Product & Selection */}
        <div className="space-y-8">
          {/* Product Showcase */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <img
                      src="https://images.pexels.com/photos/4068324/pexels-photo-4068324.jpeg"
                      alt="Premium Water Bottle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedSize}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Water Bottles</h3>
                <p className="text-gray-600">BPA-free, food-grade, eco-friendly materials</p>
              </div>
            </CardContent>
          </Card>

          {/* Size Selection */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <Label className="text-xl font-semibold text-gray-800">Bottle Size</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.keys(pricingData).map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => handleSizeChange(size as BottleSize)}
                  className={`h-20 flex flex-col space-y-1 transition-all duration-200 ${
                    selectedSize === size
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "hover:shadow-md hover:scale-102"
                  }`}
                >
                  <span className="font-bold text-lg">{size}</span>
                  <span className="text-xs opacity-80">Bottles</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <Label htmlFor="quantity" className="text-xl font-semibold text-gray-800">Quantity</Label>
            </div>
            <div className="space-y-4">
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10000"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="text-xl p-6 border-2 rounded-xl focus:ring-2 focus:ring-primary/20"
                placeholder="Enter number of bottles"
              />
              {getCurrentPriceTier() && (
                <Card className="border-l-4 border-l-primary bg-primary/5">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Pricing Tier</span>
                        <Badge variant="secondary">{getCurrentPriceTier()?.notes || "Standard"}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Price per bottle</span>
                        <span className="text-lg font-bold text-primary">R{currentPrice.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-green-600">R{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Pricing Table */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-gray-800">{selectedSize} Pricing Tiers</h3>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 rounded-t-lg">
                <h4 className="font-semibold">Volume Discounts Available</h4>
                <p className="text-sm opacity-90">Save more with larger quantities</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {pricingData[selectedSize].map((tier, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        quantity >= tier.min && quantity <= tier.max
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {tier.min} - {tier.max} bottles
                          </div>
                          {tier.notes && (
                            <div className="text-sm text-gray-600">{tier.notes}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            R{tier.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">per bottle</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-green-800 mb-3">Why Choose Our Bottles?</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>100% BPA-free materials</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Food-grade certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Eco-friendly & recyclable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Custom branding available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <MapPin className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold text-gray-900">Delivery Details</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please provide your delivery address. We'll ensure your bulk order arrives safely at your specified location.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-6 w-6" />
              <span>Shipping Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={shippingAddress.fullName}
                  onChange={(e) => handleShippingChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="company" className="text-sm font-semibold text-gray-700">
                  Company (Optional)
                </Label>
                <Input
                  id="company"
                  value={shippingAddress.company}
                  onChange={(e) => handleShippingChange('company', e.target.value)}
                  placeholder="Company name"
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="address1" className="text-sm font-semibold text-gray-700">
                  Street Address *
                </Label>
                <Input
                  id="address1"
                  value={shippingAddress.address1}
                  onChange={(e) => handleShippingChange('address1', e.target.value)}
                  placeholder="Enter street address"
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="address2" className="text-sm font-semibold text-gray-700">
                  Address Line 2 (Optional)
                </Label>
                <Input
                  id="address2"
                  value={shippingAddress.address2}
                  onChange={(e) => handleShippingChange('address2', e.target.value)}
                  placeholder="Apartment, suite, unit, etc."
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                  City *
                </Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => handleShippingChange('city', e.target.value)}
                  placeholder="City"
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="province" className="text-sm font-semibold text-gray-700">
                  Province *
                </Label>
                <Select value={shippingAddress.province} onValueChange={(value) => handleShippingChange('province', value)}>
                  <SelectTrigger className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gauteng">Gauteng</SelectItem>
                    <SelectItem value="western-cape">Western Cape</SelectItem>
                    <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                    <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                    <SelectItem value="free-state">Free State</SelectItem>
                    <SelectItem value="limpopo">Limpopo</SelectItem>
                    <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                    <SelectItem value="north-west">North West</SelectItem>
                    <SelectItem value="northern-cape">Northern Cape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-700">
                  Postal Code *
                </Label>
                <Input
                  id="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                  placeholder="Postal code"
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={shippingAddress.phone}
                  onChange={(e) => handleShippingChange('phone', e.target.value)}
                  placeholder="Phone number"
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Truck className="h-6 w-6 text-amber-600 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Delivery Information</h4>
                <div className="space-y-1 text-sm text-amber-700">
                  <p>• Bulk orders typically take 3-5 business days for processing</p>
                  <p>• Free delivery for orders over R1,000</p>
                  <p>• Signature required upon delivery</p>
                  <p>• Please ensure someone is available to receive the delivery</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <CreditCard className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold text-gray-900">Secure Payment</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Review your order and complete your payment securely through our trusted payment partner.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-6 w-6" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Droplets className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{selectedSize} Water Bottles</h4>
                    <p className="text-gray-600">Premium grade, BPA-free</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">{quantity} bottles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per bottle</span>
                    <span className="font-medium">R{currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery</span>
                    <span>{total >= 1000 ? "FREE" : "R150"}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-green-600">R{(total >= 1000 ? total : total + 150).toFixed(2)}</span>
                </div>

                {total >= 1000 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-700 text-sm font-medium">
                      ✨ Free delivery applied! You saved R150
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Address
              </h4>
              <div className="text-sm text-blue-700">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p>{shippingAddress.address1}</p>
                {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="cardholderName" className="text-sm font-semibold text-gray-700">
                  Cardholder Name *
                </Label>
                <Input
                  id="cardholderName"
                  value={paymentDetails.cardholderName}
                  onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                  placeholder="Name as it appears on card"
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="cardNumber" className="text-sm font-semibold text-gray-700">
                  Card Number *
                </Label>
                <Input
                  id="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="expiryDate" className="text-sm font-semibold text-gray-700">
                    Expiry Date *
                  </Label>
                  <Input
                    id="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cvv" className="text-sm font-semibold text-gray-700">
                    CVV *
                  </Label>
                  <Input
                    id="cvv"
                    value={paymentDetails.cvv}
                    onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="p-4 border-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Secure Payment</h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>• Your payment is secured by Paystack</p>
                    <p>• We never store your card details</p>
                    <p>• 256-bit SSL encryption</p>
                    <p>• PCI DSS compliant</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paystack Payment Button */}
          <PaystackButton
            {...paystackConfig}
            text={`Complete Payment - R${(total >= 1000 ? total : total + 150).toFixed(2)}`}
            onSuccess={handlePaystackSuccess}
            onClose={handlePaystackClose}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-8">
      {/* Success Animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-yellow-800 text-xl">✨</span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">Order Confirmed!</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Thank you for your bulk order. We've received your payment and will begin processing your order immediately.
        </p>
      </div>

      {/* Order Details */}
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardTitle className="text-2xl">Order Receipt</CardTitle>
            <p className="opacity-90">Order #{orderNumber || `BLK${Date.now().toString().slice(-6)}`}</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Droplets className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{selectedSize} Water Bottles</h4>
                  <p className="text-gray-600">{quantity} bottles × R{currentPrice.toFixed(2)} each</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">R{total.toFixed(2)}</p>
                </div>
              </div>

              <Separator />

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">Order Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Status:</span>
                      <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-800 mb-3">Delivery Address</h5>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-800">{shippingAddress.fullName}</p>
                    {shippingAddress.company && <p>{shippingAddress.company}</p>}
                    <p>{shippingAddress.address1}</p>
                    {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Next Steps */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-3">What happens next?</h5>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Order confirmation email sent to your inbox</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Processing begins within 2 business hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Tracking information will be provided</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Delivery in 3-5 business days</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 max-w-md mx-auto">
        <Button
          onClick={() => navigate('/profile')}
          className="w-full py-3 text-lg bg-primary hover:bg-primary/90"
        >
          Track Your Order
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/products')}
          className="w-full py-3 text-lg border-2"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <Button
              variant="ghost"
              onClick={() => navigate('/products')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-3 rounded-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Products</span>
            </Button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Bulk Purchase</h1>
              <p className="text-gray-600">Professional bulk ordering made simple</p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>

          {/* Progress Steps */}
          <div className="relative mb-12">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                const isUpcoming = currentStep < step.number;

                return (
                  <div key={step.number} className="flex flex-col items-center relative z-10">
                    <div className={`
                      flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 mb-3
                      ${isCompleted
                        ? "bg-green-500 border-green-500 text-white shadow-lg"
                        : isCurrent
                        ? "bg-primary border-primary text-white shadow-lg scale-110"
                        : "bg-white border-gray-300 text-gray-400"
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-8 w-8" />
                      ) : (
                        <StepIcon className="h-8 w-8" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold mb-1 ${
                        isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-gray-500"
                      }`}>
                        Step {step.number}
                      </p>
                      <p className={`text-xs font-medium ${
                        isCurrent ? "text-foreground" : isCompleted ? "text-green-700" : "text-muted-foreground"
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Progress Line */}
            <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 -z-10">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-primary transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-12">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between items-center max-w-4xl mx-auto mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-8 py-3 border-2 font-medium disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < 3 && (
                <Button
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 font-medium"
                >
                  Next Step
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              )}
              {currentStep === 3 && (
                <div className="text-center text-gray-600 max-w-xs">
                  <p className="text-sm">Complete your secure payment above to finalize your order</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default BulkCheckout;
