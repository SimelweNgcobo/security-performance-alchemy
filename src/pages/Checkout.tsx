import { useState } from "react";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, X, CreditCard, Truck, Shield, Check } from "lucide-react";

const Checkout = () => {
  const { state: cartState, updateQuantity, removeItem } = useCart();
  const cartItems = cartState.items;

  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  });

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: number) => {
    removeItem(id);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod === "express" ? 150 : shippingMethod === "standard" ? 0 : 0;
  const tax = subtotal * 0.15; // 15% VAT in South Africa
  const total = subtotal + shippingCost + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle checkout submission
    console.log("Order submitted:", { customerInfo, cartItems, shippingMethod, paymentMethod });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-primary/3">
      <Navbar />
      <div className="pt-24 pb-16 px-6 md:px-12 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-thin text-foreground tracking-tight">
              Checkout
            </h1>
            <div className="w-16 h-px bg-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground font-light">
              Complete your MyFuze experience
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Customer Information & Shipping */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Information */}
              <Card className="border-primary/10 shadow-lg bg-gradient-to-br from-background/90 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">1</span>
                    </div>
                    <span className="text-xl font-light text-foreground">Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        value={customerInfo.province}
                        onChange={(e) => setCustomerInfo({...customerInfo, province: e.target.value})}
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={customerInfo.postalCode}
                        onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card className="border-primary/10 shadow-lg bg-gradient-to-br from-background/90 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">2</span>
                    </div>
                    <span className="text-xl font-light text-foreground">Shipping Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors">
                      <RadioGroupItem value="standard" id="standard" />
                      <div className="flex-grow">
                        <Label htmlFor="standard" className="font-medium cursor-pointer">Standard Delivery (Free)</Label>
                        <p className="text-sm text-muted-foreground">3-5 business days</p>
                      </div>
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors">
                      <RadioGroupItem value="express" id="express" />
                      <div className="flex-grow">
                        <Label htmlFor="express" className="font-medium cursor-pointer">Express Delivery (R150)</Label>
                        <p className="text-sm text-muted-foreground">1-2 business days</p>
                      </div>
                      <div className="text-primary font-medium">R150</div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-primary/10 shadow-lg bg-gradient-to-br from-background/90 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">3</span>
                    </div>
                    <span className="text-xl font-light text-foreground">Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors">
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex-grow">
                        <Label htmlFor="card" className="font-medium cursor-pointer">Credit/Debit Card</Label>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                      </div>
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            className="border-primary/20 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            className="border-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-8">
              {/* Cart Items */}
              <Card className="border-primary/10 shadow-lg bg-gradient-to-br from-background/90 to-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl font-light text-foreground">Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 rounded-lg border border-primary/10">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-grow">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.size}</p>
                        <p className="text-sm font-medium text-primary">R{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-8 h-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="border-primary/10 shadow-lg bg-gradient-to-br from-background/90 to-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl font-light text-foreground">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : `R${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (15%)</span>
                    <span>R{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span className="text-primary">R{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the Terms & Conditions
                      </Label>
                    </div>
                    
                    <Button
                      onClick={handleSubmit}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      Complete Order
                      <Shield className="w-5 h-5 ml-2" />
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Secure checkout powered by SSL encryption</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card className="border-primary/10 shadow-lg bg-gradient-to-br from-background/90 to-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-sm">30-day satisfaction guarantee</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-sm">Free white-glove delivery</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-sm">Premium packaging included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Checkout;
