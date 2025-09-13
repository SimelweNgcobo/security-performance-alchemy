import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Truck, CreditCard, CheckCircle, ArrowLeft, Package, MapPin, Shield, Clock, Award, Star, Plus, Trash2, Eye, Save, Palette } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import { toast } from "sonner";
import { PaystackButton } from 'react-paystack';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { userLabelsService, UserLabel } from "@/services/userLabels";

// Pricing data structure - max 10,000 bottles
const pricingData = {
  "330ml": [
    { min: 1, max: 10, price: 8, notes: "Retail / single bottle" },
    { min: 11, max: 50, price: 7.50, notes: "Small packs" },
    { min: 51, max: 100, price: 7, notes: "Small events" },
    { min: 101, max: 500, price: 6.50, notes: "Bulk" },
    { min: 501, max: 1000, price: 6.00, notes: "Entry bulk" },
    { min: 1001, max: 2500, price: 5.80, notes: "Corporate" },
    { min: 2501, max: 5000, price: 5.50, notes: "Large bulk" },
    { min: 5001, max: 10000, price: 5.00, notes: "Maximum bulk (Enterprise custom quote for higher quantities)" }
  ],
  "500ml": [
    { min: 1, max: 10, price: 10, notes: "Retail / single bottle" },
    { min: 11, max: 50, price: 9, notes: "Small packs" },
    { min: 51, max: 100, price: 8, notes: "Small events" },
    { min: 101, max: 500, price: 7.50, notes: "Bulk" },
    { min: 501, max: 1000, price: 7.00, notes: "Entry bulk" },
    { min: 1001, max: 2500, price: 6.80, notes: "Corporate" },
    { min: 2501, max: 5000, price: 6.50, notes: "Large bulk" },
    { min: 5001, max: 10000, price: 6.00, notes: "Maximum bulk (Enterprise custom quote for higher quantities)" }
  ],
  "750ml": [
    { min: 1, max: 10, price: 12, notes: "Retail / single bottle" },
    { min: 11, max: 50, price: 11, notes: "Small packs" },
    { min: 51, max: 100, price: 10, notes: "Small events" },
    { min: 101, max: 500, price: 9.50, notes: "Bulk" },
    { min: 501, max: 1000, price: 9.00, notes: "Entry bulk" },
    { min: 1001, max: 2500, price: 8.80, notes: "Corporate" },
    { min: 2501, max: 5000, price: 8.50, notes: "Large bulk" },
    { min: 5001, max: 10000, price: 8.00, notes: "Maximum bulk (Enterprise custom quote for higher quantities)" }
  ],
  "1L": [
    { min: 1, max: 10, price: 15, notes: "" },
    { min: 11, max: 50, price: 13.50, notes: "" },
    { min: 51, max: 100, price: 12.50, notes: "" },
    { min: 101, max: 500, price: 12.00, notes: "" },
    { min: 501, max: 1000, price: 11.50, notes: "" },
    { min: 1001, max: 5000, price: 11.00, notes: "" },
    { min: 5001, max: 10000, price: 10.50, notes: "Maximum bulk" }
  ],
  "1.5L": [
    { min: 1, max: 10, price: 14, notes: "" },
    { min: 11, max: 50, price: 13.50, notes: "" },
    { min: 51, max: 100, price: 13, notes: "" },
    { min: 101, max: 500, price: 12.50, notes: "" },
    { min: 501, max: 1000, price: 12, notes: "" },
    { min: 1001, max: 5000, price: 11.80, notes: "" },
    { min: 5001, max: 10000, price: 11.50, notes: "Maximum bulk" }
  ],
  "5L": [
    { min: 1, max: 10, price: 25, notes: "" },
    { min: 11, max: 50, price: 24, notes: "" },
    { min: 51, max: 100, price: 23, notes: "" },
    { min: 101, max: 500, price: 22.50, notes: "" },
    { min: 501, max: 1000, price: 22, notes: "" },
    { min: 1001, max: 5000, price: 21.50, notes: "" },
    { min: 5001, max: 10000, price: 21, notes: "Maximum bulk" }
  ]
};

type BottleSize = keyof typeof pricingData;

