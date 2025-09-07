import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { userLabelsService, UserLabel } from "@/services/userLabels";
import { encryptedAddressService } from "@/services/encryptedAddressService";
import { AddressData, EncryptedAddress } from "@/utils/encryption";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Plus,
  Palette,
  RotateCcw
} from "lucide-react";

import CustomLabelUpload from "@/components/CustomLabelUpload";

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

  // Encrypted address state
  const [encryptedAddresses, setEncryptedAddresses] = useState<EncryptedAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<EncryptedAddress | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<EncryptedAddress | null>(null);
  const [addressForm, setAddressForm] = useState<AddressData>({
    fullName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    phone: ""
  });

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

      // Load encrypted addresses
      await loadEncryptedAddresses();
    } catch (e) {
      console.log("Error loading localStorage data:", e);
    }
  }, [user, loadUserLabels]);

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

      console.log("Loading orders for user:", user.id, user.email);

      // First, try to get orders directly by user_id
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      console.log("Orders query result:", { orders, ordersError });

      if (ordersError) {
        console.error("Error loading orders:", ordersError);
        toast.error("Failed to load orders. Please ensure the database is properly set up.");
        setPurchases([]);
        return;
      }

      if (orders && orders.length > 0) {
        // Process real orders from database
        const processedPurchases: Purchase[] = orders.map(order => {
          let items: any[] = [];

          // Try to parse metadata for items
          if (order.metadata) {
            try {
              const metadata = typeof order.metadata === 'string'
                ? JSON.parse(order.metadata)
                : order.metadata;

              if (metadata.cart_items) {
                items = metadata.cart_items.map((item: any) => ({
                  quantity: item.quantity || 1,
                  unit_price: item.unitPrice || item.price || 0,
                  products: {
                    name: `${item.size} Water Bottle`,
                    size: item.size || "500ml",
                    type: "bottle"
                  }
                }));
              }
            } catch (e) {
              console.error("Error parsing order metadata:", e);
            }
          }

          // If no items found in metadata, create default item
          if (items.length === 0) {
            items = [{
              quantity: 1,
              unit_price: order.total_amount || 0,
              products: {
                name: "Water Bottles",
                size: "Mixed",
                type: "bottle"
              }
            }];
          }

          return {
            id: order.id,
            order_number: order.order_number || `BLK${order.id.slice(-6)}`,
            total_amount: parseFloat(order.total_amount?.toString() || '0'),
            status: order.status || 'pending',
            payment_status: order.payment_status || 'pending',
            delivery_status: order.delivery_status || 'processing',
            created_at: order.created_at,
            items
          };
        });

        setPurchases(processedPurchases);
        console.log("Loaded", processedPurchases.length, "orders for user");

        if (processedPurchases.length > 0) {
          toast.success(`Found ${processedPurchases.length} orders`);
        }
      } else {
        // No orders found - show empty state
        console.log("No orders found for user");
        setPurchases([]);
      }

    } catch (error) {
      console.error("Error loading purchases:", error);
      toast.error("Error loading orders. Please try again.");
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
        const orderRecents: RecentItem[] = purchases.slice(0, 5).map(order => ({
          id: `order-${order.id}`,
          type: 'order' as const,
          name: order.order_number,
          description: `${order.items.length} item(s) - R${order.total_amount.toFixed(2)}`,
          timestamp: order.created_at,
          status: order.status
        }));

        // Add account activity items
        const activityRecents: RecentItem[] = [
          {
            id: 'profile-view',
            type: 'product' as const,
            name: 'Profile Viewed',
            description: 'Checked account settings and order history',
            timestamp: new Date().toISOString(),
            status: 'completed'
          },
          {
            id: 'bulk-access',
            type: 'product' as const,
            name: 'Bulk Purchase Access',
            description: 'Accessed bulk ordering system',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          }
        ];

        // Combine and sort by timestamp
        const allRecents = [...orderRecents, ...activityRecents]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setRecentItems(allRecents);
      } else {
        // If no purchases, show default activity items
        const defaultRecents: RecentItem[] = [
          {
            id: 'account-setup',
            type: 'product' as const,
            name: 'Account Created',
            description: 'MyFuze account successfully created',
            timestamp: user.created_at || new Date().toISOString(),
            status: 'completed'
          },
          {
            id: 'welcome',
            type: 'product' as const,
            name: 'Welcome to MyFuze',
            description: 'Ready to start ordering premium water',
            timestamp: new Date().toISOString(),
            status: 'completed'
          }
        ];

        setRecentItems(defaultRecents);
      }

    } catch (error) {
      console.error("Error loading recent items:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, recents: false }));
    }
  }, [user, recentItems.length, loadingStates.recents, purchases]);

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
        case "labels":
          if (userLabels.length === 0 && !loadingLabels) {
            loadUserLabels();
          }
          break;
      }
    }, 50);
  }, [loadActivityData, loadPurchasesData, loadUserLabels, userLabels.length, loadingLabels]);

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
    try {
      // Navigate directly to bulk checkout with reorder data
      // This will skip the normal checkout steps and go to final checkout
      navigate('/bulk-checkout', {
        state: {
          isReorder: true,
          reorderData: {
            orderId: purchase.id,
            orderNumber: purchase.order_number,
            items: purchase.items,
            totalAmount: purchase.total_amount,
            originalDate: purchase.created_at
          }
        }
      });
      toast.success(`Reordering ${purchase.items.length} items - proceeding to checkout`);
    } catch (error) {
      console.error('Error processing reorder:', error);
      toast.error('Failed to process reorder. Please try again.');
    }
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

  // Load encrypted addresses
  const loadEncryptedAddresses = useCallback(async () => {
    if (!user?.id) return;

    setLoadingAddresses(true);
    try {
      const [addresses, defaultAddr] = await Promise.all([
        encryptedAddressService.getUserAddresses(user.id),
        encryptedAddressService.getDefaultAddress(user.id)
      ]);

      setEncryptedAddresses(addresses);
      setDefaultAddress(defaultAddr);
    } catch (error) {
      console.error('Error loading encrypted addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user]);

  // Initialize address form
  const initializeAddressForm = useCallback((address?: EncryptedAddress) => {
    if (address) {
      // If editing, decrypt and populate form
      encryptedAddressService.getDecryptedAddress(address.id!, user!.id).then(decrypted => {
        if (decrypted) {
          setAddressForm(decrypted);
        }
      });
    } else {
      // New address form
      setAddressForm({
        fullName: basicProfile?.name || "",
        company: "",
        address1: "",
        address2: "",
        city: "",
        province: "",
        postalCode: "",
        phone: basicProfile?.phone || ""
      });
    }
  }, [user, basicProfile]);

  // Handle address form changes
  const handleAddressChange = useCallback((field: keyof AddressData, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Save address
  const saveAddress = useCallback(async () => {
    if (!user?.id) return;

    if (editingAddress) {
      // Update existing address
      const updated = await encryptedAddressService.updateAddress(
        editingAddress.id!,
        user.id,
        addressForm
      );
      if (updated) {
        setShowAddressForm(false);
        setEditingAddress(null);
        await loadEncryptedAddresses();
      }
    } else {
      // Create new address
      const created = await encryptedAddressService.saveAddress(
        user.id,
        addressForm,
        encryptedAddresses.length === 0 // Set as default if it's the first address
      );
      if (created) {
        setShowAddressForm(false);
        await loadEncryptedAddresses();
      }
    }
  }, [user, editingAddress, addressForm, encryptedAddresses.length, loadEncryptedAddresses]);

  // Set default address
  const handleSetDefaultAddress = useCallback(async (addressId: string) => {
    if (!user?.id) return;

    const success = await encryptedAddressService.setDefaultAddress(addressId, user.id);
    if (success) {
      await loadEncryptedAddresses();
    }
  }, [user, loadEncryptedAddresses]);

  // Delete address
  const handleDeleteAddress = useCallback(async (addressId: string) => {
    if (!user?.id) return;

    const success = await encryptedAddressService.deleteAddress(addressId, user.id);
    if (success) {
      await loadEncryptedAddresses();
    }
  }, [user, loadEncryptedAddresses]);

  // Edit address
  const handleEditAddress = useCallback((address: EncryptedAddress) => {
    setEditingAddress(address);
    initializeAddressForm(address);
    setShowAddressForm(true);
  }, [initializeAddressForm]);

  // Start new address
  const handleNewAddress = useCallback(() => {
    setEditingAddress(null);
    initializeAddressForm();
    setShowAddressForm(true);
  }, [initializeAddressForm]);

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
            <TabsList className="grid w-full grid-cols-5">
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
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Saved Labels</h3>
                      <p className="text-sm text-muted-foreground">{userLabels.length} designs</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Default Label</h3>
                      <p className="text-sm text-muted-foreground">
                        {defaultLabel ? defaultLabel.name : 'None set'}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Designer</h3>
                      <p className="text-sm text-muted-foreground">Create new labels</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Saved Labels Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Saved Labels</CardTitle>
                      <CardDescription>
                        Manage your custom bottle label designs for enterprise orders
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadUserLabels()}
                      disabled={loadingLabels}
                    >
                      <RotateCcw className={`w-4 h-4 mr-2 ${loadingLabels ? 'animate-spin' : ''}`} />
                      Refresh
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
                        <div key={label.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{label.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {label.description || 'No description provided'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {label.is_default ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefaultLabel(label.id)}
                                  title="Set as default label"
                                >
                                  <Star className="w-4 h-4 mr-1" />
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLabel(label.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete this label"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Elements:</span>
                              <span>{label.design_data?.elements?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Background:</span>
                              <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: label.design_data?.backgroundColor || '#ffffff' }}
                                title={`Background color: ${label.design_data?.backgroundColor || '#ffffff'}`}
                              ></div>
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
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create custom labels using the designer below. These will be available
                        for your enterprise orders and can be set as your default branding.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Scroll to the label designer section
                          const designerSection = document.querySelector('[data-label-upload]');
                          if (designerSection) {
                            designerSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Label
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Label Designer */}
              <Card data-label-upload>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Custom Label Service
                  </CardTitle>
                  <CardDescription>
                    Upload your logo or design and we’ll create the label for you. See the guidelines below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomLabelUpload />
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
                  <div>
                    <CardTitle>My Saved Labels</CardTitle>
                    <CardDescription>
                      Manage your custom bottle label designs. Use the Labels tab to create new designs.
                    </CardDescription>
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
                      <p className="text-sm text-muted-foreground">Switch to the Labels tab to create your first custom label design.</p>
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
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Delivery Addresses</CardTitle>
                      <CardDescription>
                        Manage your encrypted delivery addresses securely
                      </CardDescription>
                    </div>
                    <Button onClick={handleNewAddress}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingAddresses ? (
                    <div className="h-32 flex items-center justify-center">
                      <LoadingSpinner message="Loading addresses..." />
                    </div>
                  ) : encryptedAddresses.length > 0 ? (
                    <div className="space-y-4">
                      {encryptedAddresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Truck className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {encryptedAddressService.getAddressPreview(address)}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Added {new Date(address.created_at!).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {address.is_default ? (
                                <Badge variant="default" className="bg-primary/10 text-primary">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefaultAddress(address.id!)}
                                >
                                  <Settings className="w-4 h-4 mr-1" />
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAddress(address)}
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id!)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <p>🔒 Address data is encrypted and secure</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Delivery Addresses</h3>
                      <p className="text-muted-foreground mb-6">
                        Add your delivery addresses to make checkout faster. All addresses are encrypted for security.
                      </p>
                      <Button onClick={handleNewAddress} size="lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Form Dialog */}
              <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </DialogTitle>
                    <DialogDescription>
                      Your address information will be encrypted before saving.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={addressForm.fullName}
                          onChange={(e) => handleAddressChange('fullName', e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={addressForm.company}
                          onChange={(e) => handleAddressChange('company', e.target.value)}
                          placeholder="Company name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address1">Address Line 1 *</Label>
                      <Input
                        id="address1"
                        value={addressForm.address1}
                        onChange={(e) => handleAddressChange('address1', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address2">Address Line 2</Label>
                      <Input
                        id="address2"
                        value={addressForm.address2}
                        onChange={(e) => handleAddressChange('address2', e.target.value)}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={addressForm.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Province *</Label>
                        <Select value={addressForm.province} onValueChange={(value) => handleAddressChange('province', value)}>
                          <SelectTrigger>
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={addressForm.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          placeholder="Postal code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={addressForm.phone}
                          onChange={(e) => handleAddressChange('phone', e.target.value)}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveAddress}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingAddress ? 'Update' : 'Save'} Address
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
};

export default Profile;
