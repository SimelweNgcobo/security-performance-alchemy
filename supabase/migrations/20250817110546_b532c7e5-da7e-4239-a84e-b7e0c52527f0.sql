-- Create comprehensive bottle shop database schema

-- Products table (bottles)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT NOT NULL, -- e.g., "500ml", "1L", "2L"
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  type TEXT NOT NULL DEFAULT 'standard' CHECK (type IN ('standard', 'custom')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'declined')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partial_refund')),
  delivery_status TEXT DEFAULT 'not_shipped' CHECK (delivery_status IN ('not_shipped', 'processing', 'out_for_delivery', 'delivered')),
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_postal_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  custom_branding_data JSONB, -- Store logo, text, colors, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('super_admin', 'manager', 'designer', 'delivery_handler')),
  permissions JSONB, -- Store specific permissions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery assignments table
CREATE TABLE public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  delivery_notes TEXT
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Refunds table
CREATE TABLE public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
  processed_by UUID REFERENCES public.admin_users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin activity log
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'order', 'product', 'customer', etc.
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Company settings table
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES public.admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  );
$$;

-- Admin policies - only admins can access these tables
CREATE POLICY "Admin access to products" ON public.products
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to customers" ON public.customers
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to orders" ON public.orders
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to order_items" ON public.order_items
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to admin_users" ON public.admin_users
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to delivery_assignments" ON public.delivery_assignments
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to invoices" ON public.invoices
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to refunds" ON public.refunds
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to activity_log" ON public.admin_activity_log
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin access to company_settings" ON public.company_settings
  FOR ALL USING (public.is_admin());

-- Create indexes for better performance
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_delivery_assignments_order_id ON public.delivery_assignments(order_id);
CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX idx_refunds_order_id ON public.refunds(order_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate order numbers automatically
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate invoice numbers automatically
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.auto_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number = public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.auto_generate_order_number();

-- Insert some sample data
INSERT INTO public.products (name, size, price, stock, type, description) VALUES
('Standard Water Bottle', '500ml', 25.00, 100, 'standard', 'Clear plastic water bottle'),
('Standard Water Bottle', '1L', 35.00, 80, 'standard', 'Large clear plastic water bottle'),
('Custom Branded Bottle', '500ml', 45.00, 50, 'custom', 'Customizable water bottle with your logo'),
('Custom Branded Bottle', '1L', 55.00, 30, 'custom', 'Large customizable water bottle with your logo');

INSERT INTO public.customers (name, email, phone, address, city, postal_code) VALUES
('John Doe', 'john@example.com', '+27123456789', '123 Main St', 'Cape Town', '8001'),
('Jane Smith', 'jane@example.com', '+27987654321', '456 Oak Ave', 'Johannesburg', '2000');

-- Insert default company settings
INSERT INTO public.company_settings (setting_key, setting_value) VALUES
('company_name', '"Bottle Co"'),
('company_address', '"123 Business St, Cape Town, 8001"'),
('company_phone', '"+27123456789"'),
('company_email', '"info@bottleco.com"'),
('payment_methods', '["payfast", "paypal", "card"]'),
('default_delivery_fee', '50.00');