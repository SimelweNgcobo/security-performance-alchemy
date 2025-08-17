import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Building, CreditCard, Palette, Upload } from "lucide-react";

interface CompanySetting {
  setting_key: string;
  setting_value: any;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("company_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      const settingsMap: {[key: string]: any} = {};
      data?.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("company_settings")
        .upsert([{
          setting_key: key,
          setting_value: value
        }], { onConflict: 'setting_key' });

      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success("Setting updated successfully");
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayUpdate = (key: string, value: string) => {
    try {
      const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
      updateSetting(key, arrayValue);
    } catch (error) {
      toast.error("Invalid format. Use comma-separated values.");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Admin Settings
        </h2>
        <p className="text-muted-foreground">
          Configure company details, payment methods, and system preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Update your company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={settings.company_name || ""}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                onBlur={(e) => updateSetting("company_name", e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
            
            <div>
              <Label htmlFor="company_address">Address</Label>
              <Textarea
                id="company_address"
                value={settings.company_address || ""}
                onChange={(e) => handleInputChange("company_address", e.target.value)}
                onBlur={(e) => updateSetting("company_address", e.target.value)}
                placeholder="Company address..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="company_phone">Phone Number</Label>
              <Input
                id="company_phone"
                value={settings.company_phone || ""}
                onChange={(e) => handleInputChange("company_phone", e.target.value)}
                onBlur={(e) => updateSetting("company_phone", e.target.value)}
                placeholder="+27123456789"
              />
            </div>
            
            <div>
              <Label htmlFor="company_email">Email Address</Label>
              <Input
                id="company_email"
                type="email"
                value={settings.company_email || ""}
                onChange={(e) => handleInputChange("company_email", e.target.value)}
                onBlur={(e) => updateSetting("company_email", e.target.value)}
                placeholder="info@company.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment & Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment & Delivery
            </CardTitle>
            <CardDescription>
              Configure payment methods and delivery options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="payment_methods">Payment Methods</Label>
              <Input
                id="payment_methods"
                value={Array.isArray(settings.payment_methods) ? settings.payment_methods.join(', ') : ""}
                onChange={(e) => handleInputChange("payment_methods", e.target.value)}
                onBlur={(e) => handleArrayUpdate("payment_methods", e.target.value)}
                placeholder="payfast, paypal, card, eft"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of payment methods
              </p>
            </div>
            
            <div>
              <Label htmlFor="default_delivery_fee">Default Delivery Fee (R)</Label>
              <Input
                id="default_delivery_fee"
                type="number"
                step="0.01"
                value={settings.default_delivery_fee || ""}
                onChange={(e) => handleInputChange("default_delivery_fee", e.target.value)}
                onBlur={(e) => updateSetting("default_delivery_fee", parseFloat(e.target.value) || 0)}
                placeholder="50.00"
              />
            </div>
            
            <div>
              <Label htmlFor="free_delivery_threshold">Free Delivery Threshold (R)</Label>
              <Input
                id="free_delivery_threshold"
                type="number"
                step="0.01"
                value={settings.free_delivery_threshold || ""}
                onChange={(e) => handleInputChange("free_delivery_threshold", e.target.value)}
                onBlur={(e) => updateSetting("free_delivery_threshold", parseFloat(e.target.value) || 0)}
                placeholder="500.00"
              />
            </div>
            
            <div>
              <Label htmlFor="delivery_areas">Delivery Areas</Label>
              <Input
                id="delivery_areas"
                value={Array.isArray(settings.delivery_areas) ? settings.delivery_areas.join(', ') : ""}
                onChange={(e) => handleInputChange("delivery_areas", e.target.value)}
                onBlur={(e) => handleArrayUpdate("delivery_areas", e.target.value)}
                placeholder="Cape Town, Johannesburg, Durban"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of delivery areas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding Options
            </CardTitle>
            <CardDescription>
              Configure custom branding templates and options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_logo_url">Company Logo URL</Label>
              <Input
                id="company_logo_url"
                value={settings.company_logo_url || ""}
                onChange={(e) => handleInputChange("company_logo_url", e.target.value)}
                onBlur={(e) => updateSetting("company_logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <Label htmlFor="brand_colors">Brand Colors</Label>
              <Input
                id="brand_colors"
                value={Array.isArray(settings.brand_colors) ? settings.brand_colors.join(', ') : ""}
                onChange={(e) => handleInputChange("brand_colors", e.target.value)}
                onBlur={(e) => handleArrayUpdate("brand_colors", e.target.value)}
                placeholder="#FF6B35, #004E7C, #FFD23F"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated hex color codes
              </p>
            </div>
            
            <div>
              <Label htmlFor="available_fonts">Available Fonts</Label>
              <Input
                id="available_fonts"
                value={Array.isArray(settings.available_fonts) ? settings.available_fonts.join(', ') : ""}
                onChange={(e) => handleInputChange("available_fonts", e.target.value)}
                onBlur={(e) => handleArrayUpdate("available_fonts", e.target.value)}
                placeholder="Arial, Helvetica, Times New Roman"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available fonts for custom branding
              </p>
            </div>

            <Separator />
            
            <div>
              <Label>Current Payment Methods</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(settings.payment_methods) && settings.payment_methods.map((method: string) => (
                  <Badge key={method} variant="secondary">{method}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Current Brand Colors</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(settings.brand_colors) && settings.brand_colors.map((color: string) => (
                  <div key={color} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border" 
                      style={{ backgroundColor: color }}
                    />
                    <Badge variant="outline">{color}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              General system configuration and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="order_number_prefix">Order Number Prefix</Label>
              <Input
                id="order_number_prefix"
                value={settings.order_number_prefix || "ORD"}
                onChange={(e) => handleInputChange("order_number_prefix", e.target.value)}
                onBlur={(e) => updateSetting("order_number_prefix", e.target.value)}
                placeholder="ORD"
              />
            </div>
            
            <div>
              <Label htmlFor="invoice_number_prefix">Invoice Number Prefix</Label>
              <Input
                id="invoice_number_prefix"
                value={settings.invoice_number_prefix || "INV"}
                onChange={(e) => handleInputChange("invoice_number_prefix", e.target.value)}
                onBlur={(e) => updateSetting("invoice_number_prefix", e.target.value)}
                placeholder="INV"
              />
            </div>
            
            <div>
              <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                value={settings.low_stock_threshold || "10"}
                onChange={(e) => handleInputChange("low_stock_threshold", e.target.value)}
                onBlur={(e) => updateSetting("low_stock_threshold", parseInt(e.target.value) || 10)}
                placeholder="10"
              />
            </div>
            
            <div>
              <Label htmlFor="auto_approve_orders">Auto-approve Standard Orders</Label>
              <select
                id="auto_approve_orders"
                className="w-full px-3 py-2 border rounded-md"
                value={settings.auto_approve_orders ? "true" : "false"}
                onChange={(e) => updateSetting("auto_approve_orders", e.target.value === "true")}
              >
                <option value="false">No - Manual approval required</option>
                <option value="true">Yes - Auto-approve standard orders</option>
              </select>
            </div>

            <Separator />
            
            <div className="space-y-2">
              <Button 
                onClick={loadSettings} 
                variant="outline" 
                disabled={saving}
                className="w-full"
              >
                Refresh Settings
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Settings are automatically saved when you finish editing each field
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}