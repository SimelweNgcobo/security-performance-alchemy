-- Create user_addresses table for storing user shipping addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    phone VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(user_id, is_default) WHERE is_default = true;

-- Add RLS (Row Level Security) policies for user_addresses
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own addresses
CREATE POLICY "Users can view own addresses" ON user_addresses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own addresses
CREATE POLICY "Users can insert own addresses" ON user_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own addresses
CREATE POLICY "Users can update own addresses" ON user_addresses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own addresses
CREATE POLICY "Users can delete own addresses" ON user_addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Admin users can view all addresses
CREATE POLICY "Admins can view all addresses" ON user_addresses
    FOR SELECT USING (is_admin());

-- Add missing fields to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create index for user_id on orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Update RLS policies for orders to include user_id access
DROP POLICY IF EXISTS "Users can view own orders by user_id" ON orders;
CREATE POLICY "Users can view own orders by user_id" ON orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders by user_id" ON orders;
CREATE POLICY "Users can create orders by user_id" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        -- Unset other default addresses for this user
        UPDATE user_addresses 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for single default address
DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON user_addresses;
CREATE TRIGGER trigger_ensure_single_default_address
    BEFORE INSERT OR UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();

-- Update timestamps function for user_addresses
CREATE OR REPLACE FUNCTION update_user_addresses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS trigger_update_user_addresses_timestamp ON user_addresses;
CREATE TRIGGER trigger_update_user_addresses_timestamp
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_user_addresses_timestamp();

-- Create or update handle_new_user function to also create customer_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create customer record when new user signs up (if not exists)
  INSERT INTO customers (
    user_id, 
    email, 
    name, 
    phone
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, customers.name),
    phone = COALESCE(EXCLUDED.phone, customers.phone),
    updated_at = NOW();

  -- Create customer profile record
  INSERT INTO customer_profiles (
    user_id,
    full_name,
    phone
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, customer_profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, customer_profiles.phone),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating customer/profile record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();