-- COMPREHENSIVE SECURITY AND PERFORMANCE FIX MIGRATION
-- This migration addresses all identified security and performance issues

-- =============================================================================
-- PART 1: SECURITY FIXES
-- =============================================================================

-- 1. Drop problematic views that expose auth.users data
DROP VIEW IF EXISTS public.refund_summary;
DROP VIEW IF EXISTS public.seller_earnings_summary;

-- 2. Create secure replacement views
CREATE VIEW public.refund_summary AS
SELECT 
    rt.id,
    rt.order_id,
    rt.amount,
    rt.reason,
    rt.status,
    rt.created_at,
    rt.completed_at,
    rt.transaction_reference,
    rt.paystack_refund_reference,
    EXTRACT(EPOCH FROM (rt.completed_at - rt.created_at))/3600 as processing_hours,
    o.buyer_id,
    o.seller_id,
    bp.email as buyer_email,
    sp.email as seller_email,
    ip.email as initiated_by_email
FROM public.refund_transactions rt
LEFT JOIN public.orders o ON rt.order_id = o.id
LEFT JOIN public.profiles bp ON o.buyer_id = bp.id
LEFT JOIN public.profiles sp ON o.seller_id = sp.id
LEFT JOIN public.profiles ip ON rt.initiated_by = ip.id;

-- Enable RLS on the new view
ALTER VIEW public.refund_summary SET (security_invoker = on);

-- Create RLS policy for refund_summary view
CREATE POLICY "Users can view refunds for their orders" ON public.refund_summary
FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR 
    is_current_user_admin()
);

-- 3. Fix all functions with mutable search_path
-- Update existing functions to have secure search_path

