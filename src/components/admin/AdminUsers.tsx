import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserCog, Plus, Edit, Trash2, Shield, Activity } from "lucide-react";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  permissions?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminActivity {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  created_at: string;
  admin_users: {
    role: string;
  };
}

export function AdminUsers() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminActivity, setAdminActivity] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    role: "manager",
    permissions: {}
  });

  useEffect(() => {
    loadAdminUsers();
    loadAdminActivity();
  }, []);

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error("Error loading admin users:", error);
      toast.error("Failed to load admin users");
    }
  };

  const loadAdminActivity = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_activity_log")
        .select(`
          *,
          admin_users (role)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setAdminActivity(data || []);
    } catch (error) {
      console.error("Error loading admin activity:", error);
      toast.error("Failed to load admin activity");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      role: "manager",
      permissions: {}
    });
    setEditingAdmin(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const adminData = {
        user_id: formData.userId,
        role: formData.role,
        permissions: formData.permissions,
        is_active: true
      };

      let error;
      
      if (editingAdmin) {
        ({ error } = await supabase
          .from("admin_users")
          .update(adminData)
          .eq("id", editingAdmin.id));
      } else {
        ({ error } = await supabase
          .from("admin_users")
          .insert([adminData]));
      }

      if (error) throw error;

      // Log the activity
      await supabase
        .from("admin_activity_log")
        .insert([{
          admin_user_id: editingAdmin?.id || null,
          action: editingAdmin ? "updated_admin_user" : "created_admin_user",
          entity_type: "admin_user",
          entity_id: editingAdmin?.id || null,
          details: { role: formData.role }
        }]);

      toast.success(`Admin user ${editingAdmin ? "updated" : "added"} successfully`);
      setShowAddDialog(false);
      resetForm();
      loadAdminUsers();
      loadAdminActivity();
    } catch (error) {
      console.error("Error saving admin user:", error);
      toast.error("Failed to save admin user");
    }
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      userId: admin.user_id,
      role: admin.role,
      permissions: admin.permissions || {}
    });
    setShowAddDialog(true);
  };

  const toggleActiveStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: !currentStatus })
        .eq("id", adminId);

      if (error) throw error;
      
      toast.success(`Admin user ${!currentStatus ? "activated" : "deactivated"} successfully`);
      loadAdminUsers();
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast.error("Failed to update admin status");
    }
  };

  const handleDelete = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin user?")) return;

    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", adminId);

      if (error) throw error;
      
      toast.success("Admin user deleted successfully");
      loadAdminUsers();
    } catch (error) {
      console.error("Error deleting admin user:", error);
      toast.error("Failed to delete admin user");
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      "super_admin": "default",
      "manager": "secondary",
      "designer": "outline",
      "delivery_handler": "outline"
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || "secondary"}>
        {role.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading admin users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Admin Users
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAdmin ? "Edit Admin User" : "Add New Admin User"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAdmin ? "Update admin user details" : "Add a new admin user with specific roles"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                          id="userId"
                          value={formData.userId}
                          onChange={(e) => setFormData({...formData, userId: e.target.value})}
                          placeholder="Enter user UUID"
                          required
                          disabled={!!editingAdmin}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Get this from the auth.users table in Supabase
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="delivery_handler">Delivery Handler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingAdmin ? "Update" : "Add"} Admin
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Manage admin accounts and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-mono text-sm">
                        {admin.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActiveStatus(admin.id, admin.is_active)}
                        >
                          <Badge variant={admin.is_active ? "default" : "secondary"}>
                            {admin.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(admin.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(admin.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest admin actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {adminActivity.map((activity) => (
                <div key={activity.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.action.replace(/_/g, " ").toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.entity_type} • {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.admin_users?.role || "Unknown"}
                    </Badge>
                  </div>
                </div>
              ))}
              {adminActivity.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No admin activity recorded yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}