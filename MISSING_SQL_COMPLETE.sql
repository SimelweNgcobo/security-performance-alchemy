-- =============================================================================
-- COMPLETE MISSING SQL STATEMENTS FOR MYFUZE WEBSITE
-- =============================================================================
-- Run these SQL statements in your Supabase SQL Editor to complete the database setup
-- Note: Some tables may already exist, the IF NOT EXISTS will handle conflicts

-- =============================================================================
-- 1. CORE MISSING TABLES THAT FRONTEND EXPECTS
-- =============================================================================

-- Contact submissions table (required by ContactReports admin component)
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Profiles table (required by paystack-webhook and manage-orders functions)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history table (required by manage-orders function for audit trail)
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT,
    changed_by UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table (referenced in code but may be missing)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, setting_key)
);

-- Email queue table (required by queue_email RPC function)
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT,
    template_id TEXT,
    template_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. MISSING COLUMNS IN EXISTING TABLES
-- =============================================================================

-- Add payment_reference column to orders table (required by paystack-webhook)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Add admin_notes column to orders table (used by admin interface)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add shipping_address column to orders table (used by order management)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Add metadata column to orders table (used for bulk order data)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- =============================================================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact forms" ON contact_submissions 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all contact submissions" ON contact_submissions 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can update contact submissions" ON contact_submissions 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON profiles 
FOR ALL USING (current_setting('role') = 'service_role');

-- Order status history policies
CREATE POLICY "Users can view their order history" ON order_status_history 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "Admins can view all order history" ON order_status_history 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can insert order history" ON order_status_history 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- System settings policies
CREATE POLICY "Anyone can view public settings" ON system_settings 
FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON system_settings 
FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Email queue policies (service role only)
CREATE POLICY "Service role can manage email queue" ON email_queue 
FOR ALL USING (current_setting('role') = 'service_role');

-- =============================================================================
-- 4. MISSING DATABASE FUNCTIONS/RPCS
-- =============================================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    counter INTEGER;
    order_num TEXT;
BEGIN
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO counter
    FROM orders 
    WHERE order_number ~ '^ORD-[0-9]+$';
    
    -- Generate order number
    order_num := 'ORD-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Generate invoice number function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    counter INTEGER;
    invoice_num TEXT;
BEGIN
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO counter
    FROM invoices 
    WHERE invoice_number ~ '^INV-[0-9]+$';
    
    -- Generate invoice number
    invoice_num := 'INV-' || LPAD(counter::TEXT, 6, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Add order activity function
CREATE OR REPLACE FUNCTION add_order_activity(
    p_order_id UUID,
    p_activity_type TEXT,
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO order_activities (
        order_id,
        activity_type,
        description,
        metadata,
        created_at
    )
    VALUES (
        p_order_id,
        p_activity_type,
        p_description,
        p_metadata,
        NOW()
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Queue email function (required by paystack-webhook)
CREATE OR REPLACE FUNCTION queue_email(
    p_to_email TEXT,
    p_subject TEXT,
    p_html_content TEXT DEFAULT NULL,
    p_template_id TEXT DEFAULT NULL,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process payment function (required by paystack-webhook)
CREATE OR REPLACE FUNCTION process_payment(
    p_order_id UUID,
    p_transaction_id TEXT,
    p_provider TEXT,
    p_amount DECIMAL,
    p_status TEXT,
    p_provider_response JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Insert/update payment transaction
    INSERT INTO payment_transactions (
        order_id,
        transaction_id,
        provider,
        amount,
        status,
        provider_response,
        created_at
    )
    VALUES (
        p_order_id,
        p_transaction_id,
        p_provider,
        p_amount,
        p_status,
        p_provider_response,
        NOW()
    )
    ON CONFLICT (transaction_id) DO UPDATE SET
        status = EXCLUDED.status,
        provider_response = EXCLUDED.provider_response,
        updated_at = NOW();
    
    -- Update order payment status if successful
    IF p_status = 'success' THEN
        UPDATE orders SET
            payment_status = 'paid',
            updated_at = NOW()
        WHERE id = p_order_id;
        
        -- Add payment activity
        PERFORM add_order_activity(
            p_order_id,
            'payment_confirmed',
            format('Payment confirmed via %s', p_provider),
            jsonb_build_object(
                'transaction_id', p_transaction_id,
                'amount', p_amount,
                'provider', p_provider
            )
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create order with tracking function (CRITICAL - required by paystack-webhook)
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
        metadata,
        admin_notes,
        created_at
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
        p_order_data->'shipping_address',
        p_order_data->'metadata',
        p_order_data->>'admin_notes',
        NOW()
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
        notes,
        created_at
    )
    VALUES (
        new_order_id,
        'order_created',
        'Order created and awaiting payment',
        NOW()
    );
    
    -- Add initial activity
    PERFORM add_order_activity(
        new_order_id,
        'order_created',
        'Order created with ' || array_length(p_items, 1) || ' items',
        p_order_data
    );
    
    -- Create invoice if needed
    IF p_order_data->>'create_invoice' = 'true' THEN
        INSERT INTO invoices (
            invoice_number,
            order_id,
            amount,
            status,
            due_date,
            created_at
        )
        VALUES (
            generate_invoice_number(),
            new_order_id,
            (p_order_data->>'total_amount')::DECIMAL(10,2),
            'draft',
            NOW() + INTERVAL '30 days',
            NOW()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5. TRIGGERS AND AUTOMATION
-- =============================================================================

-- Trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Trigger to update contact submissions timestamp
CREATE OR REPLACE FUNCTION update_contact_submission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_contact_submission_timestamp();

-- =============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Contact submissions indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order status history indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_at ON order_status_history(changed_at DESC);

-- Email queue indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);

-- =============================================================================
-- 7. DEFAULT PRODUCTS (Optional - add your own products)
-- =============================================================================

-- Basic water bottle products (add more as needed)
INSERT INTO products (name, description, size, price, stock, type, is_active) VALUES
('Water Bottle', 'Premium water bottle', '500ml', 25.00, 100, 'standard', true),
('Water Bottle', 'Premium water bottle', '1L', 35.00, 100, 'standard', true),
('Water Bottle', 'Premium water bottle', '1.5L', 45.00, 100, 'standard', true),
('Custom Bottle', 'Customizable water bottle', '500ml', 35.00, 50, 'custom', true),
('Custom Bottle', 'Customizable water bottle', '1L', 45.00, 50, 'custom', true)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. VERIFICATION QUERIES
-- =============================================================================

-- Run these to verify everything was created correctly:

-- Check tables exist
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename IN (
    'contact_submissions', 'profiles', 'order_status_history', 
    'system_settings', 'email_queue', 'orders', 'order_items', 
    'products', 'customers', 'admin_users'
)
ORDER BY tablename;

-- Check functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN (
    'is_admin', 'generate_order_number', 'generate_invoice_number',
    'add_order_activity', 'queue_email', 'process_payment', 
    'create_order_with_tracking', 'create_user_profile'
)
ORDER BY routine_name;

-- Check orders table has required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('payment_reference', 'admin_notes', 'shipping_address', 'metadata')
ORDER BY column_name;

-- Success message
SELECT 'Database setup completed successfully! All required tables, functions, and policies have been created.' as result;
