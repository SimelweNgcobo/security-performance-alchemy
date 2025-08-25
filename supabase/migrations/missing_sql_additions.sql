-- Missing SQL Additions for MyFuze Backend
-- Run this after complete_backend_schema.sql to address identified gaps

-- =============================================================================
-- 1. ADDITIONAL TABLES MISSING FROM TYPES
-- =============================================================================

-- Email templates table (referenced in types but missing from schema)
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table (more general than company_settings)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin audit log table (more detailed than admin_activity_log)
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. MISSING TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Auto-generate order number trigger for safety
CREATE OR REPLACE FUNCTION auto_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_order_number ON orders;
CREATE TRIGGER auto_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_order_number();

-- Update triggers for new tables
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. ENHANCED RLS POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Proper orders insertion policy (only authenticated users can create their own orders)
DROP POLICY IF EXISTS "System can insert orders" ON orders;
CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can still insert orders (for server-side creation)
CREATE POLICY "Service role can insert orders" ON orders
    FOR INSERT WITH CHECK (current_setting('role') = 'service_role');

-- Email templates policies
CREATE POLICY "Admins can view email templates" ON email_templates FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage email templates" ON email_templates FOR ALL USING (is_admin());

-- System settings policies
CREATE POLICY "Anyone can view public system settings" ON system_settings FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Admins can view all system settings" ON system_settings FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage system settings" ON system_settings FOR ALL USING (is_admin());

-- Admin audit log policies
CREATE POLICY "Admins can view audit log" ON admin_audit_log FOR SELECT USING (is_admin());
CREATE POLICY "System can insert audit log" ON admin_audit_log FOR INSERT WITH CHECK (TRUE);

-- =============================================================================
-- 4. ADDITIONAL BUSINESS FUNCTIONS
-- =============================================================================

-- Function to create admin audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
    p_admin_user_id UUID,
    p_action VARCHAR(100),
    p_table_name VARCHAR(100) DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT '{}',
    p_new_values JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO admin_audit_log (
        admin_user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    )
    VALUES (
        p_admin_user_id,
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    )
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get system setting value
CREATE OR REPLACE FUNCTION get_system_setting(setting_name TEXT)
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT setting_value INTO setting_value
    FROM system_settings
    WHERE setting_key = setting_name;
    
    RETURN COALESCE(setting_value, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update system setting
CREATE OR REPLACE FUNCTION update_system_setting(
    setting_name TEXT,
    new_value JSONB,
    admin_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO system_settings (setting_key, setting_value, updated_by)
    VALUES (setting_name, new_value, admin_user_id)
    ON CONFLICT (setting_key)
    DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 5. INDEXES FOR NEW TABLES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_email_templates_template_name ON email_templates(template_name);
CREATE INDEX IF NOT EXISTS idx_system_settings_setting_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_public ON system_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_table_name ON admin_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);

-- =============================================================================
-- 6. INITIAL DATA FOR NEW TABLES
-- =============================================================================

-- Insert default email templates
INSERT INTO email_templates (template_name, subject, html_content, variables) VALUES
('order_confirmation', 'Order Confirmation - {{order_number}}', 
 '<h1>Thank you for your order!</h1><p>Your order {{order_number}} has been confirmed.</p><p>Total: R{{total_amount}}</p>', 
 '{"order_number": "string", "total_amount": "number", "customer_name": "string"}'),
('order_shipped', 'Order Shipped - {{order_number}}', 
 '<h1>Your order is on the way!</h1><p>Order {{order_number}} has been shipped.</p><p>Tracking: {{tracking_number}}</p>', 
 '{"order_number": "string", "tracking_number": "string", "customer_name": "string"}'),
('enterprise_quote', 'Your Enterprise Quote - {{company_name}}', 
 '<h1>Enterprise Quote</h1><p>Dear {{contact_name}},</p><p>Thank you for your interest in MyFuze enterprise solutions.</p><p>Quote Amount: R{{quote_amount}}</p>', 
 '{"company_name": "string", "contact_name": "string", "quote_amount": "number"}')
ON CONFLICT (template_name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, category, description, is_public) VALUES
('maintenance_mode', 'false', 'system', 'Enable maintenance mode to prevent new orders', false),
('max_order_items', '50', 'orders', 'Maximum number of items per order', true),
('min_order_amount', '100', 'orders', 'Minimum order amount in ZAR', true),
('order_processing_time', '24', 'orders', 'Expected order processing time in hours', true),
('contact_email', '"support@myfuze.co.za"', 'company', 'Main contact email address', true),
('social_media', '{"facebook": "myfuze", "instagram": "myfuze", "twitter": "myfuze"}', 'company', 'Social media handles', true),
('business_hours', '{"monday": "8:00-17:00", "tuesday": "8:00-17:00", "wednesday": "8:00-17:00", "thursday": "8:00-17:00", "friday": "8:00-17:00", "saturday": "closed", "sunday": "closed"}', 'company', 'Business operating hours', true),
('api_rate_limit', '100', 'api', 'API requests per minute limit', false),
('max_upload_size', '10485760', 'uploads', 'Maximum file upload size in bytes (10MB)', false)
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================================================
-- 7. GRANT PERMISSIONS FOR NEW OBJECTS
-- =============================================================================

GRANT ALL ON TABLE email_templates TO anon, authenticated;
GRANT ALL ON TABLE system_settings TO anon, authenticated;
GRANT ALL ON TABLE admin_audit_log TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =============================================================================
-- 8. ROLE-BASED LOGIN SUPPORT
-- =============================================================================

-- Enhanced user role checking function
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(role TEXT, is_admin BOOLEAN, permissions JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(au.role, 'user') as role,
        COALESCE(p.is_admin, false) as is_admin,
        COALESCE(au.permissions, '{}') as permissions
    FROM auth.users u
    LEFT JOIN profiles p ON p.id = u.id
    LEFT JOIN admin_users au ON au.user_id = u.id AND au.is_active = true
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check specific permission
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
    user_role TEXT;
BEGIN
    SELECT permissions, role INTO user_permissions, user_role
    FROM admin_users 
    WHERE user_id = user_uuid AND is_active = true;
    
    -- Super admin has all permissions
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check specific permission in permissions JSON
    RETURN (user_permissions ? permission_name) AND (user_permissions->>permission_name)::boolean;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Missing SQL Additions Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Added:';
    RAISE NOTICE '- Email templates table with default templates';
    RAISE NOTICE '- System settings table with default settings';
    RAISE NOTICE '- Admin audit log for detailed tracking';
    RAISE NOTICE '- Auto order number generation trigger';
    RAISE NOTICE '- Enhanced RLS policies for proper security';
    RAISE NOTICE '- Role-based permission functions';
    RAISE NOTICE '- Additional business logic functions';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Next: Update BulkCheckout.tsx to use server-side order creation!';
END $$;
