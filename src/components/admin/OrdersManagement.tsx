import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle, Truck, Edit, Save, X as XIcon } from "lucide-react";

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
  customers: {
    name: string;
    email: string;
  };
  order_items: Array<{
    quantity: number;
    unit_price: number;
    custom_branding_data: any;
    products: {
      name: string;
      type: string;
    };
  }>;
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customers (name, email),
          order_items (
            quantity,
            unit_price,
            custom_branding_data,
            products (name, type)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50); // Limit to 50 orders for better performance

      if (error) throw error;
      setOrders(data?.map(order => ({
        ...order,
        metadata: typeof order.metadata === 'string' ? order.metadata : JSON.stringify(order.metadata || {})
      })) || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ [field]: value })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Order status updated successfully");
      loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleStatusUpdate = async (orderId: string) => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    setUpdating(true);
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (adminNotes.trim()) {
        updateData.admin_notes = adminNotes.trim();
      }

      // Set delivery status based on main status
      if (newStatus === 'in_transit') {
        updateData.delivery_status = 'shipped';
      } else if (newStatus === 'delivered') {
        updateData.delivery_status = 'delivered';
      } else if (newStatus === 'cancelled') {
        updateData.delivery_status = 'cancelled';
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
      setEditingOrderId(null);
      setNewStatus('');
      setAdminNotes('');
      loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const startEditingStatus = (order: Order) => {
    setEditingOrderId(order.id);
    setNewStatus(order.status);
    setAdminNotes('');
  };

  const cancelEditing = () => {
    setEditingOrderId(null);
    setNewStatus('');
    setAdminNotes('');
  };

  const getStatusBadge = (status: string, type: "status" | "payment" | "delivery") => {
    const getVariant = () => {
      if (type === "status") {
        switch (status) {
          case "pending": return "secondary";
          case "paid": return "default";
          case "processing": return "outline";
          case "shipped": return "secondary";
          case "delivered": return "default";
          case "cancelled": return "destructive";
          case "declined": return "destructive";
          default: return "secondary";
        }
      } else if (type === "payment") {
        switch (status) {
          case "paid": return "default";
          case "unpaid": return "destructive";
          case "refunded": return "secondary";
          case "partial_refund": return "outline";
          default: return "secondary";
        }
      } else {
        switch (status) {
          case "delivered": return "default";
          case "out_for_delivery": return "secondary";
          case "processing": return "outline";
          case "not_shipped": return "destructive";
          default: return "secondary";
        }
      }
    };

    return (
      <Badge variant={getVariant()}>
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  const hasCustomBranding = (order: Order) => {
    return order.order_items.some(item =>
      item.products.type === "custom" && item.custom_branding_data
    );
  };

  const isBulkOrder = (order: Order) => {
    // Check if it's a bulk order based on metadata or order pattern
    if (order.metadata) {
      try {
        const metadata = JSON.parse(order.metadata);
        return metadata.bottle_size && metadata.quantity;
      } catch {
        return false;
      }
    }
    return order.order_number?.startsWith('BLK');
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

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Orders Management
          </CardTitle>
          <CardDescription>
            View all orders, approve custom branding, and update order status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customers?.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customers?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>R{parseFloat(order.total_amount.toString()).toFixed(2)}</TableCell>
                  <TableCell>
                    {editingOrderId === order.id ? (
                      <div className="space-y-2">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          placeholder="Admin notes (optional)"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="h-20 text-xs"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id)}
                            disabled={updating || !newStatus}
                            className="h-7 px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            className="h-7 px-2"
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status, "status")}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingStatus(order)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.payment_status, "payment")}</TableCell>
                  <TableCell>
                    <Select 
                      value={order.delivery_status} 
                      onValueChange={(value) => updateOrderStatus(order.id, "delivery_status", value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_shipped">Not Shipped</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {isBulkOrder(order) ? (
                      <Badge variant="default" className="bg-blue-600">Bulk</Badge>
                    ) : hasCustomBranding(order) ? (
                      <Badge variant="secondary">Custom</Badge>
                    ) : (
                      <Badge variant="outline">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
                          <DialogDescription>
                            Complete order information and custom branding details
                          </DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-6">
                            {/* Order Type Badge */}
                            <div className="flex items-center gap-2">
                              {isBulkOrder(selectedOrder) && (
                                <Badge variant="default" className="bg-blue-600">
                                  Bulk Order
                                </Badge>
                              )}
                              {hasCustomBranding(selectedOrder) && (
                                <Badge variant="secondary">
                                  Custom Branding
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="font-medium">Customer:</label>
                                <p>{selectedOrder.customers?.name}</p>
                                <p className="text-sm text-muted-foreground">{selectedOrder.customers?.email}</p>
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

                            {/* Bulk Order Details */}
                            {isBulkOrder(selectedOrder) && getBulkOrderDetails(selectedOrder) && (
                              <Card className="border-blue-200 bg-blue-50">
                                <CardHeader className="pb-3">
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

                            {/* Shipping Address */}
                            {getShippingAddress(selectedOrder) && (
                              <Card>
                                <CardHeader className="pb-3">
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

                            {/* Regular Order Items (for non-bulk orders or custom items) */}
                            {(selectedOrder.order_items.length > 0 && !isBulkOrder(selectedOrder)) && (
                              <div>
                                <label className="font-medium">Order Items:</label>
                                <div className="space-y-2 mt-2">
                                  {selectedOrder.order_items.map((item, index) => (
                                    <Card key={index}>
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium">{item.products.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              Quantity: {item.quantity} × R{parseFloat(item.unit_price.toString()).toFixed(2)}
                                            </p>
                                            {item.custom_branding_data && (
                                              <div className="mt-2 p-2 bg-muted rounded">
                                                <p className="text-sm font-medium">Custom Branding:</p>
                                                <pre className="text-xs text-muted-foreground">
                                                  {JSON.stringify(item.custom_branding_data, null, 2)}
                                                </pre>
                                              </div>
                                            )}
                                          </div>
                                          {item.products.type === "custom" && (
                                            <div className="space-x-2">
                                              <Button size="sm" variant="outline">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                              </Button>
                                              <Button size="sm" variant="destructive">
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Decline
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
