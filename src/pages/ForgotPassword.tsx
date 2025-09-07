import { useState } from "react";
import Navbar from "@/components/Navbar";
import Layout2Footer from "@/components/Layout2Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?tab=reset`,
      });
      if (error) throw error;
      toast.success("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 pt-20 pb-8 px-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
              <CardDescription>Enter your email to receive a reset link</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
                <div className="text-center text-sm">
                  <Link to="/auth" className="text-primary hover:text-primary/80">Back to Sign In</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Layout2Footer />
    </div>
  );
}
