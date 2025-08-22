import { supabase } from "@/integrations/supabase/client";

export const debugAuth = {
  // Test Supabase connection
  async testConnection() {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log("🔍 Supabase Connection Test:");
      console.log("✅ Connected successfully");
      console.log("📊 Current session:", data.session?.user?.email || "No active session");
      return { success: true, session: data.session };
    } catch (error) {
      console.error("❌ Supabase connection failed:", error);
      return { success: false, error };
    }
  },

  // Create a test user (for development only)
  async createTestUser() {
    try {
      const testEmail = "test@myfuze.com";
      const testPassword = "test123456";
      
      console.log("🔧 Creating test user...");
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: "Test User",
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          console.log("ℹ️ Test user already exists");
          return { success: true, message: "Test user already exists", email: testEmail, password: testPassword };
        }
        throw error;
      }

      console.log("✅ Test user created successfully!");
      console.log("📧 Email:", testEmail);
      console.log("🔑 Password:", testPassword);
      
      return { 
        success: true, 
        user: data.user, 
        email: testEmail, 
        password: testPassword,
        message: "Test user created - check email for verification" 
      };
    } catch (error) {
      console.error("❌ Failed to create test user:", error);
      return { success: false, error };
    }
  },

  // List existing users (requires admin access)
  async listUsers() {
    try {
      // This requires admin access, will fail with current setup
      console.log("🔍 Attempting to list users (requires admin access)...");
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.log("ℹ️ Cannot list users (requires admin access)");
        return { success: false, message: "Admin access required" };
      }
      
      console.log("👥 Users found:", data.users?.length || 0);
      return { success: true, users: data.users };
    } catch (error) {
      console.log("ℹ️ Cannot list users (requires admin access)");
      return { success: false, message: "Admin access required" };
    }
  },

  // Test sign in with credentials
  async testSignIn(email: string, password: string) {
    try {
      console.log("🔐 Testing sign in for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign in failed:", error.message);
        return { success: false, error: error.message };
      }

      console.log("✅ Sign in successful!");
      console.log("👤 User:", data.user?.email);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error("❌ Sign in test failed:", error);
      return { success: false, error };
    }
  }
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (globalThis as any).debugAuth = debugAuth;
}