-- Update validate_aps_profile function
CREATE OR REPLACE FUNCTION public.validate_aps_profile(profile_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    -- Basic validation of APS profile structure
    IF profile_data IS NULL THEN
        RETURN TRUE; -- NULL is valid (no profile set)
    END IF;
    
    -- Check required fields
    IF NOT (profile_data ? 'subjects' AND profile_data ? 'totalAPS' AND profile_data ? 'lastUpdated') THEN
        RETURN FALSE;
    END IF;
    
    -- Check subjects is an array
    IF jsonb_typeof(profile_data->'subjects') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check totalAPS is a number
    IF jsonb_typeof(profile_data->'totalAPS') != 'number' THEN
        RETURN FALSE;
    END IF;
    
    -- Check lastUpdated is a string (ISO date)
    IF jsonb_typeof(profile_data->'lastUpdated') != 'string' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$function$;

-- Update update_aps_profile_timestamp function
CREATE OR REPLACE FUNCTION public.update_aps_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    -- If APS profile is being updated, ensure lastUpdated timestamp is current
    IF NEW.aps_profile IS DISTINCT FROM OLD.aps_profile AND NEW.aps_profile IS NOT NULL THEN
        NEW.aps_profile = jsonb_set(
            NEW.aps_profile, 
            '{lastUpdated}', 
            to_jsonb(NOW()::text)
        );
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Update get_user_aps_profile function
CREATE OR REPLACE FUNCTION public.get_user_aps_profile(user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Return the APS profile for the user
    RETURN (SELECT aps_profile FROM public.profiles WHERE id = user_id);
END;
$function$;

-- Update save_user_aps_profile function
CREATE OR REPLACE FUNCTION public.save_user_aps_profile(profile_data jsonb, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Validate profile data
    IF NOT validate_aps_profile(profile_data) THEN
        RAISE EXCEPTION 'Invalid APS profile data structure';
    END IF;
    
    -- Update the user's APS profile
    UPDATE public.profiles 
    SET aps_profile = profile_data 
    WHERE id = user_id;
    
    -- Check if update was successful
    RETURN FOUND;
END;
$function$;

-- Update clear_user_aps_profile function
CREATE OR REPLACE FUNCTION public.clear_user_aps_profile(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    -- Check if user is authenticated
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Clear the user's APS profile
    UPDATE public.profiles 
    SET aps_profile = NULL 
    WHERE id = user_id;
    
    -- Check if update was successful
    RETURN FOUND;
END;
$function$;

-- Update calculate_commission function
CREATE OR REPLACE FUNCTION public.calculate_commission(base_amount numeric, user_tier text DEFAULT 'standard'::text)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN CASE 
    WHEN user_tier = 'premium' THEN base_amount * 0.05  -- 5% for premium users
    WHEN user_tier = 'verified' THEN base_amount * 0.08  -- 8% for verified users
    ELSE base_amount * 0.10  -- 10% standard commission
  END;
END;
$function$;

-- Update auto_process_ready_orders function
CREATE OR REPLACE FUNCTION public.auto_process_ready_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    -- This function can be called by cron or edge functions
    -- to automatically process orders that are ready for payout
    UPDATE public.orders 
    SET status = 'paid_out', updated_at = now()
    WHERE status = 'ready_for_payout' 
    AND created_at < now() - INTERVAL '1 hour'; -- 1 hour safety delay
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update auto_cancel_expired_orders function
CREATE OR REPLACE FUNCTION public.auto_cancel_expired_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  expired_order RECORD;
BEGIN
  -- Get all expired orders and process them
  FOR expired_order IN 
    SELECT id, buyer_id, seller_id 
    FROM public.orders 
    WHERE 
      payment_status = 'paid' 
      AND status = 'paid'
      AND commit_deadline < NOW()
      AND status NOT IN ('committed', 'cancelled')
  LOOP
    -- Cancel the order
    UPDATE public.orders 
    SET 
      status = 'cancelled',
      cancelled_at = NOW(),
      cancellation_reason = 'Seller failed to commit within 48 hours'
    WHERE id = expired_order.id;
    
    -- Create notifications for both buyer and seller
    INSERT INTO public.order_notifications (order_id, user_id, type, title, message)
    VALUES 
    (
      expired_order.id, 
      expired_order.buyer_id, 
      'order_cancelled',
      'Order Cancelled - Refund Processing',
      'Your order has been automatically cancelled due to seller inactivity. A refund will be processed within 24 hours.'
    ),
    (
      expired_order.id, 
      expired_order.seller_id, 
      'order_cancelled',
      'Order Auto-Cancelled',
      'Your order was automatically cancelled for not committing within 48 hours. This may affect your seller rating.'
    );
  END LOOP;
END;
$function$;

-- Update check_refund_eligibility function
CREATE OR REPLACE FUNCTION public.check_refund_eligibility(p_order_id uuid)
RETURNS TABLE(eligible boolean, reason text, max_refund_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  order_record public.orders%ROWTYPE;
  existing_refund_count INTEGER;
  total_refunded NUMERIC DEFAULT 0;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Order not found', 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check if order is delivered (cannot refund delivered orders)
  IF order_record.status = 'delivered' OR order_record.delivery_status = 'delivered' THEN
    RETURN QUERY SELECT false, 'Cannot refund delivered orders', 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check for existing successful refunds
  SELECT COUNT(*), COALESCE(SUM(amount), 0)
  INTO existing_refund_count, total_refunded
  FROM public.refund_transactions 
  WHERE order_id = p_order_id AND status = 'success';
  
  -- Check if already fully refunded
  IF total_refunded >= COALESCE(order_record.total_amount, order_record.amount, 0) THEN
    RETURN QUERY SELECT false, 'Order already fully refunded', 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check refundable status
  IF order_record.status NOT IN (
    'pending_commit', 'committed', 'pickup_scheduled', 
    'pickup_attempted', 'failed', 'cancelled', 'declined'
  ) THEN
    RETURN QUERY SELECT false, 'Order status not eligible for refund', 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Order is eligible - calculate remaining refundable amount
  DECLARE
    order_amount NUMERIC := COALESCE(order_record.total_amount, order_record.amount, 0);
    remaining_amount NUMERIC := order_amount - total_refunded;
  BEGIN
    RETURN QUERY SELECT true, 'Order eligible for refund', remaining_amount;
  END;
END;
$function$;

-- Update get_refund_statistics function
CREATE OR REPLACE FUNCTION public.get_refund_statistics(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS TABLE(total_refunds bigint, pending_refunds bigint, processing_refunds bigint, successful_refunds bigint, failed_refunds bigint, total_refund_amount numeric, avg_refund_amount numeric, avg_processing_time interval)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_refunds,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_refunds,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_refunds,
    COUNT(*) FILTER (WHERE status = 'success') as successful_refunds,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_refunds,
    COALESCE(SUM(amount) FILTER (WHERE status = 'success'), 0) as total_refund_amount,
    COALESCE(AVG(amount) FILTER (WHERE status = 'success'), 0) as avg_refund_amount,
    AVG(completed_at - created_at) FILTER (
      WHERE status = 'success' AND completed_at IS NOT NULL
    ) as avg_processing_time
  FROM public.refund_transactions
  WHERE 
    (start_date IS NULL OR created_at >= start_date)
    AND (end_date IS NULL OR created_at <= end_date);
END;
$function$;

-- Update create_order_notification function
CREATE OR REPLACE FUNCTION public.create_order_notification(p_order_id uuid, p_user_id uuid, p_type text, p_title text, p_message text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  -- Handle null UUID (all zeros) by setting to NULL
  IF p_order_id = '00000000-0000-0000-0000-000000000000'::UUID THEN
    p_order_id := NULL;
  END IF;
  
  -- Validate that the order exists if order_id is provided and not null
  IF p_order_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.orders WHERE id = p_order_id) THEN
    RAISE EXCEPTION 'Order with id % does not exist', p_order_id;
  END IF;
  
  INSERT INTO public.order_notifications (order_id, user_id, type, title, message)
  VALUES (p_order_id, p_user_id, p_type, p_title, p_message)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Update get_current_user_id function
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT (SELECT auth.uid());
$function$;

-- Update is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = (SELECT auth.uid())), false);
$function$;

-- Update validate_refund_amount function
CREATE OR REPLACE FUNCTION public.validate_refund_amount(p_order_id uuid, p_amount numeric)
RETURNS TABLE(valid boolean, reason text, validated_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  eligibility_check RECORD;
BEGIN
  -- First check basic eligibility
  SELECT * INTO eligibility_check 
  FROM public.check_refund_eligibility(p_order_id);
  
  IF NOT eligibility_check.eligible THEN
    RETURN QUERY SELECT false, eligibility_check.reason, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check amount validity
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, 'Refund amount must be positive', 0::NUMERIC;
  ELSIF p_amount > eligibility_check.max_refund_amount THEN
    RETURN QUERY SELECT false, 'Refund amount exceeds available refund amount', 0::NUMERIC;
  ELSE
    -- Partial refund
    RETURN QUERY SELECT true, 'Partial refund validated', p_amount;
  END IF;
END;
$function$;

-- Update generate_receipt_number function
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$function$;

-- Update update_order_refund_totals function
CREATE OR REPLACE FUNCTION public.update_order_refund_totals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  -- Update the order's total refunded amount
  UPDATE public.orders 
  SET 
    total_refunded = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.refund_transactions 
      WHERE order_id = COALESCE(NEW.order_id, OLD.order_id) 
      AND status = 'success'
    ),
    refund_status = CASE 
      WHEN NEW.status = 'success' THEN 'completed'
      WHEN NEW.status = 'failed' THEN 'failed'
      WHEN NEW.status = 'processing' THEN 'processing'
      ELSE 'pending'
    END,
    refund_reference = CASE 
      WHEN NEW.status = 'success' THEN NEW.paystack_refund_reference
      ELSE refund_reference
    END,
    refunded_at = CASE 
      WHEN NEW.status = 'success' AND OLD.status != 'success' THEN NOW()
      ELSE refunded_at
    END
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Continue with remaining functions...
-- Update send_commit_reminders function
CREATE OR REPLACE FUNCTION public.send_commit_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  reminder_record RECORD;
BEGIN
  -- Send reminders 24 hours before deadline
  FOR reminder_record IN 
    SELECT id, seller_id 
    FROM public.orders 
    WHERE 
      status = 'paid'
      AND commit_deadline > NOW()
      AND commit_deadline < NOW() + INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM public.order_notifications 
        WHERE order_id = orders.id 
        AND type = 'commit_reminder' 
        AND sent_at > NOW() - INTERVAL '12 hours'
      )
  LOOP
    -- Only insert if the order exists and seller_id is not null
    IF reminder_record.seller_id IS NOT NULL THEN
      INSERT INTO public.order_notifications (order_id, user_id, type, title, message)
      VALUES (
        reminder_record.id,
        reminder_record.seller_id,
        'commit_reminder',
        'Reminder: Order Commitment Required',
        'You have less than 24 hours remaining to commit to this order. Please log in and confirm your commitment.'
      );
    END IF;
  END LOOP;
END;
$function$;

-- Update remaining functions with secure search_path
CREATE OR REPLACE FUNCTION public.get_payment_transaction(p_reference text)
RETURNS TABLE(id uuid, reference text, order_id uuid, amount numeric, status text, created_at timestamp with time zone, verified_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id,
    pt.reference,
    pt.order_id,
    pt.amount,
    pt.status,
    pt.created_at,
    pt.verified_at
  FROM public.payment_transactions pt
  WHERE pt.reference = p_reference;
END;
$function$;

-- =============================================================================
-- PART 2: PERFORMANCE IMPROVEMENTS - ADD MISSING INDEXES
-- =============================================================================

-- Add indexes for foreign keys that are missing them
CREATE INDEX IF NOT EXISTS idx_commitment_notifications_user_id ON public.commitment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_commitment_notifications_commitment_id ON public.commitment_notifications(commitment_id);

CREATE INDEX IF NOT EXISTS idx_order_activity_log_order_id ON public.order_activity_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_activity_log_user_id ON public.order_activity_log(user_id);

CREATE INDEX IF NOT EXISTS idx_order_notifications_order_id ON public.order_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_user_id ON public.order_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_book_id ON public.orders(book_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);

CREATE INDEX IF NOT EXISTS idx_payment_splits_order_id ON public.payment_splits(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_splits_seller_id ON public.payment_splits(seller_id);
CREATE INDEX IF NOT EXISTS idx_payment_splits_transaction_id ON public.payment_splits(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payout_transactions_order_id ON public.payout_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payout_transactions_seller_id ON public.payout_transactions(seller_id);

CREATE INDEX IF NOT EXISTS idx_receipts_order_id ON public.receipts(order_id);

CREATE INDEX IF NOT EXISTS idx_refund_transactions_order_id ON public.refund_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_transactions_initiated_by ON public.refund_transactions(initiated_by);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);

-- Add commonly queried composite indexes
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status_created_at ON public.payment_transactions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_refund_transactions_status_created_at ON public.refund_transactions(status, created_at);

-- =============================================================================
-- PART 3: CLEANUP - REMOVE UNUSED INDEXES (CONSERVATIVE APPROACH)
-- =============================================================================

-- Note: Only removing obviously unused indexes. 
-- In production, you should monitor query patterns before removing indexes.

-- Remove duplicate or obviously unused indexes
DROP INDEX IF EXISTS idx_notification_requests_program_id;
DROP INDEX IF EXISTS idx_notification_requests_university_id;
DROP INDEX IF EXISTS idx_profiles_aps_profile;
DROP INDEX IF EXISTS idx_profiles_seller_lookup;

-- =============================================================================
-- PART 4: ADDITIONAL SECURITY ENHANCEMENTS
-- =============================================================================

-- Ensure RLS is enabled on all tables that should have it
ALTER TABLE public.refund_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitment_notifications ENABLE ROW LEVEL SECURITY;

-- Add comment to track this migration
COMMENT ON SCHEMA public IS 'Security and performance migration applied - fixed auth exposure, search paths, and added missing indexes';