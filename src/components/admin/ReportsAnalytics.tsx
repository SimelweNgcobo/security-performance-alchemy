import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarChart3, TrendingUp, Package, Users, DollarSign, Calendar } from "lucide-react";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductStats {
  id: string;
  name: string;
  type: string;
  totalSold: number;
  revenue: number;
}

export function ReportsAnalytics() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalRefunds: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // Load orders for the time range
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            total_price,
            products (name, type)
          )
        `)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", now.toISOString())
        .eq("payment_status", "paid");

      if (ordersError) throw ordersError;

      // Process sales data by date
      const salesByDate: { [key: string]: SalesData } = {};
      let totalRevenue = 0;
      let totalOrders = orders?.length || 0;

      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const revenue = parseFloat(order.total_amount.toString());
        totalRevenue += revenue;

        if (!salesByDate[date]) {
          salesByDate[date] = { date, revenue: 0, orders: 0 };
        }
        salesByDate[date].revenue += revenue;
        salesByDate[date].orders += 1;
      });

      setSalesData(Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date)));

      // Process product statistics
      const productStatsMap: { [key: string]: ProductStats } = {};

      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const key = item.products?.name || 'Unknown';
          if (!productStatsMap[key]) {
            productStatsMap[key] = {
              id: key,
              name: item.products?.name || 'Unknown',
              type: item.products?.type || 'standard',
              totalSold: 0,
              revenue: 0
            };
          }
          productStatsMap[key].totalSold += item.quantity;
          productStatsMap[key].revenue += parseFloat(item.total_price.toString());
        });
      });

      setProductStats(Object.values(productStatsMap).sort((a, b) => b.revenue - a.revenue));

      // Load refunds
      const { data: refunds } = await supabase
        .from("refunds")
        .select("amount")
        .eq("status", "processed")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", now.toISOString());

      const totalRefunds = refunds?.reduce((sum, refund) => sum + parseFloat(refund.amount.toString()), 0) || 0;

      setTotals({
        totalRevenue,
        totalOrders,
        totalRefunds,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      });

    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = {
      period: timeRange,
      dateRange: {
        start: salesData[0]?.date || "",
        end: salesData[salesData.length - 1]?.date || ""
      },
      summary: totals,
      salesData,
      productStats
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report exported successfully");
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            Sales performance, popular products, and revenue insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>Export Report</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totals.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "week" ? "Last 7 days" : timeRange === "month" ? "Last 30 days" : "Last 90 days"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Paid orders only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totals.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per order value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totals.totalRefunds.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Processed refunds
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sales Trend
            </CardTitle>
            <CardDescription>Daily sales and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">{day.orders} orders</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R{day.revenue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      Avg: R{(day.revenue / day.orders).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              {salesData.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No sales data available for the selected period.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Popular Products
            </CardTitle>
            <CardDescription>Best-selling products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productStats.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={product.type === "custom" ? "secondary" : "outline"} className="text-xs">
                          {product.type === "custom" ? "Custom" : "Standard"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {product.totalSold} sold
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R{product.revenue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      R{product.totalSold > 0 ? (product.revenue / product.totalSold).toFixed(2) : "0.00"} avg
                    </div>
                  </div>
                </div>
              ))}
              {productStats.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No product sales data available for the selected period.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
