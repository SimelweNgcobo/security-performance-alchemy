import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Eye, Search, Mail, Phone } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // Get customers with order statistics
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (customersError) throw customersError;

      // Get order statistics for each customer
      const customersWithStats = await Promise.all(
        (customersData || []).map(async (customer) => {
          const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("total_amount")
            .eq("customer_id", customer.id);

          if (ordersError) {
            console.error("Error loading orders for customer:", ordersError);
            return { ...customer, order_count: 0, total_spent: 0 };
          }

          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0;

          return {
            ...customer,
            order_count: orderCount,
            total_spent: totalSpent
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total_amount, created_at")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (error) {
      console.error("Error loading customer orders:", error);
      toast.error("Failed to load customer orders");
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    loadCustomerOrders(customer.id);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Management
          </CardTitle>
          <CardDescription>
            View customer information, order history, and handle support requests
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {customer.city && <div>{customer.city}</div>}
                      {customer.postal_code && (
                        <div className="text-muted-foreground">{customer.postal_code}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.order_count || 0}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">R{(customer.total_spent || 0).toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Customer Details - {selectedCustomer?.name}</DialogTitle>
                          <DialogDescription>
                            Complete customer information and order history
                          </DialogDescription>
                        </DialogHeader>
                        {selectedCustomer && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base">Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div>
                                    <label className="text-sm font-medium">Email:</label>
                                    <p className="text-sm">{selectedCustomer.email}</p>
                                  </div>
                                  {selectedCustomer.phone && (
                                    <div>
                                      <label className="text-sm font-medium">Phone:</label>
                                      <p className="text-sm">{selectedCustomer.phone}</p>
                                    </div>
                                  )}
                                  {selectedCustomer.address && (
                                    <div>
                                      <label className="text-sm font-medium">Address:</label>
                                      <p className="text-sm">
                                        {selectedCustomer.address}
                                        {selectedCustomer.city && `, ${selectedCustomer.city}`}
                                        {selectedCustomer.postal_code && ` ${selectedCustomer.postal_code}`}
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base">Statistics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div>
                                    <label className="text-sm font-medium">Total Orders:</label>
                                    <p className="text-sm">{selectedCustomer.order_count || 0}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Total Spent:</label>
                                    <p className="text-sm">R{(selectedCustomer.total_spent || 0).toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Customer Since:</label>
                                    <p className="text-sm">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Order History</h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {customerOrders.length > 0 ? (
                                  customerOrders.map((order) => (
                                    <Card key={order.id}>
                                      <CardContent className="p-3">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium">R{parseFloat(order.total_amount.toString()).toFixed(2)}</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                              {order.status.replace(/_/g, " ")}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    No orders found for this customer.
                                  </p>
                                )}
                              </div>
                            </div>
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