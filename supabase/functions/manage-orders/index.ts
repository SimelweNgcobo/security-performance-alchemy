import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderUpdateRequest {
  orderId: string;
  status: 'processing' | 'in_transit' | 'delivered' | 'cancelled';
  adminNotes?: string;
}

interface OrdersListRequest {
  status?: string;
  limit?: number;
  offset?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user is authenticated and is admin
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      throw new Error('Admin access required')
    }

    const method = req.method;
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    switch (method) {
      case 'GET':
        // List orders
        const { status, limit = 50, offset = 0 } = Object.fromEntries(url.searchParams.entries()) as any;
        
        let query = supabase
          .from('orders')
          .select(`
            *,
            profiles:user_id (
              id,
              email,
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }

        const { data: orders, error: ordersError } = await query
          .range(offset, offset + limit - 1);

        if (ordersError) {
          throw new Error(`Failed to fetch orders: ${ordersError.message}`);
        }

        // Get order counts by status
        const { data: statusCounts } = await supabase
          .from('orders')
          .select('status')
          .then(({ data, error }) => {
            if (error) return { data: [] };
            const counts = data?.reduce((acc: any, order: any) => {
              acc[order.status] = (acc[order.status] || 0) + 1;
              return acc;
            }, {}) || {};
            return { data: counts };
          });

        return new Response(
          JSON.stringify({ 
            success: true, 
            orders,
            statusCounts,
            pagination: {
              offset,
              limit,
              hasMore: orders.length === limit
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'POST':
      case 'PUT':
        // Update order status
        const updateData = await req.json() as OrderUpdateRequest;
        const { orderId, status: newStatus, adminNotes } = updateData;

        if (!orderId || !newStatus) {
          throw new Error('Order ID and status are required');
        }

        // Validate status
        const validStatuses = ['processing', 'in_transit', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        // Update order
        const updateFields: any = {
          status: newStatus,
          updated_at: new Date().toISOString()
        };

        if (adminNotes) {
          updateFields.admin_notes = adminNotes;
        }

        // Set delivery status based on status
        if (newStatus === 'in_transit') {
          updateFields.delivery_status = 'shipped';
        } else if (newStatus === 'delivered') {
          updateFields.delivery_status = 'delivered';
        } else if (newStatus === 'cancelled') {
          updateFields.delivery_status = 'cancelled';
        }

        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update(updateFields)
          .eq('id', orderId)
          .select(`
            *,
            profiles:user_id (
              id,
              email,
              full_name
            )
          `)
          .single();

        if (updateError) {
          throw new Error(`Failed to update order: ${updateError.message}`);
        }

        // Log the status change
        await supabase
          .from('order_status_history')
          .insert({
            order_id: orderId,
            old_status: 'unknown', // We could fetch the old status if needed
            new_status: newStatus,
            changed_by: user.id,
            admin_notes: adminNotes,
            changed_at: new Date().toISOString()
          });

        return new Response(
          JSON.stringify({ 
            success: true, 
            order: updatedOrder,
            message: `Order ${orderId} status updated to ${newStatus}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Method not allowed');
    }

  } catch (error) {
    console.error('Error in manage-orders function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: error.message.includes('Unauthorized') || error.message.includes('Admin access') ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* To deploy this function:
 * 1. Run: supabase functions deploy manage-orders
 * 2. Enable the function in your Supabase project
 * 3. Make sure the following tables exist:
 *    - orders (with status column)
 *    - profiles (with is_admin column)
 *    - order_status_history (optional, for audit trail)
 * 
 * Usage from admin frontend:
 * // List orders
 * const { data } = await supabase.functions.invoke('manage-orders')
 * 
 * // Update order status
 * const { data } = await supabase.functions.invoke('manage-orders', {
 *   body: { orderId: '123', status: 'in_transit', adminNotes: 'Shipped via courier' }
 * })
 */