interface CartItem {
  id: string;
  size: BottleSize;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  hasCustomLabel: boolean;
  labelId?: string | null;
  labelName?: string | null;
}

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
  const location = useLocation();
  const { user } = useAuth();

  // Handle reorder data from location state
  const reorderData = location.state?.reorderData;
  const isReorder = location.state?.isReorder || false;

  const [currentStep, setCurrentStep] = useState(isReorder ? 3 : 1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedSize, setSelectedSize] = useState<BottleSize>("500ml");
  const [quantity, setQuantity] = useState<number>(500);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [showPricingTiers, setShowPricingTiers] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [useCustomLabel, setUseCustomLabel] = useState(false);
  const [userLabels, setUserLabels] = useState<UserLabel[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [loadingLabels, setLoadingLabels] = useState(false);

  // Map bottle sizes to provided image assets
  const bottleImageMap: Record<string, string> = {
    "330ml": "https://cdn.builder.io/api/v1/image/assets%2F65e5d002f1cb4407b922bea7904a7c95%2Fef427b44c1a34f8992521b5e72f4afb7?format=webp&width=800",
    "500ml": "https://cdn.builder.io/api/v1/image/assets%2F65e5d002f1cb4407b922bea7904a7c95%2F359b1dbaf0f741ef8c9bf8fbbc408d38?format=webp&width=800",
    "750ml": "https://cdn.builder.io/api/v1/image/assets%2F65e5d002f1cb4407b922bea7904a7c95%2Fb5f2f3e7f0664adfba248d30f63ef4dd?format=webp&width=800",
    "1L":   "https://cdn.builder.io/api/v1/image/assets%2F65e5d002f1cb4407b922bea7904a7c95%2F7edfb2c701ca43cda1ce60f63b797c43?format=webp&width=800",
    "1.5L": "https://cdn.builder.io/api/v1/image/assets%2F65e5d002f1cb4407b922bea7904a7c95%2F7edfb2c701ca43cda1ce60f63b797c43?format=webp&width=800",
    "5L":   "https://cdn.builder.io/api/v1/image/assets%2F65e5d002f1cb4407b922bea7904a7c95%2Fd1b9f9e75c334e3390c95f54c8cfa37b?format=webp&width=800",
  };

  const getBottleImage = (size: BottleSize | string) => {
    let normalized = String(size || '').toLowerCase().trim();
    // collapse spaces and convert 'litre' -> 'l'
    normalized = normalized.replace(/\s+/g, '').replace(/litre/g, 'l');

    // ml values (e.g., '330ml')
    if (/^\d+ml$/.test(normalized)) {
      return bottleImageMap[normalized] || bottleImageMap['500ml'];
    }

    // litre values (e.g., '1.5l' or '1l') -> convert to '1.5L' or '1L'
    if (/^\d+(?:\.\d+)?l$/.test(normalized)) {
      const key = normalized.replace('l', 'L');
      return bottleImageMap[key] || bottleImageMap['500ml'];
    }

    // Fallback: try direct lookup, otherwise return 500ml as default
    return bottleImageMap[String(size)] || bottleImageMap['500ml'];
  };

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

  // Handle reorder initialization
  useEffect(() => {
    if (isReorder && reorderData && user) {
      try {
        // Convert reorder items to cart items
        const reorderCartItems: CartItem[] = reorderData.items.map((item: any, index: number) => ({
          id: `reorder-${item.id || index}-${Date.now()}`,
          size: item.size || "500ml",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || item.unitPrice || 0,
          subtotal: item.total_price || item.subtotal || 0,
          hasCustomLabel: item.hasCustomLabel || false,
          labelId: item.labelId || null,
          labelName: item.labelName || null
        }));

        setCartItems(reorderCartItems);
        toast.success(`Reordering from ${reorderData.orderNumber} - review and complete payment`);
      } catch (error) {
        console.error('Error processing reorder data:', error);
        toast.error('Error loading reorder data. Starting fresh order.');
        setCurrentStep(1);
      }
    }
  }, [isReorder, reorderData, user]);

  // Load user labels when user is available
  useEffect(() => {
    const loadUserLabels = async () => {
      if (!user?.id) return;

      setLoadingLabels(true);
      try {
        const labels = await userLabelsService.getUserLabels(user.id);
        setUserLabels(labels);

        // Auto-select default label if available
        const defaultLabel = labels.find(l => l.is_default) || labels[0];
        if (defaultLabel) {
          setSelectedLabelId(defaultLabel.id);
        }
      } catch (error) {
        console.error('Error loading user labels:', error);
      } finally {
        setLoadingLabels(false);
      }
    };

    loadUserLabels();
  }, [user?.id]);

  // Load saved address when user is available
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!user?.id) return;

      try {
        const { data: savedAddress, error } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle();

        if (error) {
          console.error('Error loading saved address:', error);
          return;
        }

        if (savedAddress) {
          setShippingAddress({
            fullName: savedAddress.full_name || "",
            company: savedAddress.company || "",
            address1: savedAddress.address_line_1 || "",
            address2: savedAddress.address_line_2 || "",
            city: savedAddress.city || "",
            province: savedAddress.province || "",
            postalCode: savedAddress.postal_code || "",
            phone: savedAddress.phone || ""
          });
          toast.success("Loaded your saved address");
        }
      } catch (error) {
        console.error('Error loading saved address:', error);
      }
    };

    loadSavedAddress();
  }, [user?.id]);

  // Calculate pricing for a given size and quantity (with optional custom label)
  const calculatePrice = useCallback((size: BottleSize, qty: number, hasCustomLabel: boolean = false) => {
    const pricing = pricingData[size];
    const tier = pricing.find(p => qty >= p.min && qty <= p.max);
    const basePrice = tier ? tier.price : 0;
    return hasCustomLabel ? basePrice + 5 : basePrice; // Add R5 for custom label
  }, []);

  // Get current price for selected size and quantity
  const getCurrentPrice = useCallback(() => {
    return calculatePrice(selectedSize, quantity, useCustomLabel);
  }, [calculatePrice, selectedSize, quantity, useCustomLabel]);

  // Get current pricing tier for selected size and quantity
  const getCurrentPriceTier = useCallback(() => {
    const pricing = pricingData[selectedSize];
    return pricing.find(p => quantity >= p.min && quantity <= p.max);
  }, [selectedSize, quantity]);

  // Calculate total for all cart items
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  }, [cartItems]);

  // Get total quantity across all cart items
  const totalQuantity = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const handleSizeChange = useCallback((size: BottleSize) => {
    setSelectedSize(size);
  }, []);

  const handleQuantityChange = useCallback((value: string) => {
    const num = parseInt(value) || 0;
    setQuantity(Math.max(0, num));
  }, []);

  const addToCart = () => {
    if (quantity < 1) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const unitPrice = getCurrentPrice();
    const subtotal = quantity * unitPrice;

    // Check if same size with same label already exists in cart
    const existingItemIndex = cartItems.findIndex(item =>
      item.size === selectedSize &&
      (item.labelId ?? null) === (useCustomLabel ? (selectedLabelId ?? null) : null)
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...cartItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      const newUnitPrice = calculatePrice(selectedSize, newQuantity, useCustomLabel);

      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        unitPrice: newUnitPrice,
        subtotal: newQuantity * newUnitPrice
      };

      setCartItems(updatedItems);
      toast.success(`Updated ${selectedSize} bottles in cart`);
    } else {
      // Add new item
      const selectedLabel = userLabels.find(l => l.id === selectedLabelId);

      const newItem: CartItem = {
        id: `${selectedSize}-${useCustomLabel ? 'custom' : 'standard'}-${selectedLabelId ?? 'no-label'}-${Date.now()}`,
        size: selectedSize,
        quantity,
        unitPrice,
        subtotal,
        hasCustomLabel: useCustomLabel,
        labelId: useCustomLabel ? selectedLabelId : undefined,
        labelName: useCustomLabel ? selectedLabel?.name : undefined
      };

      setCartItems(prev => [...prev, newItem]);
      toast.success(`Added ${quantity} × ${selectedSize} bottles${useCustomLabel ? ' with custom label' : ''} to cart`);
    }

    // Reset form
    setQuantity(500);
    setUseCustomLabel(false);
    // Keep the selected label for next use
    // setSelectedLabelId(null);
  };

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  }, []);

  const updateCartItemQuantity = useCallback((id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newUnitPrice = calculatePrice(item.size, newQuantity, item.hasCustomLabel);
        return {
          ...item,
          quantity: newQuantity,
          unitPrice: newUnitPrice,
          subtotal: newQuantity * newUnitPrice
        };
      }
      return item;
    }));
  }, [calculatePrice, removeFromCart]);

  const handleShippingChange = useCallback((field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateShipping = useCallback(() => {
    const required = ['fullName', 'address1', 'city', 'province', 'postalCode', 'phone'];
    return required.every(field => shippingAddress[field as keyof ShippingAddress].trim() !== '');
  }, [shippingAddress]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1 && cartItems.length === 0) {
      toast.error("Please add items to your cart");
      return;
    }
    if (currentStep === 2 && !validateShipping()) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, cartItems.length, validateShipping]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Paystack configuration with debugging
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  // Debug Paystack configuration
  useEffect(() => {
    console.log('Paystack Public Key:', paystackPublicKey);
    console.log('Environment Variables:', import.meta.env);
    if (!paystackPublicKey) {
      console.error('VITE_PAYSTACK_PUBLIC_KEY not found in environment variables');
      toast.error("Payment configuration error. Please contact support.");
    }
  }, [paystackPublicKey]);

  const paystackConfig = {
    reference: `BLK_${Date.now()}`,
    email: user?.email || "customer@example.com",
    amount: Math.round((cartTotal >= 1000 ? cartTotal : cartTotal + 150) * 100), // Paystack expects amount in kobo (multiply by 100)
    currency: "ZAR", // South African Rand
    publicKey: paystackPublicKey || "",
    metadata: {
      cart_items: cartItems.length,
      user_id: user?.id,
      total_quantity: totalQuantity,
      custom_fields: []
    }
  };

  // Debug Paystack configuration before payment
  useEffect(() => {
    if (currentStep === 3 && cartTotal > 0) {
      console.log('Paystack Configuration:', paystackConfig);
      console.log('Cart Total:', cartTotal);
      console.log('Final Amount (including delivery):', cartTotal >= 1000 ? cartTotal : cartTotal + 150);
      console.log('Amount in Kobo:', paystackConfig.amount);

      // Validation checks
      if (paystackConfig.amount <= 0) {
        console.error('Invalid amount: Amount must be greater than 0');
        toast.error("Invalid payment amount. Please add items to your cart.");
      }

      if (!user?.email) {
        console.error('Invalid email: User email is required');
        toast.error("Please ensure you're signed in with a valid email address.");
      }

      if (!paystackPublicKey) {
        console.error('Invalid public key: Paystack public key is required');
        toast.error("Payment configuration error. Please contact support.");
      }
    }
  }, [currentStep, cartTotal, user?.email, paystackPublicKey, paystackConfig]);

  const handlePaystackSuccess = async (reference: any) => {
    console.log('Paystack success callback triggered with reference:', reference);
    try {
      // Use server-side order creation for security and atomicity
      const createOrderData = {
        paymentReference: reference.reference,
        orderData: {
          total_amount: cartTotal,
          payment_method: "paystack",
          delivery_status: "processing"
        },
        cartItems: cartItems.map(item => ({
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          hasCustomLabel: item.hasCustomLabel,
          labelId: item.labelId || null,
          labelName: item.labelName || null
        })),
        shippingAddress: shippingAddress,
        userEmail: user?.email || ''
      };

      console.log('Creating order via server-side function with data:', createOrderData);

      const { data: orderResult, error: functionError } = await supabase.functions.invoke('paystack-webhook', {
        body: {
          action: 'verify-and-create-order',
          ...createOrderData
        }
      });

      if (functionError) {
        console.error("Error calling order creation function:", functionError);
        toast.error(`Failed to process order: ${functionError.message || 'Unknown error'}. Please contact support.`);
        return;
      }

      if (!orderResult?.success) {
        console.error("Order creation failed:", orderResult);
        toast.error(`Failed to create order: ${orderResult?.error || 'Unknown error'}. Please contact support.`);
        return;
      }

      // Extract order number from result
      const orderNum = orderResult.order_number || `BLK${Date.now().toString().slice(-6)}`;
      setOrderNumber(orderNum);

      toast.success("Payment successful! Order created.");
      setCurrentStep(4);
    } catch (error) {
      console.error("Error processing payment:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to process order: ${errorMessage}. Please contact support.`);
    }
  };

  const handlePaystackClose = () => {
    console.log('Paystack payment dialog closed');
    toast.error("Payment was not completed");
  };

  const handlePaystackError = (error: any) => {
    console.error('Paystack payment error:', error);
    toast.error(`Payment failed: ${error.message || 'Unknown error occurred'}`);
  };

  const handleSaveAddress = async () => {
    if (!user?.id) {
      toast.error("Please sign in to save address");
      return;
    }

    if (!validateShipping()) {
      toast.error("Please fill in all required fields before saving");
      return;
    }

    setIsSavingAddress(true);
    try {
      // First, let's check if user has an existing address
      const { data: existingAddress, error: checkError } = await supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing address:', checkError);
      }

      const addressData = {
        user_id: user.id,
        full_name: shippingAddress.fullName.trim(),
        company: shippingAddress.company.trim() || null,
        address_line_1: shippingAddress.address1.trim(),
        address_line_2: shippingAddress.address2.trim() || null,
        city: shippingAddress.city.trim(),
        province: shippingAddress.province.trim(),
        postal_code: shippingAddress.postalCode.trim(),
        phone: shippingAddress.phone.trim(),
        is_default: true
      };

      console.log('Saving address data:', addressData);

      let result;
      if (existingAddress) {
        // Update existing address
        result = await supabase
          .from('user_addresses')
          .update(addressData)
          .eq('user_id', user.id);
      } else {
        // Insert new address
        result = await supabase
          .from('user_addresses')
          .insert([addressData]);
      }

      const { error } = result;

      if (error) {
        console.error('Error saving address:', error);
        toast.error(`Failed to save address: ${error.message || JSON.stringify(error)}`);
      } else {
        toast.success("Address saved to your profile!");
      }
    } catch (error) {
      console.error('Error saving address:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      toast.error(`Failed to save address: ${errorMessage}`);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const steps = [
    { number: 1, title: "Configure Order", icon: Package, desc: "Select products & quantities" },
    { number: 2, title: "Delivery Details", icon: Truck, desc: "Shipping information" },
    { number: 3, title: "Secure Payment", icon: CreditCard, desc: "Complete your purchase" },
    { number: 4, title: "Order Complete", icon: CheckCircle, desc: "Confirmation & tracking" }
  ];

  const renderStep1 = () => (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main Content - 8 columns */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          {/* Product Selection Header */}
          <div className="space-y-2 lg:space-y-4">
            <h2 className="text-xl lg:text-2xl font-semibold text-slate-900">Configure Your Order</h2>
            <p className="text-sm lg:text-base text-slate-600">Select bottle sizes and quantities for your bulk purchase</p>
          </div>

          {/* Current Cart */}
          {cartItems.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 lg:pb-4">
                <CardTitle className="text-base lg:text-lg font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 lg:h-5 lg:w-5 text-slate-500" />
                  Your Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                        <span className="font-semibold text-sm lg:text-base">{item.size} Bottles</span>
                        <Badge variant="secondary" className="text-xs">{item.quantity} bottles</Badge>
                        {item.hasCustomLabel && (
                          <Badge variant="outline" className="text-xs border-primary text-primary">
                            <Palette className="w-3 h-3 mr-1" />
                            {item.labelName || 'Custom Label'}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs lg:text-sm text-slate-600">
                        R{item.unitPrice.toFixed(2)} per bottle
                        {item.hasCustomLabel && (
                          <span className="text-primary"> (includes +R5 custom label)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 lg:w-20 h-7 lg:h-8 text-center text-sm"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm lg:text-base">R{item.subtotal.toFixed(2)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 lg:h-8 lg:w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center p-3 lg:p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold text-sm lg:text-base">Cart Total</span>
                  <span className="text-lg lg:text-xl font-bold text-green-600">R{cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Items Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base lg:text-lg font-medium flex items-center gap-2">
                <Plus className="h-4 w-4 lg:h-5 lg:w-5 text-slate-500" />
                Add Items to Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6">
              {/* Size Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 lg:mb-3 block">Bottle Size</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 lg:gap-3">
                  {Object.keys(pricingData).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size as BottleSize)}
                      className={`
                        relative p-2 lg:p-4 rounded-lg border-2 transition-all duration-200 hover:border-slate-300
                        ${selectedSize === size
                          ? "border-slate-900 bg-slate-50 shadow-sm"
                          : "border-slate-200 bg-white"
                        }
                      `}
                    >
                      {size === '500ml' && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-800 rounded-full p-1">
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                      )}
                      <div className="text-center">
                        <div className={`text-sm lg:text-lg font-semibold ${
                          selectedSize === size ? "text-slate-900" : "text-slate-700"
                        }`}>
                          {size}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {size === '500ml' ? 'Popular' : 'Bottles'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Label Option */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="custom-label"
                    checked={useCustomLabel}
                    onCheckedChange={(checked) => setUseCustomLabel(checked === true)}
                  />
                  <Label htmlFor="custom-label" className="text-sm font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    Add Custom Label (+R5 per bottle)
                  </Label>
                </div>
                {useCustomLabel && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    {loadingLabels ? (
                      <p className="text-xs text-blue-800">Loading saved labels...</p>
                    ) : userLabels.length === 0 ? (
                      <div className="text-xs text-blue-800">
                        <p className="mb-2">No saved labels found.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/profile?tab=labels')}
                          className="text-xs"
                        >
                          Create a label in your profile
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs text-blue-800 block font-medium">Choose saved label:</label>
                        <Select value={selectedLabelId || ''} onValueChange={(value) => setSelectedLabelId(value)}>
                          <SelectTrigger className="w-full text-xs">
                            <SelectValue placeholder="Select a label" />
                          </SelectTrigger>
                          <SelectContent>
                            {userLabels.map(label => (
                              <SelectItem key={label.id} value={label.id}>
                                <div className="flex items-center gap-2">
                                  <span>{label.name}</span>
                                  {label.is_default && <Star className="h-3 w-3 text-yellow-500" />}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-blue-700">
                          The R5 additional cost covers premium label printing and application.
                          <button
                            onClick={() => navigate('/profile?tab=labels')}
                            className="text-primary underline ml-1"
                          >
                            Edit labels in profile
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Input */}
              <div>
                <Label className="text-sm font-medium mb-2 lg:mb-3 block">Quantity</Label>
                <div className="flex gap-2 lg:gap-3 items-end">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="10000"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="text-base lg:text-lg p-3 lg:p-6 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                        placeholder="Enter quantity"
                      />
                      <span className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm lg:text-base">
                        bottles
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={addToCart}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 lg:px-6 py-3 lg:py-6"
                  >
                    <Plus className="h-4 w-4 mr-1 lg:mr-2" />
                    Add to Cart
                  </Button>
                </div>
                
                {quantity > 0 && getCurrentPriceTier() && (
                  <div className="mt-3 lg:mt-4 p-3 lg:p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs lg:text-sm text-slate-600">Pricing Tier</span>
                      <Badge variant="secondary" className="text-xs">
                        {getCurrentPriceTier()?.notes || "Standard"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm lg:text-base font-medium">
                        Unit Price
                        {useCustomLabel && (
                          <span className="text-xs text-primary ml-1">(+R5 custom)</span>
                        )}
                      </span>
                      <span className="font-semibold">R{getCurrentPrice().toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Subtotal for {quantity} bottles</span>
                      <span className="text-base lg:text-lg font-bold text-slate-900">R{(quantity * getCurrentPrice()).toFixed(2)}</span>
                    </div>
                    {useCustomLabel && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        Custom label adds R{(quantity * 5).toFixed(2)} to your total
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-slate-200 shadow-sm bg-slate-50">
            <CardContent className="p-4 lg:p-6">
              <h4 className="font-semibold text-slate-900 mb-3 lg:mb-4 text-sm lg:text-base">Premium Quality Assurance</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs lg:text-sm text-slate-700">BPA-free materials</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs lg:text-sm text-slate-700">Food-grade certified</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs lg:text-sm text-slate-700">Eco-friendly & recyclable</span>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs lg:text-sm text-slate-700">Custom branding available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 4 columns */}
        <div className="lg:col-span-4 space-y-4 lg:space-y-6">
          {/* Product Showcase */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              <img
                src={getBottleImage(selectedSize)}
                alt={`${selectedSize} bottle`}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-3 lg:p-4">
              <h3 className="font-semibold text-slate-900 text-sm lg:text-base">Premium Water Bottles</h3>
              <p className="text-xs lg:text-sm text-slate-600 mt-1">Professional grade, bulk quantities</p>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 lg:h-4 lg:w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs lg:text-sm text-slate-600 ml-2">4.9 (2,847 reviews)</span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Tiers - Dialog Popup */}
          <Dialog open={showPricingTiers} onOpenChange={setShowPricingTiers}>
            <DialogTrigger asChild>
              <Card className="border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                <CardHeader className="pb-3 lg:pb-4">
                  <CardTitle className="text-base lg:text-lg font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4 lg:h-5 lg:w-5 text-slate-500" />
                    <span>View {selectedSize} Pricing Tiers</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-slate-500" />
                  {selectedSize} Pricing Tiers
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-0 max-h-96 overflow-y-auto">
                {pricingData[selectedSize].map((tier, index) => (
                  <div
                    key={index}
                    className={`p-4 border-b border-slate-100 last:border-b-0 transition-colors ${
                      quantity >= tier.min && quantity <= tier.max
                        ? "bg-slate-50 border-l-4 border-l-slate-900"
                        : "bg-white hover:bg-slate-25"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">
                          {tier.min} - {tier.max} bottles
                        </div>
                        {tier.notes && (
                          <div className="text-xs text-slate-500 mt-1">{tier.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-base">R{tier.price.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">per bottle</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Trust Indicators */}
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-green-50 rounded-lg border border-green-200">
              <Award className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="text-xs lg:text-sm font-medium text-green-900">Quality Certified</div>
                <div className="text-xs text-green-700">ISO 9001:2015 certified</div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 flex-shrink-0" />
              <div>
                <div className="text-xs lg:text-sm font-medium text-blue-900">Secure Ordering</div>
                <div className="text-xs text-blue-700">256-bit SSL encryption</div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 flex-shrink-0" />
              <div>
                <div className="text-xs lg:text-sm font-medium text-orange-900">Fast Delivery</div>
                <div className="text-xs text-orange-700">3-5 business days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <div className="space-y-2 lg:space-y-4">
        <h2 className="text-xl lg:text-2xl font-semibold text-slate-900">Delivery Information</h2>
        <p className="text-sm lg:text-base text-slate-600">Please provide accurate delivery details for your bulk order</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-slate-500" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
              <Input
                id="fullName"
                value={shippingAddress.fullName}
                onChange={(e) => handleShippingChange('fullName', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm lg:text-base"
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">Company (Optional)</Label>
              <Input
                id="company"
                value={shippingAddress.company}
                onChange={(e) => handleShippingChange('company', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm lg:text-base"
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address1" className="text-sm font-medium">Street Address *</Label>
              <Input
                id="address1"
                value={shippingAddress.address1}
                onChange={(e) => handleShippingChange('address1', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm lg:text-base"
                placeholder="Enter street address"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address2" className="text-sm font-medium">Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                value={shippingAddress.address2}
                onChange={(e) => handleShippingChange('address2', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm lg:text-base"
                placeholder="Apartment, suite, unit, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">City *</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) => handleShippingChange('city', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm lg:text-base"
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province" className="text-sm font-medium">Province *</Label>
              <Select value={shippingAddress.province} onValueChange={(value) => handleShippingChange('province', value)}>
                <SelectTrigger className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm lg:text-base">
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
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm lg:text-base"
                placeholder="Postal code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
              <Input
                id="phone"
                value={shippingAddress.phone}
                onChange={(e) => handleShippingChange('phone', e.target.value)}
                className="border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm lg:text-base"
                placeholder="Phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Address Button */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Save className="h-5 w-5 text-slate-500" />
              <div>
                <h4 className="font-medium text-slate-900 text-sm lg:text-base">Save Address</h4>
                <p className="text-xs lg:text-sm text-slate-600">Save this address to your profile for future orders</p>
              </div>
            </div>
            <Button
              onClick={handleSaveAddress}
              disabled={isSavingAddress || !validateShipping()}
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {isSavingAddress ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 lg:p-6">
          <div className="flex gap-3">
            <Truck className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-900 mb-2 text-sm lg:text-base">Delivery Information</h4>
              <div className="space-y-1 text-xs lg:text-sm text-amber-800">
                <p>• Processing time: 1-2 business days</p>
                <p>�� Delivery time: 3-5 business days</p>
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
      <div className="space-y-2 lg:space-y-4 mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-semibold text-slate-900">Complete Your Order</h2>
        <p className="text-sm lg:text-base text-slate-600">Review your order details and complete secure payment</p>
      </div>

      {/* Reorder Information */}
      {isReorder && reorderData && (
        <Card className="border-blue-200 bg-blue-50 mb-6">
          <CardContent className="p-4 lg:p-6">
            <div className="flex gap-3">
              <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2 text-sm lg:text-base">Reorder Information</h4>
                <div className="space-y-1 text-xs lg:text-sm text-blue-800">
                  <p>• Original Order: {reorderData.orderNumber}</p>
                  <p>• Original Date: {new Date(reorderData.originalDate).toLocaleDateString()}</p>
                  <p>• Using saved address from your profile</p>
                  <p>• {cartItems.length} item(s) added to cart</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-3 space-y-4 lg:space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Package className="h-4 w-4 lg:h-5 lg:w-5 text-slate-500" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                    {item.hasCustomLabel ? (
                      <Palette className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                    ) : (
                      <img src={getBottleImage(item.size)} alt={`${item.size} bottle`} className="w-full h-full object-contain p-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm lg:text-base">
                      {item.size} Water Bottles
                      {item.hasCustomLabel && (
                        <Badge variant="outline" className="ml-2 text-xs border-primary text-primary">
                          {item.labelName || 'Custom Label'}
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs lg:text-sm text-slate-600">
                      Premium grade, BPA-free
                      {item.hasCustomLabel && ', custom branded'}
                    </p>
                    <p className="text-xs lg:text-sm text-slate-500">Quantity: {item.quantity} bottles</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base lg:text-lg font-bold">R{item.subtotal.toFixed(2)}</p>
                    <p className="text-xs lg:text-sm text-slate-500">
                      R{item.unitPrice.toFixed(2)} each
                      {item.hasCustomLabel && ' (incl. custom label)'}
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2 lg:space-y-3">
                <div className="flex justify-between text-sm lg:text-base">
                  <span>Subtotal</span>
                  <span>R{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs lg:text-sm">
                  <span>Delivery</span>
                  <span className={cartTotal >= 1000 ? "text-green-600" : ""}>
                    {cartTotal >= 1000 ? "FREE" : "R150"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base lg:text-lg font-bold">
                  <span>Total</span>
                  <span>R{(cartTotal >= 1000 ? cartTotal : cartTotal + 150).toFixed(2)}</span>
                </div>
              </div>

              {cartTotal >= 1000 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-xs lg:text-sm font-medium">
                    ✓ Free delivery included - You saved R150
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-slate-500" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs lg:text-sm space-y-1">
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
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-slate-500" />
                Secure Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6">
              <div className="text-center space-y-3 lg:space-y-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-sm lg:text-base">Payment with Paystack</h3>
                  <p className="text-xs lg:text-sm text-slate-600">
                    Secure payment processing powered by Paystack. Your payment details are encrypted and protected.
                  </p>
                </div>
              </div>

              {paystackPublicKey && cartTotal > 0 && user?.email ? (
                <PaystackButton
                  {...paystackConfig}
                  text={`Pay R${(cartTotal >= 1000 ? cartTotal : cartTotal + 150).toFixed(2)}`}
                  onSuccess={handlePaystackSuccess}
                  onClose={handlePaystackClose}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 lg:py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-sm lg:text-base"
                />
              ) : (
                <div className="w-full">
                  <Button
                    disabled
                    className="w-full bg-gray-400 text-white py-2 lg:py-3 px-4 rounded-lg font-medium text-sm lg:text-base"
                  >
                    {!paystackPublicKey
                      ? "Payment Unavailable - Configuration Error"
                      : cartTotal <= 0
                      ? "Add Items to Cart"
                      : !user?.email
                      ? "Please Sign In"
                      : "Payment Unavailable"
                    }
                  </Button>
                  <p className="text-xs text-red-600 mt-2 text-center">
                    {!paystackPublicKey
                      ? "Paystack configuration missing. Please contact support."
                      : cartTotal <= 0
                      ? "Please add items to your cart before proceeding with payment."
                      : !user?.email
                      ? "A valid email address is required for payment processing."
                      : "Unable to process payment at this time."
                    }
                  </p>
                </div>
              )}

              <div className="space-y-2 lg:space-y-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-500 flex-shrink-0" />
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
    <div className="max-w-4xl mx-auto text-center space-y-6 lg:space-y-8">
      <div className="space-y-3 lg:space-y-4">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 lg:h-12 lg:w-12 text-green-600" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Order Confirmed</h2>
        <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
          Thank you for your order. We've received your payment and will begin processing immediately.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm text-left">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="text-base lg:text-lg">Order Receipt</CardTitle>
            <Badge variant="outline" className="text-xs w-fit">
              #{orderNumber || `BLK${Date.now().toString().slice(-6)}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                {item.hasCustomLabel ? (
                  <Palette className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                ) : (
                  <Package className="h-6 w-6 lg:h-8 lg:w-8 text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm lg:text-base">
                  {item.size} Water Bottles
                  {item.hasCustomLabel && (
                    <Badge variant="outline" className="ml-2 text-xs border-primary text-primary">
                      {item.labelName || 'Custom Label'}
                    </Badge>
                  )}
                </h4>
                <p className="text-xs lg:text-sm text-slate-600">
                  {item.quantity} bottles × R{item.unitPrice.toFixed(2)} each
                  {item.hasCustomLabel && ' (includes custom label)'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg lg:text-xl font-bold">R{item.subtotal.toFixed(2)}</p>
              </div>
            </div>
          ))}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <h5 className="font-medium mb-3 text-sm lg:text-base">Order Details</h5>
              <div className="space-y-2 text-xs lg:text-sm">
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
              <h5 className="font-medium mb-3 text-sm lg:text-base">Delivery Address</h5>
              <div className="text-xs lg:text-sm text-slate-600 space-y-1">
                <p className="font-medium text-slate-900">{shippingAddress.fullName}</p>
                {shippingAddress.company && <p>{shippingAddress.company}</p>}
                <p>{shippingAddress.address1}</p>
                {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}</p>
              </div>
            </div>
          </div>

          <div className="p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 lg:mb-3 text-sm lg:text-base">What's Next?</h5>
            <div className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span>Order confirmation sent to your email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span>Processing begins within 2 business hours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span>Tracking information will be provided</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span>Delivery in 3-5 business days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
        <Button
          onClick={() => navigate('/profile')}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 lg:px-6 text-sm lg:text-base"
        >
          Track Order
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/products')}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 px-4 lg:px-6 text-sm lg:text-base"
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
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
          {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(isReorder ? '/profile' : '/products')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm lg:text-base">{isReorder ? 'Back to Profile' : 'Back to Products'}</span>
          </Button>
          <div className="text-center sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              {isReorder ? 'Reorder Items' : 'Bulk Purchase'}
            </h1>
            <p className="text-slate-600 mt-1 text-sm lg:text-base">
              {isReorder ? `Reordering from ${reorderData?.orderNumber || 'previous order'}` : 'Professional ordering made simple'}
            </p>
          </div>
          <div className="hidden sm:block w-32"></div>
        </div>

          {/* Progress Steps */}
          <div className="relative mb-8 lg:mb-12">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;

                return (
                  <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
                    <div className={`
                      flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full transition-all duration-300 mb-2 lg:mb-3
                      ${isCompleted
                        ? "bg-green-600 text-white"
                        : isCurrent
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-400"
                      }
                    `}>
                      <StepIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs lg:text-sm font-medium mb-1 ${
                        isCurrent ? "text-slate-900" : isCompleted ? "text-green-700" : "text-slate-500"
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 max-w-20 lg:max-w-24 hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Progress Line */}
            <div className="absolute top-5 lg:top-6 left-1/2 right-6 h-0.5 bg-slate-200 -z-10" style={{ left: '12.5%', right: '12.5%' }}>
              <div
                className="h-full bg-slate-900 transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8 lg:mb-12">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex flex-col sm:flex-row justify-between items-center max-w-4xl mx-auto gap-4">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-4 lg:px-6 py-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 order-2 sm:order-1 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep < 3 && (
                <Button
                  onClick={handleNextStep}
                  className="px-4 lg:px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white order-1 sm:order-2 w-full sm:w-auto"
                >
                  Continue
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              )}
              {currentStep === 3 && (
                <div className="text-xs lg:text-sm text-slate-600 max-w-xs text-center sm:text-right order-1 sm:order-2">
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
