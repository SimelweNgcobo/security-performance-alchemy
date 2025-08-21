-- =====================================================
-- MYFUZE COMPLETE BACKEND MIGRATION
-- This file contains ALL missing backend SQL needed
-- =====================================================

-- 1. CREATE MISSING TABLES
-- =====================================================

-- Encrypted addresses table (CRITICAL - used by encryptedAddressService)
CREATE TABLE IF NOT EXISTS encrypted_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    encrypted_data TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table (for payment tracking and reconciliation)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    transaction_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL, -- 'paystack', 'payfast', etc.
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    status TEXT NOT NULL, -- 'pending', 'success', 'failed', 'cancelled'
    provider_response JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order tracking table (to replace in-memory tracking)
CREATE TABLE IF NOT EXISTS order_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    status TEXT NOT NULL,
    location TEXT,
    notes TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    tracking_number TEXT,
    carrier TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity audit log enhancement
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES admin_users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings enhancement
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, setting_key)
);

-- Email queue for reliable email delivery
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    from_email TEXT DEFAULT 'noreply@myfuze.co.za',
    subject TEXT NOT NULL,
    html_content TEXT,
    text_content TEXT,
    template_id TEXT,
    template_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'retrying'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Encrypted addresses indexes
CREATE INDEX IF NOT EXISTS idx_encrypted_addresses_user_id ON encrypted_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_addresses_default ON encrypted_addresses(user_id, is_default) WHERE is_default = true;

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- Order tracking indexes
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_status ON order_tracking(status);
CREATE INDEX IF NOT EXISTS idx_order_tracking_tracking_number ON order_tracking(tracking_number);

-- Admin audit log indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_table_record ON admin_audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);

-- Email queue indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for) WHERE status = 'pending';

-- Existing table improvements
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_activities_order_id ON order_activities(order_id);
CREATE INDEX IF NOT EXISTS idx_order_activities_created_at ON order_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_enterprise_requests_status ON enterprise_requests(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_requests_user_id ON enterprise_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_user_labels_user_id ON user_labels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_labels_default ON user_labels(user_id, is_default) WHERE is_default = true;

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all user-specific tables
ALTER TABLE encrypted_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Encrypted addresses policies
CREATE POLICY "Users can manage their own encrypted addresses" 
ON encrypted_addresses 
FOR ALL 
USING (auth.uid()::text = user_id::text);

-- Order tracking policies
CREATE POLICY "Users can view tracking for their orders" 
ON order_tracking 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_tracking.order_id 
        AND orders.user_id::text = auth.uid()::text
    )
);

-- Payment transactions policies
CREATE POLICY "Users can view transactions for their orders" 
ON payment_transactions 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = payment_transactions.order_id 
        AND orders.user_id::text = auth.uid()::text
    )
);

-- Admin audit log policies
CREATE POLICY "Only admins can access admin audit log" 
ON admin_audit_log 
FOR ALL 
USING (is_admin());

-- System settings policies
CREATE POLICY "Public settings are viewable by all" 
ON system_settings 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Admins can manage all settings" 
ON system_settings 
FOR ALL 
USING (is_admin());

-- Email queue policies  
CREATE POLICY "Only service role can access email queue" 
ON email_queue 
FOR ALL 
USING (false);

-- 4. DATABASE TRIGGERS
-- =====================================================

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to relevant tables
CREATE TRIGGER update_encrypted_addresses_updated_at
    BEFORE UPDATE ON encrypted_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_tracking_updated_at
    BEFORE UPDATE ON order_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. STORED PROCEDURES AND FUNCTIONS
-- =====================================================

