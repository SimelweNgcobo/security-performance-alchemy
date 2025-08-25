# Edge Functions Deployment Guide

## Required Edge Functions

Your website requires these Supabase Edge Functions to be deployed:

### 1. Paystack Webhook Function (CRITICAL)
**File:** `supabase/functions/paystack-webhook/index.ts`
**Required for:** Payment processing, order creation
**Deploy command:**
```bash
supabase functions deploy paystack-webhook
```

**Required Environment Variables:**
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 2. Send Quote Email Function
**File:** `supabase/functions/send-quote-email/index.ts`
**Required for:** Enterprise quote emails
**Deploy command:**
```bash
supabase functions deploy send-quote-email
```

**Required Environment Variables:**
- `RESEND_API_KEY` - Your Resend email service API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 3. Manage Orders Function
**File:** `supabase/functions/manage-orders/index.ts`
**Required for:** Admin order management
**Deploy command:**
```bash
supabase functions deploy manage-orders
```

**Required Environment Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

## Setting Environment Variables

In your Supabase dashboard:
1. Go to Settings > Edge Functions
2. Click on each function
3. Add the required environment variables

## Testing Edge Functions

After deployment, test each function:

### Test Paystack Webhook:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/paystack-webhook \
  -H "Content-Type: application/json" \
  -d '{"action": "verify-and-create-order", "paymentReference": "test"}'
```

### Test Send Quote Email:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-quote-email \
  -H "Content-Type: application/json" \
  -d '{"requestId": "test-id"}'
```

### Test Manage Orders:
```bash
curl -X GET https://your-project.supabase.co/functions/v1/manage-orders \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```
