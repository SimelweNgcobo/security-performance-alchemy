import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  Tag, 
  User, 
  Calendar, 
  Eye, 
  Trash2, 
  Search,
  Star,
  Palette,
  Settings
} from "lucide-react";

interface UserLabel {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  design_data: any;
  is_default: boolean;
  dimensions: any;
  created_at: string;
  updated_at: string;
  users?: {
    email?: string;
  };
}

export const UserLabelsManagement = () => {
  const [labels, setLabels] = useState<UserLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState<UserLabel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUserLabels();
  }, []);

  const loadUserLabels = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("user_labels")
        .select(`
          *
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setLabels(data?.map(label => ({
        ...label,
        design_data: label.design_data || {},
        dimensions: typeof label.dimensions === 'object' ? label.dimensions as { width: number; height: number } : { width: 264, height: 60 },
        users: { email: '' }
      })) || []);
    } catch (error) {
      console.error("Error loading user labels:", error);
      toast.error("Failed to load user labels");
    } finally {
      setLoading(false);
    }
  };

  const deleteLabel = async (labelId: string) => {
    if (!confirm("Are you sure you want to delete this label? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_labels")
        .delete()
        .eq("id", labelId);

      if (error) {
        throw error;
      }

      setLabels(prev => prev.filter(label => label.id !== labelId));
      toast.success("Label deleted successfully");
      setSelectedLabel(null);
    } catch (error) {
      console.error("Error deleting label:", error);
      toast.error("Failed to delete label");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredLabels = labels.filter(label => 
    label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    label.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    label.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner message="Loading user labels..." size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            User Labels Management
          </CardTitle>
          <CardDescription>
            View and manage custom labels created by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search labels by name, description, or user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Labels</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{labels.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Default Labels</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {labels.filter(l => l.is_default).length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Unique Users</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(labels.map(l => l.user_id)).size}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Avg Elements</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {labels.length > 0 ? Math.round(
                  labels.reduce((sum, l) => sum + (l.design_data?.elements?.length || 0), 0) / labels.length
                ) : 0}
              </p>
            </div>
          </div>

          {filteredLabels.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Elements</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLabels.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{label.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {label.description || 'No description'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {label.user_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {label.is_default ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {label.design_data?.elements?.length || 0} elements
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {label.dimensions?.width || 264} × {label.dimensions?.height || 60}mm
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(label.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedLabel(label)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Tag className="w-5 h-5" />
                                  {selectedLabel?.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Label Design Details
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedLabel && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-medium mb-3">Label Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Name:</span>
                                          <span>{selectedLabel.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Description:</span>
                                          <span>{selectedLabel.description || 'None'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">User:</span>
                                          <span>{selectedLabel?.user_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Status:</span>
                                          <span>
                                            {selectedLabel.is_default ? (
                                              <Badge variant="default" className="bg-green-100 text-green-800">
                                                <Star className="w-3 h-3 mr-1" />
                                                Default
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline">Regular</Badge>
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Dimensions:</span>
                                          <span>
                                            {selectedLabel.dimensions?.width || 264} × {selectedLabel.dimensions?.height || 60}mm
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Created:</span>
                                          <span>{formatDate(selectedLabel.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Updated:</span>
                                          <span>{formatDate(selectedLabel.updated_at)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-3">Design Elements</h4>
                                      <div className="space-y-2">
                                        {selectedLabel.design_data?.elements?.map((element: any, index: number) => (
                                          <div key={index} className="p-2 bg-gray-50 rounded border">
                                            <div className="flex justify-between items-center">
                                              <span className="text-xs font-medium">
                                                {element.type === 'text' ? 'Text' : element.type === 'image' ? 'Image' : 'Element'} {index + 1}
                                              </span>
                                              <Badge variant="outline" className="text-xs">
                                                {element.type}
                                              </Badge>
                                            </div>
                                            {element.content && (
                                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                                "{element.content}"
                                              </p>
                                            )}
                                            <div className="text-xs text-muted-foreground mt-1">
                                              Position: {Math.round(element.x || 0)}, {Math.round(element.y || 0)}
                                              {element.fontSize && ` • Size: ${element.fontSize}px`}
                                              {element.color && ` • Color: ${element.color}`}
                                            </div>
                                          </div>
                                        )) || (
                                          <p className="text-sm text-muted-foreground">No elements found</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {selectedLabel.design_data?.backgroundColor && (
                                    <div>
                                      <h4 className="font-medium mb-2">Background</h4>
                                      <div className="flex items-center gap-3">
                                        <div 
                                          className="w-8 h-8 rounded border-2 border-gray-300"
                                          style={{ backgroundColor: selectedLabel.design_data.backgroundColor }}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                          {selectedLabel.design_data.backgroundColor}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => deleteLabel(selectedLabel.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Label
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteLabel(label.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No labels found matching your search' : 'No user labels found'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                User-created labels will appear here when customers use the label designer
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLabelsManagement;
