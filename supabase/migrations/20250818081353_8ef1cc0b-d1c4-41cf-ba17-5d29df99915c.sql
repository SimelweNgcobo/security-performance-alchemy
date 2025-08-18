-- Just add the admin user to the admin_users table
-- They will sign up with the email/password through the app
INSERT INTO admin_users (
  user_id,
  role,
  is_active,
  permissions
) VALUES (
  NULL, -- Will be set when user signs up
  'super_admin',
  false, -- Will be activated when user signs up
  '{
    "orders": ["read", "write", "delete"],
    "products": ["read", "write", "delete"],
    "customers": ["read", "write"],
    "delivery": ["read", "write"],
    "reports": ["read"],
    "admin_users": ["read", "write"],
    "settings": ["read", "write"]
  }'::jsonb
) ON CONFLICT DO NOTHING;