import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  LogOut,
  Building2,
  Tag,
  Menu,
  X,
  Home,
  Bell
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
import { ContactReports } from "@/components/admin/ContactReports";
import LoadingSpinner from "@/components/LoadingSpinner";

type AdminTab = 'dashboard' | 'orders' | 'products' | 'customers' | 'payments' | 'delivery' | 'enterprise' | 'labels' | 'contact' | 'reports' | 'admin-users' | 'settings';

interface NavigationItem {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: 'main' | 'business' | 'system';
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    description: 'Overview and metrics',
    category: 'main'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <ShoppingCart className="h-5 w-5" />,
    description: 'Manage customer orders',
    category: 'business'
  },
  {
    id: 'products',
    label: 'Products',
    icon: <Package className="h-5 w-5" />,
    description: 'Product catalog management',
    category: 'business'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: <Users className="h-5 w-5" />,
    description: 'Customer management',
    category: 'business'
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Payment processing & invoices',
    category: 'business'
  },
  {
    id: 'delivery',
    label: 'Delivery',
    icon: <Truck className="h-5 w-5" />,
    description: 'Shipping and delivery',
    category: 'business'
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Enterprise requests',
    category: 'business'
  },
  {
    id: 'labels',
    label: 'Labels',
    icon: <Tag className="h-5 w-5" />,
    description: 'User label management',
    category: 'business'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'Analytics and reports',
    category: 'main'
  },
  {
    id: 'admin-users',
    label: 'Admin Users',
    icon: <UserCog className="h-5 w-5" />,
    description: 'Admin user management',
    category: 'system'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    description: 'System configuration',
    category: 'system'
  }
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    processingOrders: 0,
    completedOrders: 0
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
      // Get comprehensive order data
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, status, total_amount, payment_status, created_at");

      if (ordersError) {
        console.error("Error loading orders:", ordersError);
      }

      // Get products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: 'exact', head: true })
        .eq("is_active", true);

      // Get customers count
      const { count: customersCount } = await supabase
        .from("customers")
        .select("*", { count: 'exact', head: true });

      // Calculate stats from real data
      const orders = ordersData || [];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const processingOrders = orders.filter(o => o.status === 'processing').length;
      const completedOrders = orders.filter(o => o.status === 'delivered').length;
      const paidOrders = orders.filter(o => o.payment_status === 'paid').length;
      const totalRevenue = orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, order) => sum + (parseFloat(order.total_amount?.toString() || '0')), 0);

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const monthlyRevenue = orders
        .filter(o =>
          o.payment_status === 'paid' &&
          new Date(o.created_at) >= thirtyDaysAgo
        )
        .reduce((sum, order) => sum + (parseFloat(order.total_amount?.toString() || '0')), 0);

      setStats({
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        totalProducts: productsCount || 6,
        totalCustomers: customersCount || 0,
        totalRevenue,
        monthlyRevenue
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      // Set fallback stats if there's an error
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        totalProducts: 6,
        totalCustomers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const getUserInitials = (email?: string) => {
    if (!email) return "A";
    return email.charAt(0).toUpperCase();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome to MyFuze Admin</h1>
              <p className="text-blue-100">Manage your water business operations from this central dashboard</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">All time orders</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">Awaiting processing</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R{stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All time revenue</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('orders')}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Manage Orders ({stats.pendingOrders} pending)
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('products')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Product Management
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('customers')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Customer Support
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('reports')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Status Overview</CardTitle>
                  <CardDescription>Current order distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="font-semibold">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Processing</span>
                    </div>
                    <span className="font-semibold">{stats.processingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="font-semibold">{stats.completedOrders}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Orders</span>
                    <span>{stats.totalOrders}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'orders':
        return <OrdersManagement />;
      case 'products':
        return <ProductsManagement />;
      case 'customers':
        return <CustomersManagement />;
      case 'payments':
        return <PaymentsInvoices />;
      case 'delivery':
        return <DeliveryManagement />;
      case 'enterprise':
        return <EnterpriseRequests />;
      case 'labels':
        return <UserLabelsManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'admin-users':
        return <AdminUsers />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <div>Page not found</div>;
    }
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                MF
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">MyFuze Admin</h2>
                <p className="text-xs text-gray-500">Panel-1973</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            {/* Main Section */}
            {sidebarOpen && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
              </div>
            )}
            {navigationItems.filter(item => item.category === 'main').map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {item.icon}
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            ))}

            {/* Business Section */}
            {sidebarOpen && (
              <div className="px-3 py-2 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</h3>
              </div>
            )}
            {navigationItems.filter(item => item.category === 'business').map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {item.icon}
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
                {item.id === 'orders' && stats.pendingOrders > 0 && sidebarOpen && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {stats.pendingOrders}
                  </Badge>
                )}
              </button>
            ))}

            {/* System Section */}
            {sidebarOpen && (
              <div className="px-3 py-2 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System</h3>
              </div>
            )}
            {navigationItems.filter(item => item.category === 'system').map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {item.icon}
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getUserInitials('admin@myfuze.co.za')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@myfuze.co.za</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2" title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500">
              {navigationItems.find(item => item.id === activeTab)?.description || 'Admin dashboard overview'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2" title="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Badge variant="outline" className="text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
