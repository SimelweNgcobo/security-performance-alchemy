-- Migration for Admin Functionality and Order Management
-- Run this script in your Supabase SQL editor

-- 1. Ensure orders table has proper structure
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_status VARCHAR(50) DEFAULT 'not_shipped',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_reference VARCHAR(255),
    shipping_address TEXT, -- Can store encrypted JSON
    metadata JSONB, -- Store additional order data
    admin_notes TEXT, -- For admin to add notes about the order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create order_status_history table for audit trail
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ensure encrypted_addresses table exists (for the frontend encryption service)
CREATE TABLE IF NOT EXISTS encrypted_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_data TEXT NOT NULL, -- Base64 encoded encrypted address
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure profiles table has admin flag
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_addresses_user_id ON encrypted_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_addresses_default ON encrypted_addresses(user_id, is_default);

-- 6. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_encrypted_addresses_updated_at ON encrypted_addresses;
CREATE TRIGGER update_encrypted_addresses_updated_at 
    BEFORE UPDATE ON encrypted_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this address as default, unset all other defaults for this user
    IF NEW.is_default = TRUE THEN
        UPDATE encrypted_addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id 
        AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON encrypted_addresses;
CREATE TRIGGER ensure_single_default_address_trigger
    BEFORE INSERT OR UPDATE ON encrypted_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();

-- 9. RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_addresses ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "System can insert orders" ON orders
    FOR INSERT WITH CHECK (TRUE);

-- Order status history policies
CREATE POLICY "Admins can view order status history" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can insert order status history" ON order_status_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

-- Encrypted addresses policies
CREATE POLICY "Users can manage their own encrypted addresses" ON encrypted_addresses
    FOR ALL USING (auth.uid() = user_id);

-- 10. Create admin user function (run this manually for the first admin)
/*
-- To make a user admin, run this with their email:
-- SELECT make_user_admin('admin@example.com');

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
        -- Create or update profile with admin flag
        INSERT INTO profiles (id, email, is_admin)
        VALUES (user_id, user_email, TRUE)
        ON CONFLICT (id) 
        DO UPDATE SET is_admin = TRUE;
        
        RAISE NOTICE 'User % is now an admin', user_email;
    ELSE
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE orders IS 'Main orders table with encrypted shipping addresses';
COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';
COMMENT ON TABLE encrypted_addresses IS 'Encrypted user addresses for secure storage';
COMMENT ON COLUMN orders.shipping_address IS 'Encrypted JSON containing shipping address';
COMMENT ON COLUMN orders.metadata IS 'Additional order data including cart items and custom labels';
COMMENT ON COLUMN orders.admin_notes IS 'Notes added by admin users for internal tracking';
COMMENT ON COLUMN encrypted_addresses.encrypted_data IS 'Base64 encoded XOR encrypted address data';
