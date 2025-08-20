-- Create user_labels table for storing user custom label designs
CREATE TABLE IF NOT EXISTS user_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    design_data JSONB NOT NULL DEFAULT '{}',
    dimensions JSONB NOT NULL DEFAULT '{"width": 100, "height": 100}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_labels_user_id ON user_labels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_labels_is_default ON user_labels(user_id, is_default) WHERE is_default = true;

-- Add RLS (Row Level Security) policies for user_labels
ALTER TABLE user_labels ENABLE ROW LEVEL SECURITY;

-- Users can only see their own labels
CREATE POLICY "Users can view own labels" ON user_labels
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own labels
CREATE POLICY "Users can insert own labels" ON user_labels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own labels
CREATE POLICY "Users can update own labels" ON user_labels
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own labels
CREATE POLICY "Users can delete own labels" ON user_labels
    FOR DELETE USING (auth.uid() = user_id);

-- Admin users can view all labels
CREATE POLICY "Admins can view all labels" ON user_labels
    FOR SELECT USING (is_admin());

-- Function to ensure only one default label per user
CREATE OR REPLACE FUNCTION ensure_single_default_label()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        -- Unset other default labels for this user
        UPDATE user_labels 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for single default label
DROP TRIGGER IF EXISTS trigger_ensure_single_default_label ON user_labels;
CREATE TRIGGER trigger_ensure_single_default_label
    BEFORE INSERT OR UPDATE ON user_labels
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_label();

-- Update timestamps function for user_labels
CREATE OR REPLACE FUNCTION update_user_labels_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS trigger_update_user_labels_timestamp ON user_labels;
CREATE TRIGGER trigger_update_user_labels_timestamp
    BEFORE UPDATE ON user_labels
    FOR EACH ROW
    EXECUTE FUNCTION update_user_labels_timestamp();