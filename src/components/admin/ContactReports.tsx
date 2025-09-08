import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  Mail, 
  MessageSquare, 
  Calendar, 
  Eye, 
  Trash2, 
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User
} from "lucide-react";

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  admin_notes: string | null;
}

export function ContactReports() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadContactSubmissions();
  }, []);

  const loadContactSubmissions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading contact submissions:", error);
      toast.error("Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = (await supabase.auth.getUser()).data.user?.id;
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from("contact_submissions")
        .update(updateData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Status updated successfully");
      loadContactSubmissions();
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Submission deleted successfully");
      setSelectedSubmission(null);
      loadContactSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete submission");
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

  const filteredSubmissions = submissions.filter(submission => 
    submission.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />New</Badge>;
      case 'in_progress':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner message="Loading contact submissions..." size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contact Form Submissions
          </CardTitle>
          <CardDescription>
            View and manage customer contact form submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search submissions by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">New</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {submissions.filter(s => s.status === 'new').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {submissions.filter(s => s.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Resolved</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {submissions.filter(s => s.status === 'resolved').length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{submissions.length}</p>
            </div>
          </div>

          {filteredSubmissions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {submission.first_name} {submission.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>
                        <span className="truncate max-w-xs block">
                          {submission.subject || 'No subject'}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(submission.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <MessageSquare className="w-5 h-5" />
                                  Contact Submission Details
                                </DialogTitle>
                                <DialogDescription>
                                  Manage customer inquiry and update status
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedSubmission && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-medium mb-3">Contact Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Name:</span>
                                          <span>{selectedSubmission.first_name} {selectedSubmission.last_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Email:</span>
                                          <span>{selectedSubmission.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Subject:</span>
                                          <span>{selectedSubmission.subject || 'No subject'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Status:</span>
                                          <span>{getStatusBadge(selectedSubmission.status)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Submitted:</span>
                                          <span>{formatDate(selectedSubmission.created_at)}</span>
                                        </div>
                                        {selectedSubmission.resolved_at && (
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Resolved:</span>
                                            <span>{formatDate(selectedSubmission.resolved_at)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-3">Message</h4>
                                      <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm whitespace-pre-wrap">
                                          {selectedSubmission.message}
                                        </p>
                                      </div>
                                      
                                      {selectedSubmission.admin_notes && (
                                        <div className="mt-3">
                                          <h5 className="font-medium text-sm mb-2">Admin Notes</h5>
                                          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                                            <p className="text-sm">{selectedSubmission.admin_notes}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Update Status</h4>
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'in_progress')}
                                        disabled={selectedSubmission.status === 'in_progress'}
                                      >
                                        Mark In Progress
                                      </Button>
                                      <Button 
                                        size="sm"
                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'resolved')}
                                        disabled={selectedSubmission.status === 'resolved'}
                                      >
                                        Mark Resolved
                                      </Button>
                                      <Button 
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteSubmission(selectedSubmission.id)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No submissions found matching your search' : 'No contact submissions found'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Customer inquiries will appear here when submitted through the contact form
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}