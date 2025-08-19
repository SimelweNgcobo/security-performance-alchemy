import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, CreditCard, CheckCircle, ArrowLeft, Package, MapPin, Shield, Clock, Award, Star } from "lucide-react";
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

  const steps = [
    { number: 1, title: "Configure Order", icon: Package, desc: "Select products & quantities" },
    { number: 2, title: "Delivery Details", icon: Truck, desc: "Shipping information" },
    { number: 3, title: "Secure Payment", icon: CreditCard, desc: "Complete your purchase" },
    { number: 4, title: "Order Complete", icon: CheckCircle, desc: "Confirmation & tracking" }
  ];

  const renderStep1 = () => (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content - 8 columns */}
        <div className="lg:col-span-8 space-y-8">
          {/* Product Selection Header */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Configure Your Order</h2>
            <p className="text-slate-600">Select bottle size and quantity for your bulk purchase</p>
          </div>

          {/* Size Selection */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Package className="h-5 w-5 text-slate-500" />
                Bottle Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {Object.keys(pricingData).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size as BottleSize)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 hover:border-slate-300
                      ${selectedSize === size 
                        ? "border-slate-900 bg-slate-50 shadow-sm" 
                        : "border-slate-200 bg-white"
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        selectedSize === size ? "text-slate-900" : "text-slate-700"
                      }`}>
                        {size}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Bottles</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quantity Input */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="10000"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="text-lg p-6 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    placeholder="Enter quantity"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    bottles
                  </span>
                </div>
                
                {getCurrentPriceTier() && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Pricing Tier</span>
                      <Badge variant="secondary" className="text-xs">
                        {getCurrentPriceTier()?.notes || "Standard"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Unit Price</span>
                      <span className="font-semibold">R{currentPrice.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Subtotal</span>
                      <span className="text-lg font-bold text-slate-900">R{total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-slate-200 shadow-sm bg-slate-50">
            <CardContent className="p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Premium Quality Assurance</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">BPA-free materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Food-grade certified</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Eco-friendly & recyclable</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Custom branding available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          {/* Product Showcase */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              <img
                src="https://images.pexels.com/photos/4068324/pexels-photo-4068324.jpeg"
                alt="Premium Water Bottles"
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-900">Premium Water Bottles</h3>
              <p className="text-sm text-slate-600 mt-1">Professional grade, bulk quantities</p>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-slate-600 ml-2">4.9 (2,847 reviews)</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Table */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">{selectedSize} Pricing Tiers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {pricingData[selectedSize].map((tier, index) => (
                  <div
                    key={index}
                    className={`p-4 border-b border-slate-100 last:border-b-0 transition-colors ${
                      quantity >= tier.min && quantity <= tier.max
                        ? "bg-slate-50"
                        : "bg-white hover:bg-slate-25"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">
                          {tier.min} - {tier.max} bottles
                        </div>
                        {tier.notes && (
                          <div className="text-xs text-slate-500">{tier.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">R{tier.price.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">per bottle</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-900">Quality Certified</div>
                <div className="text-xs text-green-700">ISO 9001:2015 certified</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-900">Secure Ordering</div>
                <div className="text-xs text-blue-700">256-bit SSL encryption</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm font-medium text-orange-900">Fast Delivery</div>
                <div className="text-xs text-orange-700">3-5 business days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Delivery Information</h2>
        <p className="text-slate-600">Please provide accurate delivery details for your bulk order</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-slate-500" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
              <Input
                id="fullName"
                value={shippingAddress.fullName}
                onChange={(e) => handleShippingChange('fullName', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">Company (Optional)</Label>
              <Input
                id="company"
                value={shippingAddress.company}
                onChange={(e) => handleShippingChange('company', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address1" className="text-sm font-medium">Street Address *</Label>
              <Input
                id="address1"
                value={shippingAddress.address1}
                onChange={(e) => handleShippingChange('address1', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                placeholder="Enter street address"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address2" className="text-sm font-medium">Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                value={shippingAddress.address2}
                onChange={(e) => handleShippingChange('address2', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                placeholder="Apartment, suite, unit, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">City *</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) => handleShippingChange('city', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province" className="text-sm font-medium">Province *</Label>
              <Select value={shippingAddress.province} onValueChange={(value) => handleShippingChange('province', value)}>
                <SelectTrigger className="border-slate-200 focus:border-slate-400 focus:ring-slate-400">
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

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code *</Label>
              <Input
                id="postalCode"
                value={shippingAddress.postalCode}
                onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                placeholder="Postal code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
              <Input
                id="phone"
                value={shippingAddress.phone}
                onChange={(e) => handleShippingChange('phone', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                placeholder="Phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Truck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900 mb-2">Delivery Information</h4>
              <div className="space-y-1 text-sm text-amber-800">
                <p>• Processing time: 1-2 business days</p>
                <p>• Delivery time: 3-5 business days</p>
                <p>• Free delivery for orders over R1,000</p>
                <p>• Signature required upon delivery</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-6xl mx-auto">
      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Complete Your Order</h2>
        <p className="text-slate-600">Review your order details and complete secure payment</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-slate-500" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Package className="h-8 w-8 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedSize} Water Bottles</h4>
                  <p className="text-sm text-slate-600">Premium grade, BPA-free</p>
                  <p className="text-sm text-slate-500 mt-1">Quantity: {quantity} bottles</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">R{total.toFixed(2)}</p>
                  <p className="text-sm text-slate-500">R{currentPrice.toFixed(2)} each</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span className={total >= 1000 ? "text-green-600" : ""}>
                    {total >= 1000 ? "FREE" : "R150"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R{(total >= 1000 ? total : total + 150).toFixed(2)}</span>
                </div>
              </div>

              {total >= 1000 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">
                    ✓ Free delivery included - You saved R150
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-slate-500" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{shippingAddress.fullName}</p>
                {shippingAddress.company && <p className="text-slate-600">{shippingAddress.company}</p>}
                <p className="text-slate-600">{shippingAddress.address1}</p>
                {shippingAddress.address2 && <p className="text-slate-600">{shippingAddress.address2}</p>}
                <p className="text-slate-600">{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}</p>
                <p className="text-slate-600">{shippingAddress.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-slate-500" />
                Secure Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Payment with Paystack</h3>
                  <p className="text-sm text-slate-600">
                    Secure payment processing powered by Paystack. Your payment details are encrypted and protected.
                  </p>
                </div>
              </div>

              <PaystackButton
                {...paystackConfig}
                text={`Pay R${(total >= 1000 ? total : total + 150).toFixed(2)}`}
                onSuccess={handlePaystackSuccess}
                onClose={handlePaystackClose}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              />

              <div className="space-y-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No card details stored</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Order Confirmed</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Thank you for your order. We've received your payment and will begin processing immediately.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm text-left">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <CardTitle>Order Receipt</CardTitle>
            <Badge variant="outline" className="text-xs">
              #{orderNumber || `BLK${Date.now().toString().slice(-6)}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Package className="h-8 w-8 text-slate-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{selectedSize} Water Bottles</h4>
              <p className="text-sm text-slate-600">{quantity} bottles × R{currentPrice.toFixed(2)} each</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">R{total.toFixed(2)}</p>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-3">Order Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Order Date</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Status</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Order Status</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Processing</Badge>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-3">Delivery Address</h5>
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-medium text-slate-900">{shippingAddress.fullName}</p>
                {shippingAddress.company && <p>{shippingAddress.company}</p>}
                <p>{shippingAddress.address1}</p>
                {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-3">What's Next?</h5>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>Order confirmation sent to your email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>Processing begins within 2 business hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>Tracking information will be provided</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <span>Delivery in 3-5 business days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => navigate('/profile')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6"
        >
          Track Order
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/products')}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 px-6"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="pt-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900">Bulk Purchase</h1>
              <p className="text-slate-600 mt-1">Professional ordering made simple</p>
            </div>
            <div className="w-32"></div>
          </div>

          {/* Progress Steps */}
          <div className="relative mb-12">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;

                return (
                  <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 mb-3
                      ${isCompleted
                        ? "bg-green-600 text-white"
                        : isCurrent
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-400"
                      }
                    `}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium mb-1 ${
                        isCurrent ? "text-slate-900" : isCompleted ? "text-green-700" : "text-slate-500"
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 max-w-24">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Progress Line */}
            <div className="absolute top-6 left-1/2 right-6 h-0.5 bg-slate-200 -z-10" style={{ left: '12.5%', right: '12.5%' }}>
              <div
                className="h-full bg-slate-900 transition-all duration-500"
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
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < 3 && (
                <Button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Continue
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              )}
              {currentStep === 3 && (
                <div className="text-sm text-slate-600 max-w-xs text-right">
                  Click the payment button above to complete your secure purchase
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
