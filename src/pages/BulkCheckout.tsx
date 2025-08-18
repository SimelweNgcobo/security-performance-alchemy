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

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
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
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });

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

  const handlePaymentChange = (field: keyof PaymentDetails, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = () => {
    const required = ['fullName', 'address1', 'city', 'province', 'postalCode', 'phone'];
    return required.every(field => shippingAddress[field as keyof ShippingAddress].trim() !== '');
  };

  const validatePayment = () => {
    const required = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
    return required.every(field => paymentDetails[field as keyof PaymentDetails].trim() !== '');
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
    if (currentStep === 3 && !validatePayment()) {
      toast.error("Please fill in all payment details");
      return;
    }
    
    if (currentStep < 4) {
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Truck className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">Shipping Address</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={shippingAddress.fullName}
            onChange={(e) => handleShippingChange('fullName', e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            value={shippingAddress.company}
            onChange={(e) => handleShippingChange('company', e.target.value)}
            placeholder="Company name"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address1">Address Line 1 *</Label>
          <Input
            id="address1"
            value={shippingAddress.address1}
            onChange={(e) => handleShippingChange('address1', e.target.value)}
            placeholder="Street address"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address2">Address Line 2 (Optional)</Label>
          <Input
            id="address2"
            value={shippingAddress.address2}
            onChange={(e) => handleShippingChange('address2', e.target.value)}
            placeholder="Apartment, suite, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={shippingAddress.city}
            onChange={(e) => handleShippingChange('city', e.target.value)}
            placeholder="City"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="province">Province *</Label>
          <Select value={shippingAddress.province} onValueChange={(value) => handleShippingChange('province', value)}>
            <SelectTrigger>
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
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input
            id="postalCode"
            value={shippingAddress.postalCode}
            onChange={(e) => handleShippingChange('postalCode', e.target.value)}
            placeholder="Postal code"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={shippingAddress.phone}
            onChange={(e) => handleShippingChange('phone', e.target.value)}
            placeholder="Phone number"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">Payment Details</h3>
      </div>
      
      {/* Order Summary */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{selectedSize} Bottles × {quantity}</span>
              <span>R{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Price per bottle</span>
              <span>R{currentPrice.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Form */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardholderName">Cardholder Name *</Label>
          <Input
            id="cardholderName"
            value={paymentDetails.cardholderName}
            onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
            placeholder="Name on card"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number *</Label>
          <Input
            id="cardNumber"
            value={paymentDetails.cardNumber}
            onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              value={paymentDetails.expiryDate}
              onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV *</Label>
            <Input
              id="cvv"
              value={paymentDetails.cvv}
              onChange={(e) => handlePaymentChange('cvv', e.target.value)}
              placeholder="123"
              maxLength={4}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          🔒 Your payment is secured by Paystack. We never store your card details.
        </p>
      </div>

      {/* Paystack Payment Button */}
      <div className="pt-4">
        <PaystackButton
          {...paystackConfig}
          text={`Pay R${total.toFixed(2)} with Paystack`}
          onSuccess={handlePaystackSuccess}
          onClose={handlePaystackClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      
      <h3 className="text-2xl font-bold text-green-600">Order Confirmed!</h3>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Order Number:</span>
            <span className="font-mono">#{orderNumber || `BLK${Date.now().toString().slice(-6)}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Product:</span>
            <span>{selectedSize} Bottles</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span>{quantity} bottles</span>
          </div>
          <div className="flex justify-between">
            <span>Unit Price:</span>
            <span>R{currentPrice.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total Paid:</span>
            <span>R{total.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">
            <p>Shipping to:</p>
            <p>{shippingAddress.fullName}</p>
            <p>{shippingAddress.address1}</p>
            <p>{shippingAddress.city}, {shippingAddress.province}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <Button onClick={() => navigate('/profile')} className="w-full">
          View Order in Profile
        </Button>
        <Button variant="outline" onClick={() => navigate('/products')} className="w-full">
          Continue Shopping
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-grow bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/products')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <h1 className="text-3xl font-bold">Bulk Purchase</h1>
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
          <Card className="mb-8">
            <CardContent className="p-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              {currentStep < 3 && (
                <Button onClick={handleNextStep}>
                  Next
                </Button>
              )}
              {currentStep === 3 && (
                <div className="text-sm text-muted-foreground text-right">
                  Use the Paystack button above to complete your payment
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
