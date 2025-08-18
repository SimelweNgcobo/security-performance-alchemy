import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Truck, MapPin, Plus, Edit } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  status: string;
  delivery_status: string;
  delivery_address?: string;
  delivery_city?: string;
  created_at: string;
  customers: {
    name: string;
    phone?: string;
  };
  delivery_assignments?: Array<{
    id: string;
    driver_name: string;
    driver_phone?: string;
    assigned_at: string;
    delivered_at?: string;
    delivery_notes?: string;
  }>;
}

export function DeliveryManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    driverName: "",
    driverPhone: "",
    deliveryNotes: ""
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customers (name, phone),
          delivery_assignments (*)
        `)
        .in("status", ["paid", "processing", "shipped"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const assignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("delivery_assignments")
        .insert([{
          order_id: selectedOrder.id,
          driver_name: assignmentForm.driverName,
          driver_phone: assignmentForm.driverPhone,
          delivery_notes: assignmentForm.deliveryNotes
        }]);

      if (error) throw error;

      // Update order delivery status
      await supabase
        .from("orders")
        .update({ delivery_status: "out_for_delivery" })
        .eq("id", selectedOrder.id);

      toast.success("Driver assigned successfully");
      setShowAssignDialog(false);
      setAssignmentForm({ driverName: "", driverPhone: "", deliveryNotes: "" });
      loadOrders();
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error("Failed to assign driver");
    }
  };

  const markAsDelivered = async (orderId: string, assignmentId: string) => {
    try {
      const now = new Date().toISOString();

      // Update delivery assignment
      await supabase
        .from("delivery_assignments")
        .update({ delivered_at: now })
        .eq("id", assignmentId);

      // Update order status
      await supabase
        .from("orders")
        .update({ 
          delivery_status: "delivered",
          status: "delivered"
        })
        .eq("id", orderId);

      toast.success("Order marked as delivered");
      loadOrders();
    } catch (error) {
      console.error("Error marking as delivered:", error);
      toast.error("Failed to mark as delivered");
    }
  };

  const updateDeliveryStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ delivery_status: status })
        .eq("id", orderId);

      if (error) throw error;
      
      toast.success("Delivery status updated");
      loadOrders();
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("Failed to update delivery status");
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    const variants = {
      "not_shipped": "destructive",
      "processing": "outline",
      "out_for_delivery": "secondary",
      "delivered": "default"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading delivery information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Ship</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.delivery_status === "processing").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out for Delivery</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.delivery_status === "out_for_delivery").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => 
                o.delivery_status === "delivered" && 
                o.delivery_assignments?.[0]?.delivered_at &&
                new Date(o.delivery_assignments[0].delivered_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Delivered</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.delivery_status === "delivered").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Management
          </CardTitle>
          <CardDescription>
            Assign drivers, track delivery status, and manage pickup/delivery addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Delivery Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customers.name}</div>
                      {order.customers.phone && (
                        <div className="text-sm text-muted-foreground">{order.customers.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.delivery_address && <div>{order.delivery_address}</div>}
                      {order.delivery_city && <div>{order.delivery_city}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.delivery_status} 
                      onValueChange={(value) => updateDeliveryStatus(order.id, value)}
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
                    {order.delivery_assignments && order.delivery_assignments.length > 0 ? (
                      <div>
                        <div className="font-medium">{order.delivery_assignments[0].driver_name}</div>
                        {order.delivery_assignments[0].driver_phone && (
                          <div className="text-sm text-muted-foreground">
                            {order.delivery_assignments[0].driver_phone}
                          </div>
                        )}
                        {order.delivery_assignments[0].delivered_at && (
                          <div className="text-xs text-green-600">
                            Delivered: {new Date(order.delivery_assignments[0].delivered_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!order.delivery_assignments || order.delivery_assignments.length === 0 ? (
                        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Driver</DialogTitle>
                              <DialogDescription>
                                Assign a driver to order {selectedOrder?.order_number}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={assignDriver} className="space-y-4">
                              <div>
                                <Label htmlFor="driverName">Driver Name</Label>
                                <Input
                                  id="driverName"
                                  value={assignmentForm.driverName}
                                  onChange={(e) => setAssignmentForm({...assignmentForm, driverName: e.target.value})}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="driverPhone">Driver Phone</Label>
                                <Input
                                  id="driverPhone"
                                  value={assignmentForm.driverPhone}
                                  onChange={(e) => setAssignmentForm({...assignmentForm, driverPhone: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                                <Textarea
                                  id="deliveryNotes"
                                  value={assignmentForm.deliveryNotes}
                                  onChange={(e) => setAssignmentForm({...assignmentForm, deliveryNotes: e.target.value})}
                                  placeholder="Special delivery instructions..."
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit">Assign Driver</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      ) : null}
                      
                      {order.delivery_assignments && order.delivery_assignments.length > 0 && order.delivery_status === "out_for_delivery" && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => markAsDelivered(order.id, order.delivery_assignments?.[0]?.id || '')}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
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