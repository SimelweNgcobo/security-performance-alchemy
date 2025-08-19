import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  Building2, 
  Mail, 
  Calendar, 
  Eye, 
  FileText, 
  CheckCircle, 
  Clock, 
  X,
  Send,
  User,
  Image as ImageIcon
} from "lucide-react";

interface EnterpriseRequest {
  id: string;
  company_name: string;
  contact_email: string;
  requirements: string | null;
  status: string;
  user_id: string | null;
  designs: any | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  quote_amount: number | null;
  quote_valid_until: string | null;
}

export const EnterpriseRequests = () => {
  const [requests, setRequests] = useState<EnterpriseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EnterpriseRequest | null>(null);
  const [responseNotes, setResponseNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

  // Mock data since we don't have the table yet
  const mockRequests: EnterpriseRequest[] = [
    {
      id: "1",
      company_name: "TechCorp SA",
      contact_email: "events@techcorp.co.za",
      requirements: "We need 500 bottles for our annual conference with our logo. Need delivery by March 15th.",
      status: "pending",
      user_id: "user-123",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: ""
    },
    {
      id: "2", 
      company_name: "Green Earth Marketing",
      contact_email: "sarah@greenearth.co.za",
      requirements: "1000 eco-friendly bottles for our sustainability campaign. Custom green label design needed.",
      status: "reviewing",
      user_id: "user-456",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      label_design_url: "https://example.com/design.png",
      notes: "Customer interested in recyclable materials"
    },
    {
      id: "3",
      company_name: "Sports World",
      contact_email: "orders@sportsworld.co.za", 
      requirements: "2000 bottles for marathon event. Need logo on both sides, urgent delivery needed.",
      status: "quoted",
      user_id: "user-789",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Quote sent R45,000 including rush delivery"
    }
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("enterprise_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data || []);
    } catch (error) {
      console.error("Error loading enterprise requests:", error);
      toast.error("Failed to load enterprise requests");

      // Fallback to mock data in case of error
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from("enterprise_requests")
        .update({
          status,
          notes: notes || "",
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId);

      if (error) {
        throw error;
      }

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? { ...req, status, notes: notes || req.notes, updated_at: new Date().toISOString() }
          : req
      ));

      toast.success("Request status updated successfully");
      setSelectedRequest(null);
      setResponseNotes("");
      setNewStatus("");
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "quoted":
        return "bg-purple-100 text-purple-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "reviewing":
        return <Eye className="w-4 h-4" />;
      case "quoted":
        return <FileText className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner message="Loading enterprise requests..." size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Enterprise Requests
          </CardTitle>
          <CardDescription>
            Manage custom bottle orders and enterprise quotes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Design</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.company_name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {request.requirements || 'No requirements specified'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.contact_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(request.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.label_design_url ? (
                          <Button variant="outline" size="sm">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            View Design
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">No design</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setNewStatus(request.status);
                                setResponseNotes(request.notes || "");
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                {selectedRequest?.company_name}
                              </DialogTitle>
                              <DialogDescription>
                                Enterprise Request Details
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedRequest && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Contact Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        {selectedRequest.company_name}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        {selectedRequest.contact_email}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        {formatDate(selectedRequest.created_at)}
                                      </div>
                                      {selectedRequest.user_id && (
                                        <div className="flex items-center gap-2">
                                          <User className="w-4 h-4 text-muted-foreground" />
                                          User ID: {selectedRequest.user_id}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Current Status</h4>
                                    <Badge className={`${getStatusColor(selectedRequest.status)} flex items-center gap-1 w-fit`}>
                                      {getStatusIcon(selectedRequest.status)}
                                      <span className="capitalize">{selectedRequest.status}</span>
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Requirements</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                    {selectedRequest.requirements}
                                  </div>
                                </div>

                                {selectedRequest.label_design_url && (
                                  <div>
                                    <h4 className="font-medium mb-2">Label Design</h4>
                                    <Button variant="outline">
                                      <ImageIcon className="w-4 h-4 mr-2" />
                                      View Uploaded Design
                                    </Button>
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-medium mb-2">Update Status</h4>
                                  <div className="space-y-3">
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="reviewing">Reviewing</SelectItem>
                                        <SelectItem value="quoted">Quoted</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    
                                    <Textarea
                                      placeholder="Add notes or response..."
                                      value={responseNotes}
                                      onChange={(e) => setResponseNotes(e.target.value)}
                                      rows={3}
                                    />
                                    
                                    <Button 
                                      onClick={() => updateRequestStatus(selectedRequest.id, newStatus, responseNotes)}
                                      className="w-full"
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Update Request
                                    </Button>
                                  </div>
                                </div>

                                {selectedRequest.notes && (
                                  <div>
                                    <h4 className="font-medium mb-2">Admin Notes</h4>
                                    <div className="bg-blue-50 p-3 rounded-lg text-sm border border-blue-200">
                                      {selectedRequest.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No enterprise requests found</p>
              <p className="text-sm text-muted-foreground mt-2">
                New requests will appear here when customers submit quotes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterpriseRequests;
