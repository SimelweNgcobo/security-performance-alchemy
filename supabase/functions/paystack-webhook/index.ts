import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash, createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    status: string;
    gateway_response: string;
    paid_at?: string;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: any;
  };
}

interface CreateOrderRequest {
  paymentReference: string;
  orderData: any;
  cartItems: any[];
  shippingAddress: any;
  userEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method === 'POST') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');

      if (action === 'webhook') {
        // Paystack webhook verification
        const signature = req.headers.get('x-paystack-signature')
        const body = await req.text()
        
        if (!signature) {
          console.error('No signature provided')
          return new Response('Unauthorized', { status: 401 })
        }

        // Verify webhook signature
        const hash = createHmac("sha512", paystackSecretKey)
          .update(body)
          .digest('hex')

        if (hash !== signature) {
          console.error('Invalid signature')
          return new Response('Unauthorized', { status: 401 })
        }

        const payload: PaystackWebhookPayload = JSON.parse(body)
        
        console.log('Paystack webhook received:', payload.event, payload.data.reference)

        // Handle different webhook events
        switch (payload.event) {
          case 'charge.success':
            await handlePaymentSuccess(supabase, payload.data)
            break
          case 'charge.failed':
            await handlePaymentFailed(supabase, payload.data)
            break
          default:
            console.log('Unhandled webhook event:', payload.event)
        }

        return new Response('OK', { headers: corsHeaders })

      } else if (action === 'verify-and-create-order') {
        // Frontend calls this to verify payment and create order
        const createOrderData: CreateOrderRequest = await req.json()
        const result = await verifyPaymentAndCreateOrder(supabase, paystackSecretKey, createOrderData)
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      } else {
        return new Response('Invalid action', { status: 400, headers: corsHeaders })
      }

    } else {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

  } catch (error) {
    console.error('Error in paystack-webhook function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function verifyPaymentAndCreateOrder(
  supabase: any, 
  paystackSecretKey: string, 
  orderRequest: CreateOrderRequest
) {
  try {
    // 1. Verify payment with Paystack
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${orderRequest.paymentReference}`,
      {
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const verificationData = await verificationResponse.json()

    if (!verificationResponse.ok || verificationData.status !== true) {
      throw new Error('Payment verification failed')
    }

    const transactionData = verificationData.data

    // 2. Check if payment was actually successful
    if (transactionData.status !== 'success') {
      throw new Error(`Payment status is ${transactionData.status}, not success`)
    }

    // 3. Check if transaction already processed
    const { data: existingTransaction } = await supabase
      .from('payment_transactions')
      .select('id, order_id')
      .eq('transaction_id', transactionData.id.toString())
      .single()

    if (existingTransaction) {
      return {
        success: true,
        message: 'Order already exists',
        order_id: existingTransaction.order_id,
        duplicate: true
      }
    }

    // 4. Get user ID from email
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', orderRequest.userEmail)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    // 5. Create order using the stored function
    const orderItems = orderRequest.cartItems.map(item => ({
      product_id: null, // You'll need to map sizes to product IDs
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.subtotal,
      custom_branding_data: {
        hasCustomLabel: item.hasCustomLabel,
        labelId: item.labelId,
        labelName: item.labelName
      }
    }))

    // For bulk orders, create a special product entry or handle differently
    const orderDataForFunction = {
      ...orderRequest.orderData,
      payment_reference: orderRequest.paymentReference,
      shipping_address: JSON.stringify(orderRequest.shippingAddress),
      status: 'paid',
      payment_status: 'paid',
      delivery_status: 'processing',
      create_invoice: 'true'
    }

    // 6. Use the create_order_with_tracking function
    const { data: orderResult, error: orderError } = await supabase
      .rpc('create_order_with_tracking', {
        p_user_id: user.id,
        p_customer_id: user.id, // Assuming customer_id same as user_id
        p_order_data: orderDataForFunction,
        p_items: orderItems,
        p_payment_data: {
          transaction_id: transactionData.id.toString(),
          provider: 'paystack',
          amount: transactionData.amount / 100, // Paystack uses kobo
          verified_amount: transactionData.amount / 100
        }
      })

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw new Error('Failed to create order: ' + orderError.message)
    }

    // 7. Record payment transaction
    await supabase.rpc('process_payment', {
      p_order_id: orderResult.order_id,
      p_transaction_id: transactionData.id.toString(),
      p_provider: 'paystack',
      p_amount: transactionData.amount / 100,
      p_status: 'success',
      p_provider_response: transactionData
    })

    // 8. Queue confirmation email
    await supabase.rpc('queue_email', {
      p_to_email: orderRequest.userEmail,
      p_subject: `Order Confirmation - ${orderResult.order_number}`,
      p_template_id: 'order_confirmation',
      p_template_data: {
        order_number: orderResult.order_number,
        order_id: orderResult.order_id,
        amount: transactionData.amount / 100,
        customer_email: orderRequest.userEmail
      }
    })

    return {
      success: true,
      message: 'Order created successfully',
      order_id: orderResult.order_id,
      order_number: orderResult.order_number,
      transaction_verified: true
    }

  } catch (error) {
    console.error('Error in verifyPaymentAndCreateOrder:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function handlePaymentSuccess(supabase: any, paymentData: any) {
  try {
    console.log('Processing successful payment:', paymentData.reference)

    // Check if already processed
    const { data: existing } = await supabase
      .from('payment_transactions')
      .select('id')
      .eq('transaction_id', paymentData.id.toString())
      .single()

    if (existing) {
      console.log('Payment already processed:', paymentData.reference)
      return
    }

    // Find order by payment reference
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, total_amount')
      .eq('payment_reference', paymentData.reference)
      .single()

    if (order) {
      // Record payment and update order
      await supabase.rpc('process_payment', {
        p_order_id: order.id,
        p_transaction_id: paymentData.id.toString(),
        p_provider: 'paystack',
        p_amount: paymentData.amount / 100,
        p_status: 'success',
        p_provider_response: paymentData
      })

      console.log('Payment processed for order:', order.id)
    } else {
      console.log('Order not found for payment reference:', paymentData.reference)
    }

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(supabase: any, paymentData: any) {
  try {
    console.log('Processing failed payment:', paymentData.reference)

    // Find order by payment reference
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_reference', paymentData.reference)
      .single()

    if (order) {
      // Record failed payment
      await supabase
        .from('payment_transactions')
        .insert({
          order_id: order.id,
          transaction_id: paymentData.id.toString(),
          provider: 'paystack',
          amount: paymentData.amount / 100,
          status: 'failed',
          provider_response: paymentData
        })

      // Update order status
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order.id)

      console.log('Failed payment recorded for order:', order.id)
    }

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

/* 
DEPLOYMENT INSTRUCTIONS:

1. Deploy this function:
   supabase functions deploy paystack-webhook

2. Set environment variables in Supabase:
   - PAYSTACK_SECRET_KEY (your secret key from Paystack)
   - SUPABASE_URL (automatically available)
   - SUPABASE_SERVICE_ROLE_KEY (automatically available)

3. Configure Paystack webhook:
   - URL: https://your-project.supabase.co/functions/v1/paystack-webhook?action=webhook
   - Events: charge.success, charge.failed

4. Update frontend BulkCheckout.tsx to call:
   supabase.functions.invoke('paystack-webhook', {
     body: { 
       action: 'verify-and-create-order',
       paymentReference: reference.reference,
       orderData: {...},
       cartItems: [...],
       shippingAddress: {...},
       userEmail: user.email
     }
   })

5. Test thoroughly with Paystack test keys before going live!
*/
