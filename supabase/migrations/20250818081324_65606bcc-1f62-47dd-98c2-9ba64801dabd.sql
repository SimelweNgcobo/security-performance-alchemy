-- Create the specific admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'mq.ngcobo@myfuze.co.za',
  crypt('MQ1973', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create admin_users entry for this user
INSERT INTO admin_users (
  user_id,
  role,
  is_active,
  permissions
)
SELECT 
  auth.users.id,
  'super_admin',
  true,
  '{
    "orders": ["read", "write", "delete"],
    "products": ["read", "write", "delete"],
    "customers": ["read", "write"],
    "delivery": ["read", "write"],
    "reports": ["read"],
    "admin_users": ["read", "write"],
    "settings": ["read", "write"]
  }'::jsonb
FROM auth.users 
WHERE email = 'mq.ngcobo@myfuze.co.za'
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  permissions = EXCLUDED.permissions;