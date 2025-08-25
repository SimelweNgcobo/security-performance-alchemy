-- MyFuze Complete Backend Implementation
-- This script creates all missing tables, functions, and security policies
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. CORE TABLES
-- =============================================================================

-- Profiles table (consolidate naming with customer_profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(50) DEFAULT 'manager' CHECK (role IN ('super_admin', 'manager', 'designer', 'delivery_handler')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company settings
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_by UUID REFERENCES admin_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    type VARCHAR(50) DEFAULT 'standard' CHECK (type IN ('standard', 'custom')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table (enhanced)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    customer_id UUID REFERENCES customers(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('pending', 'processing', 'in_transit', 'delivered', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial_refund')),
    delivery_status VARCHAR(50) DEFAULT 'not_shipped' CHECK (delivery_status IN ('not_shipped', 'processing', 'shipped', 'out_for_delivery', 'delivered')),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_reference VARCHAR(255),
    shipping_address TEXT, -- Encrypted JSON
    metadata JSONB DEFAULT '{}',
    admin_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    custom_branding_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table (CRITICAL for security)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    transaction_id VARCHAR(255) UNIQUE NOT NULL, -- Paystack transaction ID
    provider VARCHAR(50) DEFAULT 'paystack',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
    provider_response JSONB DEFAULT '{}',
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history (audit trail)
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order activities/tracking
CREATE TABLE IF NOT EXISTS order_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order tracking
CREATE TABLE IF NOT EXISTS order_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date DATE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'failed')),
    processed_by UUID REFERENCES admin_users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    provider_refund_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery assignments
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_notes TEXT
);

-- User labels table
CREATE TABLE IF NOT EXISTS user_labels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    design_data JSONB NOT NULL DEFAULT '{}',
    dimensions JSONB DEFAULT '{"width": 264, "height": 60}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User addresses (non-encrypted)
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encrypted addresses table
CREATE TABLE IF NOT EXISTS encrypted_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_data TEXT NOT NULL, -- Base64 encoded encrypted address
    is_default BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    custom_branding_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enterprise requests table
CREATE TABLE IF NOT EXISTS enterprise_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    company_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    requirements TEXT,
    designs JSONB DEFAULT '[]',
    quote_amount DECIMAL(10,2),
    quote_valid_until DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'email_sent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email queue table (for reliable email delivery)
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) DEFAULT 'noreply@myfuze.co.za',
    subject VARCHAR(500) NOT NULL,
    html_content TEXT,
    text_content TEXT,
    template_id VARCHAR(100),
    template_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_order_activities_order_id ON order_activities(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_user_labels_user_id ON user_labels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_labels_is_default ON user_labels(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_encrypted_addresses_user_id ON encrypted_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_enterprise_requests_user_id ON enterprise_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_requests_status ON enterprise_requests(status);

-- =============================================================================
-- 3. TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_tracking_updated_at ON order_tracking;
CREATE TRIGGER update_order_tracking_updated_at BEFORE UPDATE ON order_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_labels_updated_at ON user_labels;
CREATE TRIGGER update_user_labels_updated_at BEFORE UPDATE ON user_labels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_encrypted_addresses_updated_at ON encrypted_addresses;
CREATE TRIGGER update_encrypted_addresses_updated_at BEFORE UPDATE ON encrypted_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enterprise_requests_updated_at ON enterprise_requests;
CREATE TRIGGER update_enterprise_requests_updated_at BEFORE UPDATE ON enterprise_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. BUSINESS LOGIC FUNCTIONS
-- =============================================================================

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_number VARCHAR(50);
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this number already exists
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 9999 THEN
            new_number := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD(floor(random() * 1000)::TEXT, 3, '0');
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_number VARCHAR(50);
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'INV' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
        
        -- Check if this number already exists
        IF NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 9999 THEN
            new_number := 'INV' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD(floor(random() * 1000)::TEXT, 3, '0');
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND is_admin = TRUE
    ) OR EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add order activity
CREATE OR REPLACE FUNCTION add_order_activity(
    p_order_id UUID,
    p_activity_type VARCHAR(50),
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO order_activities (order_id, activity_type, description, metadata)
    VALUES (p_order_id, p_activity_type, p_description, p_metadata)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Queue email for sending
CREATE OR REPLACE FUNCTION queue_email(
    p_to_email VARCHAR(255),
    p_subject VARCHAR(500),
    p_html_content TEXT DEFAULT NULL,
    p_template_id VARCHAR(100) DEFAULT NULL,
    p_template_data JSONB DEFAULT '{}',
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
    email_id UUID;
BEGIN
    INSERT INTO email_queue (
        to_email, 
        subject, 
        html_content, 
        template_id, 
        template_data, 
        scheduled_for
    )
    VALUES (
        p_to_email, 
        p_subject, 
        p_html_content, 
        p_template_id, 
        p_template_data, 
        p_scheduled_for
    )
    RETURNING id INTO email_id;
    
    RETURN email_id;
END;
$$ LANGUAGE plpgsql;

-- Process payment transaction
CREATE OR REPLACE FUNCTION process_payment(
    p_order_id UUID,
    p_transaction_id VARCHAR(255),
    p_provider VARCHAR(50),
    p_amount DECIMAL(10,2),
    p_status VARCHAR(50),
    p_provider_response JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    payment_id UUID;
BEGIN
    -- Insert payment transaction
    INSERT INTO payment_transactions (
        order_id, 
        transaction_id, 
        provider, 
        amount, 
        status, 
        provider_response,
        verified_at
    )
    VALUES (
        p_order_id, 
        p_transaction_id, 
        p_provider, 
        p_amount, 
        p_status, 
        p_provider_response,
        CASE WHEN p_status = 'success' THEN NOW() ELSE NULL END
    )
    RETURNING id INTO payment_id;
    
    -- Update order payment status if payment successful
    IF p_status = 'success' THEN
        UPDATE orders 
        SET payment_status = 'paid',
            status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END
        WHERE id = p_order_id;
        
        -- Add activity log
        PERFORM add_order_activity(
            p_order_id, 
            'payment_processed', 
            'Payment successfully processed via ' || p_provider,
            jsonb_build_object('transaction_id', p_transaction_id, 'amount', p_amount)
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update order status with tracking
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_status VARCHAR(50),
    p_payment_status VARCHAR(50) DEFAULT NULL,
    p_delivery_status VARCHAR(50) DEFAULT NULL,
    p_tracking_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    old_status VARCHAR(50);
    old_payment_status VARCHAR(50);
    old_delivery_status VARCHAR(50);
BEGIN
    -- Get current statuses
    SELECT status, payment_status, delivery_status 
    INTO old_status, old_payment_status, old_delivery_status
    FROM orders WHERE id = p_order_id;
    
    -- Update order
    UPDATE orders 
    SET status = p_status,
        payment_status = COALESCE(p_payment_status, payment_status),
        delivery_status = COALESCE(p_delivery_status, delivery_status)
    WHERE id = p_order_id;
    
    -- Log status change
    INSERT INTO order_status_history (
        order_id, 
        old_status, 
        new_status, 
        changed_by
    )
    VALUES (
        p_order_id, 
        old_status, 
        p_status, 
        auth.uid()
    );
    
    -- Add activity
    PERFORM add_order_activity(
        p_order_id, 
        'status_updated', 
        'Order status changed from ' || old_status || ' to ' || p_status,
        p_tracking_data
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create order with tracking (CRITICAL FUNCTION)
CREATE OR REPLACE FUNCTION create_order_with_tracking(
    p_user_id UUID,
    p_customer_id UUID,
    p_order_data JSONB,
    p_items JSONB[],
    p_payment_data JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    new_order_id UUID;
    order_number VARCHAR(50);
    item JSONB;
    order_result JSONB;
BEGIN
    -- Generate order number
    order_number := generate_order_number();
    
    -- Create order
    INSERT INTO orders (
        user_id,
        customer_id,
        order_number,
        status,
        payment_status,
        delivery_status,
        total_amount,
        payment_reference,
        shipping_address,
        metadata
    )
    VALUES (
        p_user_id,
        p_customer_id,
        order_number,
        COALESCE(p_order_data->>'status', 'pending'),
        COALESCE(p_order_data->>'payment_status', 'pending'),
        COALESCE(p_order_data->>'delivery_status', 'not_shipped'),
        (p_order_data->>'total_amount')::DECIMAL(10,2),
        p_order_data->>'payment_reference',
        p_order_data->>'shipping_address',
        p_order_data
    )
    RETURNING id INTO new_order_id;
    
    -- Create order items
    FOREACH item IN ARRAY p_items
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            custom_branding_data
        )
        VALUES (
            new_order_id,
            (item->>'product_id')::UUID,
            (item->>'quantity')::INTEGER,
            (item->>'unit_price')::DECIMAL(10,2),
            (item->>'total_price')::DECIMAL(10,2),
            COALESCE(item->'custom_branding_data', '{}')
        );
    END LOOP;
    
    -- Create initial tracking entry
    INSERT INTO order_tracking (
        order_id,
        status,
        notes
    )
    VALUES (
        new_order_id,
        'order_created',
        'Order created and awaiting payment'
    );
    
    -- Add initial activity
    PERFORM add_order_activity(
        new_order_id,
        'order_created',
        'Order created with ' || array_length(p_items, 1) || ' items'
    );
    
    -- Create invoice if needed
    IF p_order_data->>'create_invoice' = 'true' THEN
        INSERT INTO invoices (
            invoice_number,
            order_id,
            amount,
            status,
            due_date
        )
        VALUES (
            generate_invoice_number(),
            new_order_id,
            (p_order_data->>'total_amount')::DECIMAL(10,2),
            'draft',
            NOW() + INTERVAL '30 days'
        );
    END IF;
    
    -- Return order details
    SELECT jsonb_build_object(
        'order_id', new_order_id,
        'order_number', order_number,
        'status', 'success',
        'message', 'Order created successfully'
    ) INTO order_result;
    
    RETURN order_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. TRIGGERS FOR BUSINESS LOGIC
-- =============================================================================

-- Trigger to create customer profile when user signs up
CREATE OR REPLACE FUNCTION create_customer_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    INSERT INTO customers (user_id, email, name, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to ensure only one default label per user
CREATE OR REPLACE FUNCTION ensure_single_default_label()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE user_labels 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id 
        AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE user_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id 
        AND is_default = TRUE;
        
        UPDATE encrypted_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id 
        AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_customer_profile();

DROP TRIGGER IF EXISTS ensure_single_default_label_trigger ON user_labels;
CREATE TRIGGER ensure_single_default_label_trigger
    BEFORE INSERT OR UPDATE ON user_labels
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_label();

DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON user_addresses;
CREATE TRIGGER ensure_single_default_address_trigger
    BEFORE INSERT OR UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

DROP TRIGGER IF EXISTS ensure_single_default_encrypted_address_trigger ON encrypted_addresses;
CREATE TRIGGER ensure_single_default_encrypted_address_trigger
    BEFORE INSERT OR UPDATE ON encrypted_addresses
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());

-- Admin users policies
CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT USING (is_admin());
CREATE POLICY "Super admins can manage admin users" ON admin_users FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = TRUE)
);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin());
CREATE POLICY "System can insert orders" ON orders FOR INSERT WITH CHECK (TRUE);

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (is_admin());

-- Payment transactions policies
CREATE POLICY "Users can view their payment transactions" ON payment_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = payment_transactions.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can view all payment transactions" ON payment_transactions FOR SELECT USING (is_admin());
CREATE POLICY "System can insert payment transactions" ON payment_transactions FOR INSERT WITH CHECK (TRUE);

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin());

-- User labels policies
CREATE POLICY "Users can manage their own labels" ON user_labels FOR ALL USING (auth.uid() = user_id);

-- User addresses policies
CREATE POLICY "Users can manage their own addresses" ON user_addresses FOR ALL USING (auth.uid() = user_id);

-- Encrypted addresses policies
CREATE POLICY "Users can manage their own encrypted addresses" ON encrypted_addresses FOR ALL USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can manage their own cart items" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Enterprise requests policies
CREATE POLICY "Users can view their own enterprise requests" ON enterprise_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create enterprise requests" ON enterprise_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all enterprise requests" ON enterprise_requests FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update enterprise requests" ON enterprise_requests FOR UPDATE USING (is_admin());

-- Email queue policies (service role only)
CREATE POLICY "Service role can manage email queue" ON email_queue FOR ALL USING (
    current_setting('role') = 'service_role'
);

-- Company settings policies
CREATE POLICY "Admins can view company settings" ON company_settings FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage company settings" ON company_settings FOR ALL USING (is_admin());

-- =============================================================================
-- 7. INITIAL DATA AND ADMIN SETUP
-- =============================================================================

-- Default products removed for production - add your own products via admin panel

-- Insert default company settings (update these values for production)
INSERT INTO company_settings (setting_key, setting_value) VALUES
('company_name', '"Your Company Name"'),
('company_email', '"info@yourcompany.com"'),
('company_phone', '"+27 XX XXX XXXX"'),
('company_address', '"Your Business Address"'),
('email_from_address', '"noreply@yourcompany.com"'),
('email_from_name', '"Your Company Name"'),
('free_delivery_threshold', '1000'),
('delivery_fee', '150'),
('tax_rate', '0.15')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to create first admin user
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find user by email
    SELECT au.id INTO user_id
    FROM auth.users au
    WHERE au.email = user_email;
    
    IF user_id IS NOT NULL THEN
        -- Update profile with admin flag
        INSERT INTO profiles (id, email, is_admin)
        VALUES (user_id, user_email, TRUE)
        ON CONFLICT (id) 
        DO UPDATE SET is_admin = TRUE;
        
        -- Create admin user record
        INSERT INTO admin_users (user_id, role, is_active)
        VALUES (user_id, 'super_admin', TRUE)
        ON CONFLICT (user_id)
        DO UPDATE SET role = 'super_admin', is_active = TRUE;
        
        RAISE NOTICE 'User % is now an admin', user_email;
    ELSE
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 8. GRANT PERMISSIONS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ MyFuze Backend Schema Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Next Steps:';
    RAISE NOTICE '1. Deploy Supabase Edge Functions for payment verification';
    RAISE NOTICE '2. Set up Paystack webhook endpoint';
    RAISE NOTICE '3. Create your first admin user with: SELECT make_user_admin(''your-email@domain.com'');';
    RAISE NOTICE '4. Update environment variables in Supabase';
    RAISE NOTICE '5. Test the payment flow end-to-end';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Update BulkCheckout.tsx to use server-side order creation!';
END $$;
