# Complete Website Setup Checklist

## ✅ Demo Data Removal (COMPLETED)
- [x] Removed mock enterprise requests from admin component
- [x] Removed demo orders from Profile page
- [x] Removed demo order tracking initialization
- [x] Removed test credentials from admin auth page
- [x] Removed test user creation functions
- [x] Removed sample data from SQL migration files
- [x] Updated company settings to remove test API keys

## 🗄️ Database Setup (RUN THESE SQL STATEMENTS)

### Step 1: Run Missing SQL
Copy and paste the contents of `MISSING_SQL_COMPLETE.sql` into your Supabase SQL Editor and execute.

This will create:
- ✅ `contact_submissions` table
- ✅ `profiles` table  
- ✅ `order_status_history` table
- ✅ `system_settings` table
- ✅ `email_queue` table
- ✅ Missing columns in `orders` table
- ✅ All required RPC functions
- ✅ Row Level Security policies
- ✅ Database triggers
- ✅ Performance indexes

### Step 2: Deploy Edge Functions
Follow the instructions in `DEPLOY_EDGE_FUNCTIONS.md` to deploy:
- ✅ `paystack-webhook` function
- ✅ `send-quote-email` function  
- ✅ `manage-orders` function

### Step 3: Regenerate TypeScript Types
After applying SQL changes, regenerate your Supabase types:
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## 🔧 Configuration Updates Needed

### Environment Variables
Update these in your production environment:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `PAYSTACK_PUBLIC_KEY` - Your production Paystack public key
- `PAYSTACK_SECRET_KEY` - Your production Paystack secret key (Edge Function env var)
- `RESEND_API_KEY` - Your Resend email API key (Edge Function env var)

### Company Settings
Update the company settings in your database via admin panel or SQL:
- Company name
- Company email  
- Company phone
- Company address
- Email from address
- Email from name

### Admin User Setup
Create your first admin user:
```sql
-- Replace with your actual email
SELECT make_user_admin('your-admin-email@company.com');
```

## 🧪 Testing Checklist

After setup, test these key features:

### Frontend Features
- [ ] Contact form submission (should appear in admin dashboard)
- [ ] User registration and login
- [ ] Product browsing
- [ ] Order placement and payment
- [ ] User profile management
- [ ] Order history viewing

### Admin Features  
- [ ] Admin login with your admin email
- [ ] Orders management (view, update status)
- [ ] Contact reports (view submissions)
- [ ] Products management (add, edit, delete)
- [ ] Customers management (view customer data)
- [ ] Enterprise requests (view requests)
- [ ] User labels management
- [ ] Delivery management

### Payment Flow
- [ ] Bulk checkout process
- [ ] Paystack payment integration
- [ ] Order creation after payment
- [ ] Payment webhooks handling
- [ ] Order status updates

## 🚨 Security Notes

### Removed Demo/Test Data
All demo data has been removed including:
- Mock enterprise requests
- Demo orders and customers
- Test user credentials
- Sample products with hardcoded data
- Test API keys and credentials

### Production Security
- [ ] Update all API keys to production values
- [ ] Ensure database RLS policies are properly configured
- [ ] Test admin access controls
- [ ] Verify edge function environment variables are set
- [ ] Update company contact information

## 🎯 Post-Setup Actions

1. **Add Real Products:** Use the admin panel to add your actual products
2. **Configure Payment:** Update Paystack keys for production
3. **Test Email:** Verify email sending works with Resend
4. **Set Company Info:** Update company settings via admin panel
5. **Monitor Logs:** Check Supabase logs for any errors

## ❗ If You Encounter Issues

1. **Orders not appearing:** Check if `create_order_with_tracking` function exists
2. **Contact form errors:** Verify `contact_submissions` table was created
3. **Payment failures:** Check Paystack webhook is deployed and configured
4. **Admin access issues:** Ensure your email is in `admin_users` table
5. **Type errors:** Regenerate TypeScript types after SQL changes

All demo data has been removed and the database structure is now ready for production use!
