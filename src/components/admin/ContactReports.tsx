import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, Mail, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export function ContactReports() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const loadSubmissions = async () => {
    try {
      let query = supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading contact submissions:", error);
      toast.error("Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, status: string, notes?: string) => {
    setUpdating(true);
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.admin_notes = notes;
      }

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = (await supabase.auth.getUser()).data.user?.id;
      }

      const { error } = await supabase
        .from("contact_submissions")
        .update(updateData)
        .eq("id", submissionId);

      if (error) throw error;

      toast.success(`Contact submission marked as ${status}`);
      setSelectedSubmission(null);
      setAdminNotes("");
      loadSubmissions();
    } catch (error) {
      console.error("Error updating contact submission:", error);
      toast.error("Failed to update contact submission");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "destructive",
      in_progress: "secondary",
      resolved: "default",
      closed: "outline"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Mail className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getSubmissionCount = (status: string) => {
    if (status === "all") return submissions.length;
    return submissions.filter(s => s.status === status).length;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading contact submissions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">New</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'new').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'in_progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Resolved</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'resolved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Closed</p>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'closed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Form Submissions
              </CardTitle>
              <CardDescription>
                View and manage customer contact form submissions
              </CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(submission.status)}
                      {getStatusBadge(submission.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{submission.first_name} {submission.last_name}</div>
                      <div className="text-sm text-muted-foreground">{submission.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {submission.subject || "No subject"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setAdminNotes(submission.admin_notes || "");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Contact Submission Details</DialogTitle>
                          <DialogDescription>
                            View and manage this contact form submission
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSubmission && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="font-medium">Customer:</label>
                                <p>{selectedSubmission.first_name} {selectedSubmission.last_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedSubmission.email}</p>
                              </div>
                              <div>
                                <label className="font-medium">Date:</label>
                                <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                              </div>
                              <div>
                                <label className="font-medium">Subject:</label>
                                <p>{selectedSubmission.subject || "No subject"}</p>
                              </div>
                              <div>
                                <label className="font-medium">Status:</label>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusIcon(selectedSubmission.status)}
                                  {getStatusBadge(selectedSubmission.status)}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="font-medium">Message:</label>
                              <div className="mt-2 p-3 bg-muted rounded-lg">
                                <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                              </div>
                            </div>

                            <div>
                              <label className="font-medium">Admin Notes:</label>
                              <Textarea
                                placeholder="Add notes about this submission..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="mt-2"
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Select 
                                value={selectedSubmission.status} 
                                onValueChange={(value) => updateSubmissionStatus(selectedSubmission.id, value, adminNotes)}
                                disabled={updating}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button 
                                onClick={() => updateSubmissionStatus(selectedSubmission.id, selectedSubmission.status, adminNotes)}
                                disabled={updating}
                                variant="outline"
                              >
                                {updating ? "Updating..." : "Update Notes"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {submissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {filterStatus === "all" ? "No contact submissions yet" : `No ${filterStatus} submissions`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