-- Enhanced order creation function
CREATE OR REPLACE FUNCTION create_order_with_tracking(
    p_user_id UUID,
    p_customer_id UUID,
    p_order_data JSONB,
    p_items JSONB[],
    p_payment_data JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_item JSONB;
    v_result JSONB;
BEGIN
    -- Generate order number
    SELECT generate_order_number() INTO v_order_number;
    
    -- Create order
    INSERT INTO orders (
        order_number,
        user_id,
        customer_id,
        total_amount,
        status,
        payment_status,
        delivery_status,
        delivery_address,
        delivery_city,
        delivery_postal_code,
        notes,
        metadata
    ) VALUES (
        v_order_number,
        p_user_id,
        p_customer_id,
        (p_order_data->>'total_amount')::DECIMAL,
        COALESCE(p_order_data->>'status', 'pending'),
        COALESCE(p_order_data->>'payment_status', 'pending'),
        COALESCE(p_order_data->>'delivery_status', 'pending'),
        p_order_data->>'delivery_address',
        p_order_data->>'delivery_city',
        p_order_data->>'delivery_postal_code',
        p_order_data->>'notes',
        p_order_data->'metadata'
    ) RETURNING id INTO v_order_id;
    
    -- Create order items
    FOREACH v_item IN ARRAY p_items LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            custom_branding_data
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::UUID,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::DECIMAL,
            (v_item->>'total_price')::DECIMAL,
            v_item->'custom_branding_data'
        );
    END LOOP;
    
    -- Create initial order activity
    PERFORM add_order_activity(
        v_order_id,
        'order_created',
        'Order has been created and is awaiting payment',
        '{}'::jsonb
    );
    
    -- Create initial order tracking
    INSERT INTO order_tracking (
        order_id,
        status,
        notes,
        estimated_delivery
    ) VALUES (
        v_order_id,
        'order_created',
        'Order created successfully',
        NOW() + INTERVAL '7 days'
    );
    
    -- Create payment transaction if payment data provided
    IF p_payment_data IS NOT NULL THEN
        INSERT INTO payment_transactions (
            order_id,
            transaction_id,
            provider,
            amount,
            status,
            provider_response
        ) VALUES (
            v_order_id,
            p_payment_data->>'transaction_id',
            p_payment_data->>'provider',
            (p_payment_data->>'amount')::DECIMAL,
            COALESCE(p_payment_data->>'status', 'pending'),
            p_payment_data->'response'
        );
    END IF;
    
    -- Return order details
    SELECT jsonb_build_object(
        'order_id', v_order_id,
        'order_number', v_order_number,
        'status', 'created'
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update order status and tracking
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_status TEXT,
    p_payment_status TEXT DEFAULT NULL,
    p_delivery_status TEXT DEFAULT NULL,
    p_tracking_data JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_order_exists BOOLEAN;
BEGIN
    -- Check if order exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE id = p_order_id) INTO v_order_exists;
    
    IF NOT v_order_exists THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;
    
    -- Update order status
    UPDATE orders SET
        status = COALESCE(p_status, status),
        payment_status = COALESCE(p_payment_status, payment_status),
        delivery_status = COALESCE(p_delivery_status, delivery_status),
        updated_at = NOW()
    WHERE id = p_order_id;
    
    -- Add order activity
    PERFORM add_order_activity(
        p_order_id,
        p_status,
        format('Order status updated to: %s', p_status),
        COALESCE(p_tracking_data, '{}')
    );
    
    -- Update order tracking
    INSERT INTO order_tracking (
        order_id,
        status,
        notes,
        tracking_number,
        carrier,
        metadata
    ) VALUES (
        p_order_id,
        p_status,
        format('Status updated to: %s', p_status),
        p_tracking_data->>'tracking_number',
        p_tracking_data->>'carrier',
        p_tracking_data
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process payment
CREATE OR REPLACE FUNCTION process_payment(
    p_order_id UUID,
    p_transaction_id TEXT,
    p_provider TEXT,
    p_amount DECIMAL,
    p_status TEXT,
    p_provider_response JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
    v_order_exists BOOLEAN;
BEGIN
    -- Check if order exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE id = p_order_id) INTO v_order_exists;
    
    IF NOT v_order_exists THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;
    
    -- Insert/update payment transaction
    INSERT INTO payment_transactions (
        order_id,
        transaction_id,
        provider,
        amount,
        status,
        provider_response
    ) VALUES (
        p_order_id,
        p_transaction_id,
        p_provider,
        p_amount,
        p_status,
        p_provider_response
    ) ON CONFLICT (transaction_id) DO UPDATE SET
        status = EXCLUDED.status,
        provider_response = EXCLUDED.provider_response,
        updated_at = NOW();
    
    -- Update order payment status if successful
    IF p_status = 'success' THEN
        UPDATE orders SET
            payment_status = 'paid',
            updated_at = NOW()
        WHERE id = p_order_id;
        
        -- Add payment confirmed activity
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
        
        -- Queue confirmation email
        INSERT INTO email_queue (
            to_email,
            subject,
            template_id,
            template_data
        ) SELECT
            c.email,
            format('Payment Confirmed - Order %s', o.order_number),
            'payment_confirmation',
            jsonb_build_object(
                'order_number', o.order_number,
                'amount', p_amount,
                'transaction_id', p_transaction_id
            )
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        WHERE o.id = p_order_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue emails
CREATE OR REPLACE FUNCTION queue_email(
    p_to_email TEXT,
    p_subject TEXT,
    p_html_content TEXT DEFAULT NULL,
    p_template_id TEXT DEFAULT NULL,
    p_template_data JSONB DEFAULT '{}',
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS UUID AS $$
DECLARE
    v_email_id UUID;
BEGIN
    INSERT INTO email_queue (
        to_email,
        subject,
        html_content,
        template_id,
        template_data,
        scheduled_for
    ) VALUES (
        p_to_email,
        p_subject,
        p_html_content,
        p_template_id,
        p_template_data,
        p_scheduled_for
    ) RETURNING id INTO v_email_id;
    
    RETURN v_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. INSERT DEFAULT DATA
-- =====================================================

-- Insert default company settings
INSERT INTO company_settings (setting_key, setting_value) VALUES
('company_name', '"MyFuze Premium Water"'),
('company_email', '"info@myfuze.co.za"'),
('company_phone', '"+27 11 123 4567"'),
('company_address', '"123 Business Street, Johannesburg, 2000, South Africa"'),
('payment_methods', '["paystack", "payfast", "eft", "card"]'),
('default_delivery_fee', '150'),
('free_delivery_threshold', '1000'),
('delivery_areas', '["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"]'),
('brand_colors', '["#1e40af", "#0066cc", "#004e7c"]'),
('available_fonts', '["Arial", "Helvetica", "Times New Roman", "Open Sans"]'),
('order_number_prefix', '"ORD"'),
('invoice_number_prefix', '"INV"'),
('low_stock_threshold', '10'),
('auto_approve_orders', 'false')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (category, setting_key, setting_value, description, is_public) VALUES
('email', 'from_address', '"noreply@myfuze.co.za"', 'Default from email address', false),
('email', 'support_address', '"support@myfuze.co.za"', 'Support email address', true),
('email', 'enterprise_address', '"enterprise@myfuze.co.za"', 'Enterprise inquiries email', true),
('business', 'business_hours', '"Monday-Friday 9AM-5PM SAST"', 'Business operating hours', true),
('business', 'processing_time', '"1-2 business days"', 'Order processing time', true),
('business', 'delivery_time', '"3-5 business days"', 'Standard delivery time', true),
('features', 'custom_labels_enabled', 'true', 'Enable custom label features', false),
('features', 'bulk_orders_enabled', 'true', 'Enable bulk order features', false),
('features', 'enterprise_quotes_enabled', 'true', 'Enable enterprise quote requests', false)
ON CONFLICT (category, setting_key) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (template_name, subject, html_content, variables) VALUES
(
    'order_confirmation',
    'Order Confirmation - {{order_number}}',
    '<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px}</style></head><body><div class="container"><h1>Order Confirmation</h1><p>Dear {{customer_name}},</p><p>Your order {{order_number}} has been confirmed.</p><p><strong>Total: R{{total_amount}}</strong></p><p>Thank you for choosing MyFuze!</p></div></body></html>',
    '{"order_number": "Order number", "customer_name": "Customer name", "total_amount": "Order total"}'
),
(
    'payment_confirmation',
    'Payment Confirmed - {{order_number}}',
    '<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px}</style></head><body><div class="container"><h1>Payment Confirmed</h1><p>Your payment for order {{order_number}} has been confirmed.</p><p><strong>Amount: R{{amount}}</strong></p><p>Transaction ID: {{transaction_id}}</p></div></body></html>',
    '{"order_number": "Order number", "amount": "Payment amount", "transaction_id": "Transaction ID"}'
),
(
    'order_shipped',
    'Order Shipped - {{order_number}}',
    '<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px}</style></head><body><div class="container"><h1>Order Shipped</h1><p>Great news! Your order {{order_number}} has been shipped.</p><p><strong>Tracking Number: {{tracking_number}}</strong></p><p>Estimated delivery: {{estimated_delivery}}</p></div></body></html>',
    '{"order_number": "Order number", "tracking_number": "Tracking number", "estimated_delivery": "Estimated delivery date"}'
)
ON CONFLICT (template_name) DO NOTHING;