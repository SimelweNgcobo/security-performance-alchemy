import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  ArrowLeft,
  ShoppingBag,
  Calendar,
  CreditCard
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  delivery_status: string;
  total_amount: number;
  created_at: string;
  payment_reference?: string;
  shipping_address?: string;
  metadata?: string;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    custom_branding_data: any;
    products: {
      name: string;
      type: string;
      size?: string;
    };
  }>;
}

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to view your orders");
      navigate("/auth");
      return;
    }

    if (user) {
      loadUserOrders();
    }
  }, [user, authLoading, navigate]);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            custom_branding_data,
            products (name, type, size)
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
      case "paid":
        return "bg-green-100 text-green-800";
      case "processing":
      case "shipped":
      case "pending":
      case "out_for_delivery":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "failed":
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "out_for_delivery":
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const isBulkOrder = (order: Order) => {
    return order.order_number?.startsWith('BLK') || (order.metadata && JSON.parse(order.metadata || '{}').bottle_size);
  };

  const getBulkOrderDetails = (order: Order) => {
    if (order.metadata) {
      try {
        return JSON.parse(order.metadata);
      } catch {
        return null;
      }
    }
    return null;
  };

  const getShippingAddress = (order: Order) => {
    if (order.shipping_address) {
      try {
        return JSON.parse(order.shipping_address);
      } catch {
        return null;
      }
    }
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner message="Loading your orders..." size="lg" />
            </div>
          </div>
        </div>
        <Layout2Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/profile")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
              <p className="text-muted-foreground">Track your purchases and order history</p>
            </div>
          </div>

          {/* Orders List */}
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {order.order_number}
                          {isBulkOrder(order) && (
                            <Badge variant="default" className="bg-blue-600">
                              Bulk Order
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            R{parseFloat(order.total_amount.toString()).toFixed(2)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(order.delivery_status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.delivery_status)}
                            {order.delivery_status.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(order.payment_status)}>
                          {order.payment_status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Order Items Preview */}
                    <div className="space-y-2 mb-4">
                      {isBulkOrder(order) && getBulkOrderDetails(order) ? (
                        // Bulk order display
                        (() => {
                          const bulkDetails = getBulkOrderDetails(order);
                          return (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div>
                                <p className="font-medium">
                                  {bulkDetails?.quantity} × {bulkDetails?.bottle_size} Water Bottles
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Unit Price: R{bulkDetails?.unit_price?.toFixed(2)}
                                </p>
                              </div>
                              <Badge variant="default" className="bg-blue-600">
                                Bulk Order
                              </Badge>
                            </div>
                          );
                        })()
                      ) : (
                        // Regular order items
                        order.order_items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">
                                {item.quantity}× {item.products.name}
                                {item.products.size && ` (${item.products.size})`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                R{parseFloat(item.unit_price.toString()).toFixed(2)} each
                              </p>
                            </div>
                            {item.products.type === "custom" && (
                              <Badge variant="secondary">Custom</Badge>
                            )}
                          </div>
                        ))
                      )}
                      {order.order_items.length > 2 && !isBulkOrder(order) && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          +{order.order_items.length - 2} more items
                        </p>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Order placed on {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
                            <DialogDescription>
                              Complete order information and tracking details
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Order Status */}
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                      {selectedOrder.status.toUpperCase()}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-2">Order Status</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Badge className={getStatusColor(selectedOrder.payment_status)}>
                                      {selectedOrder.payment_status.toUpperCase()}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-2">Payment</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Badge className={getStatusColor(selectedOrder.delivery_status)}>
                                      {getStatusIcon(selectedOrder.delivery_status)}
                                      <span className="ml-1">
                                        {selectedOrder.delivery_status.replace(/_/g, " ").toUpperCase()}
                                      </span>
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-2">Delivery</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Order Summary */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="font-medium">Order Number:</label>
                                      <p>{selectedOrder.order_number}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">Order Date:</label>
                                      <p>{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">Total Amount:</label>
                                      <p className="text-lg font-semibold text-green-600">
                                        R{parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}
                                      </p>
                                    </div>
                                    {selectedOrder.payment_reference && (
                                      <div>
                                        <label className="font-medium">Payment Reference:</label>
                                        <p className="text-sm font-mono">{selectedOrder.payment_reference}</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Bulk Order Details */}
                              {isBulkOrder(selectedOrder) && getBulkOrderDetails(selectedOrder) && (
                                <Card className="border-blue-200 bg-blue-50">
                                  <CardHeader>
                                    <CardTitle className="text-lg text-blue-800">Bulk Order Details</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {(() => {
                                      const bulkDetails = getBulkOrderDetails(selectedOrder);
                                      return (
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="font-medium text-blue-700">Bottle Size:</label>
                                            <p className="text-lg font-semibold">{bulkDetails?.bottle_size}</p>
                                          </div>
                                          <div>
                                            <label className="font-medium text-blue-700">Quantity:</label>
                                            <p className="text-lg font-semibold">{bulkDetails?.quantity} bottles</p>
                                          </div>
                                          <div>
                                            <label className="font-medium text-blue-700">Unit Price:</label>
                                            <p>R{bulkDetails?.unit_price?.toFixed(2)} per bottle</p>
                                          </div>
                                          <div>
                                            <label className="font-medium text-blue-700">Payment Method:</label>
                                            <p className="capitalize">{bulkDetails?.payment_method || "Card"}</p>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Regular Order Items */}
                              {selectedOrder.order_items.length > 0 && !isBulkOrder(selectedOrder) && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Items Ordered</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {selectedOrder.order_items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                          <div>
                                            <p className="font-medium">
                                              {item.products.name}
                                              {item.products.size && ` (${item.products.size})`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              Quantity: {item.quantity} × R{parseFloat(item.unit_price.toString()).toFixed(2)}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold">
                                              R{(item.quantity * parseFloat(item.unit_price.toString())).toFixed(2)}
                                            </p>
                                            {item.products.type === "custom" && (
                                              <Badge variant="secondary" className="mt-1">Custom</Badge>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Shipping Address */}
                              {getShippingAddress(selectedOrder) && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {(() => {
                                      const address = getShippingAddress(selectedOrder);
                                      return (
                                        <div className="space-y-2">
                                          <p className="font-medium">{address?.fullName}</p>
                                          {address?.company && <p className="text-sm text-muted-foreground">{address.company}</p>}
                                          <div className="text-sm">
                                            <p>{address?.address1}</p>
                                            {address?.address2 && <p>{address.address2}</p>}
                                            <p>{address?.city}, {address?.province} {address?.postalCode}</p>
                                            <p>Phone: {address?.phone}</p>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </p>
                <Button onClick={() => navigate("/products")}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Orders;
