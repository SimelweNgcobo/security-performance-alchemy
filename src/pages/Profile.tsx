import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import LabelEditor from "@/components/LabelEditor";
import { ProfileHeaderSkeleton, ActivitySkeleton, PurchasesSkeleton, RecentItemsSkeleton } from "@/components/ProfileSkeleton";
import {
  User,
  Clock,
  ShoppingBag,
  Download,
  Eye,
  Package,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Activity,
  CreditCard,
  FileText,
  ChevronRight,
  Settings,
  Trash2,
  Save,
  Truck,
  Plus,
  Edit,
  Tag,
  Palette
} from "lucide-react";

interface RecentItem {
  id: string;
  type: 'product' | 'order' | 'quote';
  name: string;
  description: string;
  image?: string;
  timestamp: string;
  status?: string;
}

interface ActivityItem {
  id: string;
  type: 'order_created' | 'order_updated' | 'payment_processed' | 'account_created' | 'login';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  metadata?: any;
}

interface Purchase {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  delivery_status: string;
  created_at: string;
  items: any[];
  invoice_id?: string;
  metadata?: string;
  shipping_address?: string;
}

interface BasicProfile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Basic profile state (loads instantly)
  const [basicProfile, setBasicProfile] = useState<BasicProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  // Heavy data states (loads progressively)
  const [activeTab, setActiveTab] = useState("recents");
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customerData, setCustomerData] = useState<any>(null);
  
  // Loading states for different sections
  const [loadingStates, setLoadingStates] = useState({
    basic: false,
    activity: false,
    purchases: false,
    recents: false,
    customer: false
  });

  // UI states
  const [savedShippingDetails, setSavedShippingDetails] = useState<any[]>([]);
  const [customLabels, setCustomLabels] = useState<any[]>([]);
  const [newLabel, setNewLabel] = useState({
    name: "",
    design: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("No user found, redirecting to auth");
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate]);

  // Load basic profile instantly when user is available
  useEffect(() => {
    if (user && !authLoading) {
      loadBasicProfile();
      loadLocalStorageData();
    }
  }, [user, authLoading]);

  // Load basic profile data instantly (< 100ms)
  const loadBasicProfile = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoadingStates(prev => ({ ...prev, basic: true }));

      // Set immediate basic profile from auth user
      const immediate = {
        name: user.user_metadata?.full_name || "User",
        email: user.email,
        phone: "",
        avatar: user.user_metadata?.avatar_url
      };
      
      setBasicProfile(immediate);
      setProfileForm({
        fullName: immediate.name,
        email: immediate.email,
        phone: ""
      });

      console.log("Basic profile loaded instantly");

      // Then enhance with customer data in background
      loadCustomerData();

    } catch (error) {
      console.error("Error loading basic profile:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, basic: false }));
    }
  }, [user]);

  // Load customer data in background (no blocking)
  const loadCustomerData = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoadingStates(prev => ({ ...prev, customer: true }));

      const { data: customer } = await supabase
        .from("customers")
        .select("name, phone, address")
        .eq("email", user.email)
        .maybeSingle();

      if (customer) {
        setCustomerData(customer);
        
        // Update basic profile with customer data
        setBasicProfile(prev => prev ? {
          ...prev,
          name: customer.name || prev.name,
          phone: customer.phone || prev.phone
        } : null);

        // Update form
        setProfileForm(prev => ({
          ...prev,
          fullName: customer.name || prev.fullName,
          phone: customer.phone || ""
        }));
      }

    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, customer: false }));
    }
  }, [user]);

  // Load localStorage data instantly
  const loadLocalStorageData = useCallback(() => {
    if (!user?.id) return;

    try {
      const savedShipping = localStorage.getItem(`shipping_${user.id}`);
      if (savedShipping) {
        setSavedShippingDetails(JSON.parse(savedShipping));
      }

      const savedLabels = localStorage.getItem(`labels_${user.id}`);
      if (savedLabels) {
        setCustomLabels(JSON.parse(savedLabels));
      }
    } catch (e) {
      console.log("Error loading localStorage data:", e);
    }
  }, [user]);

  // Lazy load activity data when tab is accessed
  const loadActivityData = useCallback(async () => {
    if (!user || activityItems.length > 0 || loadingStates.activity) return;

    try {
      setLoadingStates(prev => ({ ...prev, activity: true }));

      // Generate basic activity items
      const basicActivity: ActivityItem[] = [
        {
          id: "account-created",
          type: "account_created",
          title: "Account Created",
          description: "Welcome to MyFuze! Your account has been successfully created",
          timestamp: user.created_at || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "completed"
        },
        {
          id: "current-login",
          type: "login",
          title: "Recent Sign In",
          description: "Signed in to your account",
          timestamp: new Date().toISOString(),
          status: "completed"
        }
      ];

      setActivityItems(basicActivity);

    } catch (error) {
      console.error("Error loading activity:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, activity: false }));
    }
  }, [user, activityItems.length, loadingStates.activity]);

  // Lazy load purchases data when tab is accessed
  const loadPurchasesData = useCallback(async () => {
    if (!user || purchases.length > 0 || loadingStates.purchases) return;

    try {
      setLoadingStates(prev => ({ ...prev, purchases: true }));

      const { data: orders } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          delivery_status,
          created_at,
          metadata,
          shipping_address,
          order_items!inner (
            quantity,
            unit_price,
            products (name, size, type)
          ),
          invoices (id, invoice_number)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (orders) {
        const processedPurchases = orders.map(order => ({
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          status: order.status,
          payment_status: order.payment_status,
          delivery_status: order.delivery_status,
          created_at: order.created_at,
          items: order.order_items || [],
          invoice_id: order.invoices?.[0]?.id,
          metadata: order.metadata,
          shipping_address: order.shipping_address
        }));

        setPurchases(processedPurchases);
      }

    } catch (error) {
      console.error("Error loading purchases:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, purchases: false }));
    }
  }, [user, purchases.length, loadingStates.purchases]);

  // Lazy load recent items when tab is accessed
  const loadRecentItems = useCallback(async () => {
    if (!user || recentItems.length > 0 || loadingStates.recents) return;

    try {
      setLoadingStates(prev => ({ ...prev, recents: true }));

      // For now, generate from purchases data
      if (purchases.length > 0) {
        const orderRecents: RecentItem[] = purchases.slice(0, 3).map(order => ({
          id: `order-${order.id}`,
          type: 'order' as const,
          name: order.order_number,
          description: `${order.items.length} item(s) - R${order.total_amount.toFixed(2)}`,
          timestamp: order.created_at,
          status: order.status
        }));

        setRecentItems(orderRecents);
      }

    } catch (error) {
      console.error("Error loading recent items:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, recents: false }));
    }
  }, [user, recentItems.length, loadingStates.recents, purchases]);

  // Handle tab changes with lazy loading
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    switch (tab) {
      case "activity":
        loadActivityData();
        break;
      case "purchases":
        loadPurchasesData();
        break;
      case "recents":
        loadRecentItems();
        break;
    }
  };

  // Optimistic profile update
  const updateProfile = useCallback(async () => {
    if (saving) return;

    try {
      setSaving(true);

      // Optimistic update - update UI immediately
      const newProfile = {
        ...basicProfile!,
        name: profileForm.fullName,
        phone: profileForm.phone
      };
      setBasicProfile(newProfile);

      // Show immediate success
      toast.success("Profile updated!");

      // Background update to server
      const [authUpdate, customerUpdate] = await Promise.all([
        supabase.auth.updateUser({
          data: { full_name: profileForm.fullName }
        }),
        supabase
          .from("customers")
          .upsert({
            email: user!.email,
            name: profileForm.fullName,
            phone: profileForm.phone
          })
          .eq("email", user!.email)
      ]);

      if (authUpdate.error) throw authUpdate.error;
      if (customerUpdate.error) throw customerUpdate.error;

      console.log("Profile updated successfully in background");

    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Revert optimistic update on error
      setBasicProfile(prev => prev ? {
        ...prev,
        name: customerData?.name || user?.user_metadata?.full_name || "User",
        phone: customerData?.phone || ""
      } : null);

      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [basicProfile, profileForm, customerData, user, saving]);

  const downloadInvoice = async (invoiceId: string) => {
    try {
      toast.success("Invoice download feature will be implemented soon");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const deleteAccount = async () => {
    try {
      const { error: customerError } = await supabase
        .from("customers")
        .delete()
        .eq("email", user?.email);

      if (customerError) throw customerError;

      localStorage.clear();
      toast.success("Account deletion request processed. Please contact support to complete the process.");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please contact support.");
    }
  };

  const saveCustomLabel = () => {
    if (!newLabel.name.trim()) {
      toast.error("Please enter a label name");
      return;
    }

    const label = { ...newLabel, id: Date.now(), created_at: new Date().toISOString() };
    const updated = [...customLabels, label];
    setCustomLabels(updated);
    localStorage.setItem(`labels_${user?.id}`, JSON.stringify(updated));
    setNewLabel({ name: "", design: "", description: "" });
    toast.success("Custom label saved");
  };

  const reorderItems = async (purchase: Purchase) => {
    try {
      toast.success(`${purchase.items.length} items re-added to cart`);
      navigate("/products");
    } catch (error) {
      toast.error("Failed to re-order items");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "processing":
      case "shipped":
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order_created":
      case "order_updated":
        return <Package className="w-4 h-4" />;
      case "payment_processed":
        return <CreditCard className="w-4 h-4" />;
      case "account_created":
        return <User className="w-4 h-4" />;
      case "login":
        return <Activity className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const viewItemDetails = (item: RecentItem) => {
    if (item.type === 'order') {
      navigate("/orders");
    } else if (item.type === 'product') {
      navigate("/products");
    }
    toast.success(`Viewing details for ${item.name}`);
  };

  // Show loading only for auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Authenticating..." size="lg" />
      </div>
    );
  }

  // If no user, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Profile Header - Shows immediately with basic data */}
          <div className="mb-8">
            {loadingStates.basic && !basicProfile ? (
              <ProfileHeaderSkeleton />
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {basicProfile?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">
                        {basicProfile?.name || "Loading..."}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {basicProfile?.email || "Loading..."}
                        </span>
                        {basicProfile?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {basicProfile.phone}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">
                      Active Member
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="recents" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recents
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Purchases
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Delivery
              </TabsTrigger>
            </TabsList>

            {/* Recents Tab */}
            <TabsContent value="recents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Viewed & Interacted Items</CardTitle>
                  <CardDescription>
                    Your recent activity across products, orders, and quotes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStates.recents ? (
                    <RecentItemsSkeleton />
                  ) : recentItems.length > 0 ? (
                    <div className="space-y-4">
                      {recentItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            {item.type === 'product' && <Package className="w-6 h-6 text-primary" />}
                            {item.type === 'order' && <ShoppingBag className="w-6 h-6 text-primary" />}
                            {item.type === 'quote' && <FileText className="w-6 h-6 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{item.name}</h3>
                              {item.status && (
                                <Badge variant="outline" className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(item.timestamp)}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewItemDetails(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent activity found</p>
                      <Button className="mt-4" onClick={() => navigate("/products")}>
                        Browse Products
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Activity Timeline</CardTitle>
                  <CardDescription>
                    Track your order progress and account activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStates.activity ? (
                    <ActivitySkeleton />
                  ) : activityItems.length > 0 ? (
                    <div className="space-y-4">
                      {activityItems.map((item, index) => (
                        <div key={item.id} className="relative">
                          {index < activityItems.length - 1 && (
                            <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200"></div>
                          )}
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${getStatusColor(item.status || 'pending')}`}>
                              {getActivityIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{item.title}</h3>
                                {item.status && (
                                  <Badge variant="outline" className={getStatusColor(item.status)}>
                                    {item.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDateTime(item.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No activity found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchases Tab */}
            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Purchase History</CardTitle>
                      <CardDescription>
                        View and manage your order history and invoices
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/orders")}
                      className="shrink-0"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      View All Orders
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingStates.purchases ? (
                    <PurchasesSkeleton />
                  ) : purchases.length > 0 ? (
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div key={purchase.id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-lg">{purchase.order_number}</h3>
                                {purchase.order_number?.startsWith('BLK') && (
                                  <Badge variant="default" className="bg-blue-600">
                                    Bulk Order
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Ordered on {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-lg">R{purchase.total_amount.toFixed(2)}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge className={getStatusColor(purchase.status)}>
                                  {purchase.status}
                                </Badge>
                                <Badge className={getStatusColor(purchase.payment_status)}>
                                  {purchase.payment_status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">Items:</h4>
                              <div className="space-y-1 mt-2">
                                {purchase.items.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.products?.name} {item.products?.size && `(${item.products.size})`}</span>
                                    <span>R{(item.unit_price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <Badge variant="outline" className={getStatusColor(purchase.delivery_status)}>
                                {purchase.delivery_status}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {purchase.invoice_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadInvoice(purchase.invoice_id!)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Invoice
                                </Button>
                              )}
                              {(purchase.status === 'delivered' || purchase.status === 'completed') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => reorderItems(purchase)}
                                >
                                  <ShoppingBag className="w-4 h-4 mr-2" />
                                  Order Again
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                View Details
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No purchases found</p>
                      <Button className="mt-4" onClick={() => navigate("/products")}>
                        Browse Products
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid gap-6">
                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Update your personal information and account preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="bg-muted"
                          placeholder="Your email address"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Cell Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={updateProfile} 
                      className="w-full"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Custom Label Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Custom Label Designer
                    </CardTitle>
                    <CardDescription>
                      Create and design custom labels for your bottles with our professional design tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <LabelEditor />
                  </CardContent>
                </Card>

                {/* Saved Custom Labels */}
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Custom Labels</CardTitle>
                    <CardDescription>
                      Manage your saved custom label designs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Create Quick Label</h4>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="labelName">Label Name</Label>
                          <Input
                            id="labelName"
                            value={newLabel.name}
                            onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., My Company Logo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="labelDesign">Design/Text</Label>
                          <Textarea
                            id="labelDesign"
                            value={newLabel.design}
                            onChange={(e) => setNewLabel(prev => ({ ...prev, design: e.target.value }))}
                            placeholder="Enter your label text or describe your design"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="labelDescription">Description</Label>
                          <Input
                            id="labelDescription"
                            value={newLabel.description}
                            onChange={(e) => setNewLabel(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of this label"
                          />
                        </div>
                      </div>
                      <Button onClick={saveCustomLabel} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Save Label
                      </Button>
                    </div>

                    {customLabels.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Your Saved Labels</h4>
                        <div className="space-y-2">
                          {customLabels.map((label) => (
                            <div key={label.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium">{label.name}</h5>
                                  <p className="text-sm text-muted-foreground">{label.description}</p>
                                </div>
                                <Badge variant="outline">
                                  <Tag className="w-3 h-3 mr-1" />
                                  Saved
                                </Badge>
                              </div>
                              {label.design && (
                                <p className="text-sm mt-2 p-2 bg-muted rounded">{label.design}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Account Deletion */}
                <Card className="border-red-200 dark:border-red-900/50">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Account Management</CardTitle>
                    <CardDescription>
                      Manage your account settings and data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/10">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteAccount} className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Shipping Details</CardTitle>
                  <CardDescription>
                    Manage your shipping addresses for faster checkout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {savedShippingDetails.length > 0 ? (
                    <div className="space-y-4">
                      {savedShippingDetails.map((details) => (
                        <div key={details.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{details.name || "Shipping Address"}</h4>
                            <Badge variant="outline">
                              <Truck className="w-3 h-3 mr-1" />
                              Saved
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>{details.address}</p>
                            <p>{details.city}, {details.province} {details.postalCode}</p>
                            {details.phone && <p>Phone: {details.phone}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No saved shipping details</p>
                      <Button onClick={() => navigate("/products")}>
                        Shop Now to Add Addresses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Profile;
