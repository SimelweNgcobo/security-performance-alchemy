-- Create missing tables for complete backend functionality

-- Enterprise requests table
CREATE TABLE public.enterprise_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  requirements TEXT,
  designs JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'quoted', 'approved', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  quote_amount DECIMAL(10,2),
  quote_valid_until DATE
);

-- Customer profiles table (extends auth.users)
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Order tracking activities table
CREATE TABLE public.order_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('order_created', 'payment_confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cart items table for persistent cart
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  custom_branding_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Email templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.enterprise_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enterprise_requests
CREATE POLICY "Users can view their own enterprise requests" ON public.enterprise_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own enterprise requests" ON public.enterprise_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all enterprise requests" ON public.enterprise_requests
  FOR ALL USING (is_admin());

-- RLS Policies for customer_profiles
CREATE POLICY "Users can view their own profile" ON public.customer_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.customer_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.customer_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.customer_profiles
  FOR SELECT USING (is_admin());

-- RLS Policies for order_activities
CREATE POLICY "Users can view activities for their orders" ON public.order_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN customers ON orders.customer_id = customers.id 
      WHERE orders.id = order_activities.order_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order activities" ON public.order_activities
  FOR ALL USING (is_admin());

-- RLS Policies for cart_items
CREATE POLICY "Users can manage their own cart" ON public.cart_items
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for email_templates (admin only)
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (is_admin());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (is_admin());

-- Create triggers for updated_at columns
CREATE TRIGGER update_enterprise_requests_updated_at
  BEFORE UPDATE ON public.enterprise_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create customer profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customer_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.customers (user_id, name, email, full_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile and customer record on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to add order activity
CREATE OR REPLACE FUNCTION public.add_order_activity(
  p_order_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.order_activities (order_id, activity_type, description, metadata)
  VALUES (p_order_id, p_activity_type, p_description, p_metadata)
  RETURNING id INTO activity_id;
  
  -- Update order status if needed
  UPDATE public.orders 
  SET 
    status = CASE 
      WHEN p_activity_type = 'payment_confirmed' THEN 'paid'
      WHEN p_activity_type = 'processing' THEN 'processing'
      WHEN p_activity_type = 'shipped' THEN 'shipped'
      WHEN p_activity_type = 'delivered' THEN 'delivered'
      WHEN p_activity_type = 'cancelled' THEN 'cancelled'
      ELSE status
    END,
    payment_status = CASE 
      WHEN p_activity_type = 'payment_confirmed' THEN 'paid'
      ELSE payment_status
    END,
    delivery_status = CASE 
      WHEN p_activity_type = 'shipped' THEN 'out_for_delivery'
      WHEN p_activity_type = 'delivered' THEN 'delivered'
      ELSE delivery_status
    END,
    updated_at = now()
  WHERE id = p_order_id;
  
  RETURN activity_id;
END;
$$;

-- Insert default email templates
INSERT INTO public.email_templates (template_name, subject, html_content, variables) VALUES
('order_confirmation', 'Order Confirmation - {{order_number}}', '<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f5f5f5}.container{max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px}.header{text-align:center;border-bottom:2px solid #0066cc;padding-bottom:20px;margin-bottom:30px}.logo{color:#0066cc;font-size:24px;font-weight:bold}</style></head><body><div class="container"><div class="header"><div class="logo">🚰 MyFuze Premium Water</div><h1>Order Confirmation</h1></div><p>Dear {{customer_name}},</p><p>Thank you for your order! Your order {{order_number}} has been confirmed.</p><p><strong>Total: R{{total_amount}}</strong></p><p>You will receive updates as your order is processed.</p></div></body></html>', '["order_number", "customer_name", "total_amount"]'),
('order_shipped', 'Order Shipped - {{order_number}}', '<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background-color:#f5f5f5}.container{max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px}.header{text-align:center;border-bottom:2px solid #0066cc;padding-bottom:20px;margin-bottom:30px}.logo{color:#0066cc;font-size:24px;font-weight:bold}</style></head><body><div class="container"><div class="header"><div class="logo">🚰 MyFuze Premium Water</div><h1>Order Shipped</h1></div><p>Dear {{customer_name}},</p><p>Great news! Your order {{order_number}} has been shipped.</p><p><strong>Tracking Number: {{tracking_number}}</strong></p><p>Expected delivery in 3-5 business days.</p></div></body></html>', '["order_number", "customer_name", "tracking_number"]');

-- Create indexes for better performance
CREATE INDEX idx_enterprise_requests_status ON public.enterprise_requests(status);
CREATE INDEX idx_enterprise_requests_user_id ON public.enterprise_requests(user_id);
CREATE INDEX idx_customer_profiles_user_id ON public.customer_profiles(user_id);
CREATE INDEX idx_order_activities_order_id ON public.order_activities(order_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, read);

-- Add missing foreign key to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id) WHERE user_id IS NOT NULL;