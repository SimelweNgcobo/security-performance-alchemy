import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { userLabelsService, UserLabel } from "@/services/userLabels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ProfileHeaderSkeleton, ActivitySkeleton, PurchasesSkeleton, RecentItemsSkeleton } from "@/components/ProfileSkeleton";
import {
  User,
  Clock,
  ShoppingBag,
  Download,
  Eye,
  Package,
  Mail,
  Phone,
  Activity,
  CreditCard,
  FileText,
  ChevronRight,
  Save,
  Truck,
  Tag,
  Star,
  Trash2,
  Settings,
  Plus
} from "lucide-react";

// Lazy load heavy components
// const LabelEditor = lazy(() => import("@/components/LabelEditor"));

interface BasicProfile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface RecentItem {
  id: string;
  type: 'product' | 'order' | 'quote';
  name: string;
  description: string;
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

  // Tab state
  const [activeTab, setActiveTab] = useState("settings");
  
  // Heavy data states (loads on demand)
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  // Loading states for different sections
  const [loadingStates, setLoadingStates] = useState({
    basic: false,
    activity: false,
    purchases: false,
    recents: false
  });

  // UI states
  const [saving, setSaving] = useState(false);
  const [userLabels, setUserLabels] = useState<UserLabel[]>([]);
  const [defaultLabel, setDefaultLabel] = useState<UserLabel | null>(null);
  const [savedShippingDetails, setSavedShippingDetails] = useState<any[]>([]);
  const [loadingLabels, setLoadingLabels] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate]);

  // Load basic profile instantly when user is available
  useEffect(() => {
    if (user && !authLoading) {
      loadBasicProfile();
    }
  }, [user, authLoading]);

  // Load basic profile data instantly
  const loadBasicProfile = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoadingStates(prev => ({ ...prev, basic: true }));

      // Set immediate basic profile from auth user
      const immediate = {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
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

      // Then enhance with customer data in background
      setTimeout(() => {
        loadCustomerData();
      }, 100);

    } catch (error) {
      console.error("Error loading basic profile:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, basic: false }));
    }
  }, [user]);

  // Load customer data in background
  const loadCustomerData = useCallback(async () => {
    if (!user?.email) return;

    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("name, phone")
        .eq("email", user.email)
        .maybeSingle();

      if (customer) {
        setBasicProfile(prev => prev ? {
          ...prev,
          name: customer.name || prev.name,
          phone: customer.phone || prev.phone
        } : null);

        setProfileForm(prev => ({
          ...prev,
          fullName: customer.name || prev.fullName,
          phone: customer.phone || ""
        }));
      }

      // Load localStorage data
      loadLocalStorageData();

    } catch (error) {
      console.error("Error loading customer data:", error);
    }
  }, [user]);

  // Load localStorage data and user labels
  const loadLocalStorageData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const savedShipping = localStorage.getItem(`shipping_${user.id}`);
      if (savedShipping) {
        setSavedShippingDetails(JSON.parse(savedShipping));
      }

      // Load user labels from Supabase instead of localStorage
      await loadUserLabels();
    } catch (e) {
      console.log("Error loading localStorage data:", e);
    }
  }, [user]);

  // Load user labels from Supabase
  const loadUserLabels = useCallback(async () => {
    if (!user?.id) return;

    setLoadingLabels(true);
    try {
      const [labels, defaultLabelData] = await Promise.all([
        userLabelsService.getUserLabels(user.id),
        userLabelsService.getDefaultLabel(user.id)
      ]);

      setUserLabels(labels);
      setDefaultLabel(defaultLabelData);

      // If no labels exist, create a default one
      if (labels.length === 0) {
        const newDefaultLabel = await userLabelsService.createDefaultMyFuzeLabel(user.id);
        if (newDefaultLabel) {
          setUserLabels([newDefaultLabel]);
          setDefaultLabel(newDefaultLabel);
        }
      }
    } catch (error) {
      console.error('Error loading user labels:', error);
    } finally {
      setLoadingLabels(false);
    }
  }, [user]);

  // Lazy load activity data
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

  // Lazy load purchases data
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
          order_items!inner (
            quantity,
            unit_price,
            products (name, size, type)
          ),
          invoices (id, invoice_number)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5); // Limit to 5 most recent

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
          invoice_id: order.invoices?.[0]?.id
        }));

        setPurchases(processedPurchases);
      }

    } catch (error) {
      console.error("Error loading purchases:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, purchases: false }));
    }
  }, [user, purchases.length, loadingStates.purchases]);

  // Lazy load recent items
  const loadRecentItems = useCallback(async () => {
    if (!user || recentItems.length > 0 || loadingStates.recents) return;

    try {
      setLoadingStates(prev => ({ ...prev, recents: true }));

      // Generate recent items from purchases if available
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
      } else {
        // Load purchases first if not already loaded
        await loadPurchasesData();
      }

    } catch (error) {
      console.error("Error loading recent items:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, recents: false }));
    }
  }, [user, recentItems.length, loadingStates.recents, purchases, loadPurchasesData]);

  // Handle tab changes with lazy loading
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // Delay loading to improve tab switch performance
    setTimeout(() => {
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
    }, 50);
  }, [loadActivityData, loadPurchasesData, loadRecentItems]);

  // Optimistic profile update
  const updateProfile = useCallback(async () => {
    if (saving) return;

    try {
      setSaving(true);

      // Optimistic update
      const newProfile = {
        ...basicProfile!,
        name: profileForm.fullName,
        phone: profileForm.phone
      };
      setBasicProfile(newProfile);

      toast.success("Profile updated!");

      // Background update
      const [authUpdate, customerUpdate] = await Promise.allSettled([
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

      // Check for errors
      if (authUpdate.status === 'rejected' || 
          (customerUpdate.status === 'fulfilled' && customerUpdate.value.error)) {
        throw new Error("Failed to update profile");
      }

    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Revert optimistic update on error
      setBasicProfile(prev => prev ? {
        ...prev,
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User",
        phone: ""
      } : null);

      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [basicProfile, profileForm, user, saving]);

  // Memoized utility functions
  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const formatDateTime = useCallback((timestamp: string) => {
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
  }, []);

  // Event handlers
  const downloadInvoice = useCallback(async (invoiceId: string) => {
    toast.success("Invoice download feature will be implemented soon");
  }, []);

  const reorderItems = useCallback(async (purchase: Purchase) => {
    toast.success(`${purchase.items.length} items re-added to cart`);
    navigate("/products");
  }, [navigate]);

  // Label management functions
  const handleSetDefaultLabel = useCallback(async (labelId: string) => {
    if (!user?.id) return;

    const success = await userLabelsService.setDefaultLabel(labelId, user.id);
    if (success) {
      await loadUserLabels(); // Refresh labels
    }
  }, [user, loadUserLabels]);

  const handleDeleteLabel = useCallback(async (labelId: string) => {
    const success = await userLabelsService.deleteLabel(labelId);
    if (success) {
      await loadUserLabels(); // Refresh labels
    }
  }, [loadUserLabels]);

  const viewItemDetails = useCallback((item: RecentItem) => {
    if (item.type === 'order') {
      navigate("/orders");
    } else if (item.type === 'product') {
      navigate("/products");
    }
    toast.success(`Viewing details for ${item.name}`);
  }, [navigate]);

  // Show loading only for auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading..." size="lg" />
      </div>
    );
  }

  // If no user, don't render anything
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Profile Header - Shows immediately */}
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="labels" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Labels
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="recents" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Delivery
              </TabsTrigger>
            </TabsList>

            {/* Labels Tab - New dedicated tab */}
            <TabsContent value="labels" className="space-y-6">
              {/* Saved Labels Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>My Saved Labels</CardTitle>
                      <CardDescription>
                        Manage your custom bottle label designs for enterprise orders
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/enterprise')}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingLabels ? (
                    <div className="h-32 flex items-center justify-center">
                      <LoadingSpinner message="Loading labels..." />
                    </div>
                  ) : userLabels.length > 0 ? (
                    <div className="space-y-4">
                      {userLabels.map((label) => (
                        <div key={label.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{label.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {label.description || 'No description'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {label.is_default ? (
                                <Badge variant="default" className="bg-primary/10 text-primary">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefaultLabel(label.id)}
                                >
                                  <Settings className="w-4 h-4 mr-1" />
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLabel(label.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Elements:</span>
                              <span>{label.design_data.elements?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Background:</span>
                              <div className="w-4 h-4 rounded border" style={{ backgroundColor: label.design_data.backgroundColor || '#ffffff' }}></div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Size:</span>
                              <span>{label.dimensions?.width || 264}×{label.dimensions?.height || 60}mm</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Updated:</span>
                              <span>{new Date(label.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Custom Labels Yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Create custom labels for your enterprise orders. These will be available
                        when requesting quotes and can be set as your default branding.
                      </p>
                      <Button onClick={() => navigate('/enterprise')} size="lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Label
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Label Designer */}
              <Card>
                <CardHeader>
                  <CardTitle>Label Designer</CardTitle>
                  <CardDescription>
                    Create new custom labels directly from your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>}>
                    <LabelEditor onSave={loadUserLabels} />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab - Default and fastest */}
            <TabsContent value="settings" className="space-y-6">
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
                      <Label htmlFor="phone">Phone Number</Label>
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

              {/* Saved Labels Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>My Saved Labels</CardTitle>
                      <CardDescription>
                        Manage your custom bottle label designs
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/enterprise')}
                      className="shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingLabels ? (
                    <div className="h-32 flex items-center justify-center">
                      <LoadingSpinner message="Loading labels..." />
                    </div>
                  ) : userLabels.length > 0 ? (
                    <div className="space-y-4">
                      {userLabels.map((label) => (
                        <div key={label.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{label.name}</h3>
                              {label.is_default && (
                                <Badge variant="default" className="bg-primary/10 text-primary">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!label.is_default && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefaultLabel(label.id)}
                                >
                                  <Settings className="w-4 h-4 mr-1" />
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLabel(label.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {label.description && (
                            <p className="text-sm text-muted-foreground mb-2">{label.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{label.design_data.elements?.length || 0} design elements</span>
                            <span>Background: {label.design_data.backgroundColor || '#ffffff'}</span>
                            <span>Updated: {new Date(label.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No custom labels created yet</p>
                      <Button onClick={() => navigate('/enterprise')}>Create Your First Label</Button>
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
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>
                        View your order history
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/orders")}
                      className="shrink-0"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingStates.purchases ? (
                    <PurchasesSkeleton />
                  ) : purchases.length > 0 ? (
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div key={purchase.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-medium">{purchase.order_number}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">R{purchase.total_amount.toFixed(2)}</p>
                              <Badge className={getStatusColor(purchase.status)}>
                                {purchase.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm text-muted-foreground">
                              {purchase.items.length} item(s)
                            </span>
                            <div className="flex gap-2">
                              {purchase.invoice_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadInvoice(purchase.invoice_id!)}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Invoice
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => reorderItems(purchase)}
                              >
                                <ShoppingBag className="w-4 h-4 mr-1" />
                                Reorder
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders found</p>
                      <Button className="mt-4" onClick={() => navigate("/products")}>
                        Start Shopping
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recent Items Tab */}
            <TabsContent value="recents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent orders and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStates.recents ? (
                    <RecentItemsSkeleton />
                  ) : recentItems.length > 0 ? (
                    <div className="space-y-3">
                      {recentItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground">
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
                      <p className="text-muted-foreground">No recent activity</p>
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
                  <CardTitle>Account Activity</CardTitle>
                  <CardDescription>
                    Your account timeline and activities
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
                            <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200"></div>
                          )}
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getStatusColor(item.status || 'pending')}`}>
                              <Activity className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm">{item.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
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

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your delivery addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {savedShippingDetails.length > 0 ? (
                    <div className="space-y-3">
                      {savedShippingDetails.map((details, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{details.name || "Address"}</h4>
                            <Badge variant="outline">
                              <Truck className="w-3 h-3 mr-1" />
                              Saved
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <p>{details.address}</p>
                            <p>{details.city}, {details.province}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No saved addresses</p>
                      <Button onClick={() => navigate("/products")}>
                        Shop to Add Addresses
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
