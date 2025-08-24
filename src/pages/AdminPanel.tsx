import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  CreditCard, 
  Truck, 
  BarChart3, 
  UserCog, 
  Settings,
  LogOut
} from "lucide-react";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { CustomersManagement } from "@/components/admin/CustomersManagement";
import { PaymentsInvoices } from "@/components/admin/PaymentsInvoices";
import { DeliveryManagement } from "@/components/admin/DeliveryManagement";
import { ReportsAnalytics } from "@/components/admin/ReportsAnalytics";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { EnterpriseRequests } from "@/components/admin/EnterpriseRequests";
import { UserLabelsManagement } from "@/components/admin/UserLabelsManagement";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    checkAdminAccess();
    loadDashboardStats();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in to access the admin panel");
        navigate("/admin-auth");
        return;
      }

      // Check if user has admin privileges
      const { data: adminUser, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error || !adminUser) {
        // For development purposes, allow access if user email matches admin pattern
        if (user.email === 'mq.ngcobo@myfuze.co.za' || user.email === 'ceo@rebookedsolutions.co.za') {
          console.log("Dev access granted for admin user");
          setIsAdmin(true);
          return;
        }

        toast.error("Access denied. Admin privileges required.");
        navigate("/admin-auth");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Error verifying admin access");
      navigate("/admin-auth");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from("orders").select("id, status, total_amount"),
        supabase.from("products").select("id").eq("is_active", true),
        supabase.from("customers").select("id")
      ]);

      const totalOrders = ordersRes.data?.length || 0;
      const pendingOrders = ordersRes.data?.filter(o => o.status === 'pending').length || 0;
      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (parseFloat(order.total_amount.toString()) || 0), 0) || 0;

      setStats({
        totalOrders,
        pendingOrders,
        totalProducts: productsRes.data?.length || 0,
        totalCustomers: customersRes.data?.length || 0,
        totalRevenue
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Verifying admin access..." size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <Badge variant="secondary">Panel-1973</Badge>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            <TabsTrigger value="labels">Labels</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="admin-users">Admins</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R{stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Process Pending Orders
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>New order received</span>
                      <span className="text-muted-foreground">2 min ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product stock updated</span>
                      <span className="text-muted-foreground">15 min ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment processed</span>
                      <span className="text-muted-foreground">1 hour ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsInvoices />
          </TabsContent>

          <TabsContent value="delivery">
            <DeliveryManagement />
          </TabsContent>

          <TabsContent value="enterprise">
            <EnterpriseRequests />
          </TabsContent>

          <TabsContent value="labels">
            <UserLabelsManagement />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsAnalytics />
          </TabsContent>

          <TabsContent value="admin-users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
