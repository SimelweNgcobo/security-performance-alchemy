import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff, Shield, ArrowLeft, Droplets } from "lucide-react";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    // Check if user is already logged in and is admin
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user is admin
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (adminUser) {
          navigate("/panel-1973");
          return;
        }
      }
    } catch (error) {
      // User not logged in or not admin, stay on auth page
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: adminUser, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("is_active", true)
          .single();

        if (adminError || !adminUser) {
          await supabase.auth.signOut();
          console.error("Admin access check failed:", adminError);
          toast.error("Access denied. This account does not have admin privileges. Please contact support if you believe this is an error.");
          return;
        }

        toast.success("Welcome to the admin panel!");
        navigate("/panel-1973");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      <div className="w-full max-w-md">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">MyFuze</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
              <Shield className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Panel Access</CardTitle>
            <CardDescription className="text-sm">
              Sign in with your admin credentials
            </CardDescription>
            <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                🔒 Restricted Access: Panel-1973
              </p>
            </div>
            <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">Test Admin Credentials:</p>
              <p className="text-xs text-blue-700">Email: mq.ngcobo@myfuze.co.za</p>
              <p className="text-xs text-blue-700">Password: MQ1973</p>
            </div>
            <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-800 font-medium mb-2">🔒 Secure Access Required</p>
              <p className="text-xs text-green-700">
                Admin access requires valid credentials for security. Use the test credentials above or contact system administrator.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Access Admin Panel"}
                  </Button>
                </form>
            </div>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">Secure admin access only</p>
                <Link to="/auth" className="text-primary hover:underline">
                  Regular User Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
