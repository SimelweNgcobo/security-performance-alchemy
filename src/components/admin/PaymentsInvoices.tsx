import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CreditCard, FileText, DollarSign, Download, Plus } from "lucide-react";

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date?: string;
  created_at: string;
  orders: {
    order_number: string;
    customers: {
      name: string;
      email: string;
    };
  };
}

interface Refund {
  id: string;
  order_id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
  orders: {
    order_number: string;
    customers: {
      name: string;
    };
  };
}

export function PaymentsInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundForm, setRefundForm] = useState({
    orderId: "",
    amount: "",
    reason: ""
  });

  useEffect(() => {
    loadInvoices();
    loadRefunds();
  }, []);

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          orders (
            order_number,
            customers (name, email)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
    }
  };

  const loadRefunds = async () => {
    try {
      const { data, error } = await supabase
        .from("refunds")
        .select(`
          *,
          orders (
            order_number,
            customers (name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error("Error loading refunds:", error);
      toast.error("Failed to load refunds");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (orderId: string) => {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      const { error } = await supabase
        .from("invoices")
        .insert([{
          order_id: orderId,
          invoice_number: invoiceNumber,
          amount: order.total_amount,
          status: "draft",
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        }]);

      if (error) throw error;
      
      toast.success("Invoice generated successfully");
      loadInvoices();
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    }
  };

  const processRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("refunds")
        .insert([{
          order_id: refundForm.orderId,
          amount: parseFloat(refundForm.amount),
          reason: refundForm.reason,
          status: "pending"
        }]);

      if (error) throw error;
      
      toast.success("Refund initiated successfully");
      setShowRefundDialog(false);
      setRefundForm({ orderId: "", amount: "", reason: "" });
      loadRefunds();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    }
  };

  const updateRefundStatus = async (refundId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("refunds")
        .update({ 
          status,
          processed_at: status === "processed" ? new Date().toISOString() : null
        })
        .eq("id", refundId);

      if (error) throw error;
      
      toast.success(`Refund ${status} successfully`);
      loadRefunds();
    } catch (error) {
      console.error("Error updating refund:", error);
      toast.error("Failed to update refund status");
    }
  };

  const downloadInvoice = (invoice: Invoice) => {
    // This would typically generate a PDF. For now, we'll create a simple text representation
    const invoiceText = `
INVOICE: ${invoice.invoice_number}
Date: ${new Date(invoice.created_at).toLocaleDateString()}
Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}

Bill To:
${invoice.orders.customers.name}
${invoice.orders.customers.email}

Order: ${invoice.orders.order_number}
Amount: R${parseFloat(invoice.amount).toFixed(2)}
Status: ${invoice.status.toUpperCase()}
    `;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading payments and invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {refunds.filter(r => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + parseFloat(i.amount), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoices
            </CardTitle>
            <CardDescription>Track paid and unpaid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.orders.customers.name}</TableCell>
                    <TableCell>R{parseFloat(invoice.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          invoice.status === "paid" ? "default" : 
                          invoice.status === "overdue" ? "destructive" : "secondary"
                        }
                      >
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Refunds
              </div>
              <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Process Refund</DialogTitle>
                    <DialogDescription>
                      Initiate a refund for a customer order
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={processRefund} className="space-y-4">
                    <div>
                      <Label htmlFor="orderId">Order ID</Label>
                      <Input
                        id="orderId"
                        value={refundForm.orderId}
                        onChange={(e) => setRefundForm({...refundForm, orderId: e.target.value})}
                        placeholder="Enter order ID"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Refund Amount (R)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={refundForm.amount}
                        onChange={(e) => setRefundForm({...refundForm, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        value={refundForm.reason}
                        onChange={(e) => setRefundForm({...refundForm, reason: e.target.value})}
                        placeholder="Reason for refund..."
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowRefundDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Process Refund</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>Refund processing and tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell>{refund.orders.order_number}</TableCell>
                    <TableCell>R{parseFloat(refund.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          refund.status === "processed" ? "default" : 
                          refund.status === "rejected" ? "destructive" : "secondary"
                        }
                      >
                        {refund.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {refund.status === "pending" && (
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateRefundStatus(refund.id, "processed")}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => updateRefundStatus(refund.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}