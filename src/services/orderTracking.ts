import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderActivity {
  id: string;
  order_id: string;
  activity_type: 'order_created' | 'payment_confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface OrderTracking {
  order_id: string;
  customer_email: string;
  current_status: string;
  activities: OrderActivity[];
  estimated_delivery?: string;
}

// Simulated order tracking service
export class OrderTrackingService {
  private static instance: OrderTrackingService;
  private trackingData: Map<string, OrderTracking> = new Map();
  private scheduledUpdates: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): OrderTrackingService {
    if (!OrderTrackingService.instance) {
      OrderTrackingService.instance = new OrderTrackingService();
    }
    return OrderTrackingService.instance;
  }

  // Create initial tracking for a new order
  public async createOrderTracking(orderData: {
    order_id: string;
    customer_email: string;
    customer_id: string;
    total_amount: number;
    items: any[];
  }): Promise<void> {
    try {
      const tracking: OrderTracking = {
        order_id: orderData.order_id,
        customer_email: orderData.customer_email,
        current_status: 'order_created',
        activities: [
          {
            id: `activity-${Date.now()}`,
            order_id: orderData.order_id,
            activity_type: 'order_created',
            description: 'Order has been successfully created and is being processed',
            timestamp: new Date().toISOString(),
            metadata: {
              total_amount: orderData.total_amount,
              item_count: orderData.items.length
            }
          }
        ],
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      this.trackingData.set(orderData.order_id, tracking);
      
      // Send order confirmation email
      await this.sendOrderConfirmationEmail(orderData);
      
      // Schedule automatic status updates
      this.scheduleStatusUpdates(orderData.order_id);

      console.log(`Order tracking created for ${orderData.order_id}`);
    } catch (error) {
      console.error('Error creating order tracking:', error);
      throw error;
    }
  }

  // Add activity to order tracking
  public async addOrderActivity(
    orderId: string, 
    activityType: OrderActivity['activity_type'], 
    description: string,
    metadata?: any
  ): Promise<void> {
    const tracking = this.trackingData.get(orderId);
    if (!tracking) {
      console.error(`No tracking found for order ${orderId}`);
      return;
    }

    const activity: OrderActivity = {
      id: `activity-${Date.now()}`,
      order_id: orderId,
      activity_type: activityType,
      description,
      timestamp: new Date().toISOString(),
      metadata
    };

    tracking.activities.push(activity);
    tracking.current_status = activityType;
    
    // Update database (simulated)
    try {
      // TODO: Implement actual database update when order_tracking table exists
      console.log(`Order ${orderId} status updated to ${activityType}: ${description}`);
      
      // Send status update email
      await this.sendStatusUpdateEmail(tracking, activity);
    } catch (error) {
      console.error('Error adding order activity:', error);
    }
  }

  // Get tracking data for an order
  public getOrderTracking(orderId: string): OrderTracking | null {
    return this.trackingData.get(orderId) || null;
  }

  // Get all orders for a customer
  public getCustomerOrders(customerEmail: string): OrderTracking[] {
    return Array.from(this.trackingData.values())
      .filter(tracking => tracking.customer_email === customerEmail);
  }

  // Schedule automatic status updates (simulates scheduled job)
  private scheduleStatusUpdates(orderId: string): void {
    // Payment confirmation (1-2 hours)
    const paymentTimeout = setTimeout(() => {
      this.addOrderActivity(
        orderId, 
        'payment_confirmed', 
        'Payment has been successfully processed'
      );
    }, 1 * 60 * 60 * 1000); // 1 hour

    // Processing start (1 day)
    const processingTimeout = setTimeout(() => {
      this.addOrderActivity(
        orderId, 
        'processing', 
        'Order is being prepared for shipment'
      );
    }, 1 * 24 * 60 * 60 * 1000); // 1 day

    // Shipped (3 days)
    const shippedTimeout = setTimeout(() => {
      this.addOrderActivity(
        orderId, 
        'shipped', 
        'Order has been shipped and is on its way',
        { tracking_number: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` }
      );
    }, 3 * 24 * 60 * 60 * 1000); // 3 days

    // Delivered (7 days)
    const deliveredTimeout = setTimeout(() => {
      this.addOrderActivity(
        orderId, 
        'delivered', 
        'Order has been successfully delivered'
      );
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store timeouts for cleanup
    this.scheduledUpdates.set(orderId, paymentTimeout);
  }

  // Send order confirmation email (simulated)
  private async sendOrderConfirmationEmail(orderData: {
    order_id: string;
    customer_email: string;
    total_amount: number;
    items: any[];
  }): Promise<void> {
    try {
      // TODO: Implement actual email service (e.g., SendGrid, Mailgun)
      const emailContent = {
        to: orderData.customer_email,
        subject: `Order Confirmation - ${orderData.order_id}`,
        html: this.generateOrderConfirmationHTML(orderData),
        text: `Your order ${orderData.order_id} has been confirmed. Total: R${orderData.total_amount.toFixed(2)}`
      };

      console.log('Sending order confirmation email:', emailContent);

      // Simulate email sending delay (removing the toast notification)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      toast.error('Failed to send order confirmation email');
    }
  }

  // Send status update email (simulated)
  private async sendStatusUpdateEmail(tracking: OrderTracking, activity: OrderActivity): Promise<void> {
    try {
      const emailContent = {
        to: tracking.customer_email,
        subject: `Order Update - ${tracking.order_id}`,
        html: this.generateStatusUpdateHTML(tracking, activity),
        text: `Order ${tracking.order_id} status: ${activity.description}`
      };

      console.log('Sending status update email:', emailContent);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Only show toast for important updates
      if (['shipped', 'delivered'].includes(activity.activity_type)) {
        toast.success(`Order ${tracking.order_id} status updated: ${activity.activity_type}`);
      }
    } catch (error) {
      console.error('Error sending status update email:', error);
    }
  }

  // Generate order confirmation email HTML
  private generateOrderConfirmationHTML(orderData: {
    order_id: string;
    customer_email: string;
    total_amount: number;
    items: any[];
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #0066cc; font-size: 24px; font-weight: bold; }
          .order-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-size: 18px; font-weight: bold; color: #0066cc; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚰 MyFuze Premium Water</div>
            <h1>Order Confirmation</h1>
          </div>
          
          <p>Dear Valued Customer,</p>
          <p>Thank you for your order! We're excited to deliver premium hydration to you.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${orderData.order_id}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <div class="items">
              ${orderData.items.map((item, index) => `
                <div class="item">
                  <strong>Item ${index + 1}:</strong> Premium Water Bottle<br>
                  <small>Quantity: ${item.quantity || 1} | Size: ${item.size || '500ml'}</small>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              Total: R${orderData.total_amount.toFixed(2)}
            </div>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>You'll receive a payment confirmation within 1-2 hours</li>
            <li>Your order will be prepared within 1-2 business days</li>
            <li>Shipping typically takes 3-5 business days</li>
            <li>You'll receive tracking information once shipped</li>
          </ul>
          
          <div class="footer">
            <p>Questions? Contact us at support@myfuze.co.za</p>
            <p>© 2024 MyFuze Premium Water. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate status update email HTML
  private generateStatusUpdateHTML(tracking: OrderTracking, activity: OrderActivity): string {
    const statusMessages = {
      payment_confirmed: '💳 Payment Confirmed',
      processing: '📦 Order Processing',
      shipped: '🚚 Order Shipped',
      delivered: '✅ Order Delivered',
      cancelled: '❌ Order Cancelled'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #0066cc; font-size: 24px; font-weight: bold; }
          .status { background: #e3f2fd; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
          .timeline { margin: 20px 0; }
          .timeline-item { padding: 10px 0; border-left: 3px solid #eee; padding-left: 20px; margin-left: 10px; }
          .timeline-item.active { border-left-color: #0066cc; background: #f8f9fa; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚰 MyFuze Premium Water</div>
            <h1>Order Update</h1>
          </div>
          
          <div class="status">
            <h2>${statusMessages[activity.activity_type] || activity.activity_type}</h2>
            <p><strong>Order:</strong> ${tracking.order_id}</p>
            <p>${activity.description}</p>
          </div>
          
          <div class="timeline">
            <h3>Order Progress</h3>
            ${tracking.activities.map(act => `
              <div class="timeline-item ${act.id === activity.id ? 'active' : ''}">
                <strong>${new Date(act.timestamp).toLocaleDateString()}</strong><br>
                ${act.description}
                ${act.metadata?.tracking_number ? `<br><small>Tracking: ${act.metadata.tracking_number}</small>` : ''}
              </div>
            `).join('')}
          </div>
          
          ${activity.metadata?.tracking_number ? `
            <p><strong>Tracking Number:</strong> ${activity.metadata.tracking_number}</p>
          ` : ''}
          
          <div class="footer">
            <p>Questions? Contact us at support@myfuze.co.za</p>
            <p>© 2024 MyFuze Premium Water. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Clean up scheduled updates for an order
  public cancelScheduledUpdates(orderId: string): void {
    const timeout = this.scheduledUpdates.get(orderId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledUpdates.delete(orderId);
    }
  }

  // Initialize with some demo data
  public async initializeDemoData(): Promise<void> {
    const demoOrders = [
      {
        order_id: 'ORD-001',
        customer_email: 'demo@example.com',
        customer_id: 'customer-1',
        total_amount: 149.99,
        items: [{ quantity: 2, size: '500ml' }, { quantity: 1, size: '1L' }]
      }
    ];

    for (const order of demoOrders) {
      await this.createOrderTracking(order);
    }
  }
}

// Export singleton instance
export const orderTrackingService = OrderTrackingService.getInstance();
