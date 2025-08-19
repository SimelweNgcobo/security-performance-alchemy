import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  enterpriseRequestId: string;
  userEmail: string;
  companyName: string;
  requirements?: string;
  designs?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { enterpriseRequestId, userEmail, companyName, requirements, designs } = await req.json() as EmailRequest

    // Get the enterprise request details
    const { data: enterpriseRequest, error: enterpriseError } = await supabase
      .from('enterprise_requests')
      .select('*')
      .eq('id', enterpriseRequestId)
      .single()

    if (enterpriseError) {
      throw new Error(`Failed to fetch enterprise request: ${enterpriseError.message}`)
    }

    // Prepare email content
    const emailSubject = `Quote Request Received - ${companyName}`
    const emailHtml = generateEmailTemplate({
      companyName,
      requirements: requirements || enterpriseRequest.requirements,
      designs: designs || enterpriseRequest.designs,
      requestId: enterpriseRequestId,
      contactEmail: userEmail
    })

    // Send email using Resend (you can also use SendGrid, Mailgun, etc.)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('Resend API key not found, simulating email send...')
      
      // Log email details for development
      console.log('Email would be sent to:', userEmail)
      console.log('Subject:', emailSubject)
      console.log('HTML content length:', emailHtml.length)
      
      // Update enterprise request with email sent status
      await supabase
        .from('enterprise_requests')
        .update({ 
          status: 'email_sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', enterpriseRequestId)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email simulated successfully (development mode)',
          emailData: {
            to: userEmail,
            subject: emailSubject,
            html: emailHtml.substring(0, 200) + '...'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send actual email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MyFuze <noreply@myfuze.co.za>',
        to: [userEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${emailResult.message || 'Unknown error'}`)
    }

    // Update enterprise request with email sent status
    await supabase
      .from('enterprise_requests')
      .update({ 
        status: 'email_sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', enterpriseRequestId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-quote-email function:', error)
    
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

function generateEmailTemplate({ companyName, requirements, designs, requestId, contactEmail }: {
  companyName: string;
  requirements?: string;
  designs?: any[];
  requestId: string;
  contactEmail: string;
}) {
  const designsCount = designs?.length || 0;
  const hasRequirements = requirements && requirements.trim().length > 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote Request Received - MyFuze</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9fafb;
            }
            .container {
                background-color: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #1e40af;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 10px;
            }
            .tagline {
                color: #64748b;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .highlight {
                background-color: #f0f9ff;
                border-left: 4px solid #1e40af;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 4px 4px 0;
            }
            .details {
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
            }
            .details h3 {
                margin-top: 0;
                color: #1e40af;
            }
            .footer {
                text-align: center;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
                margin-top: 30px;
                color: #64748b;
                font-size: 14px;
            }
            .btn {
                display: inline-block;
                background-color: #1e40af;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 10px 0;
                font-weight: 500;
            }
            .status-badge {
                background-color: #10b981;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">MyFuze</div>
                <div class="tagline">Pure Water, Pure Quality</div>
            </div>

            <div class="content">
                <h1>Quote Request Received!</h1>
                
                <p>Dear ${companyName} team,</p>
                
                <p>Thank you for your interest in MyFuze enterprise water bottle solutions. We have received your quote request and our team is excited to work with you.</p>

                <div class="highlight">
                    <strong>We will get in touch with you soon regarding the prices.</strong>
                </div>

                <div class="details">
                    <h3>Request Details</h3>
                    <p><strong>Company:</strong> ${companyName}</p>
                    <p><strong>Contact Email:</strong> ${contactEmail}</p>
                    <p><strong>Request ID:</strong> ${requestId}</p>
                    <p><strong>Status:</strong> <span class="status-badge">Received</span></p>
                    ${designsCount > 0 ? `<p><strong>Custom Designs:</strong> ${designsCount} design${designsCount > 1 ? 's' : ''} attached</p>` : ''}
                </div>

                ${hasRequirements ? `
                <div class="details">
                    <h3>Your Requirements</h3>
                    <p>${requirements?.replace(/\n/g, '<br>')}</p>
                </div>
                ` : ''}

                <h3>What happens next?</h3>
                <ul>
                    <li><strong>Review:</strong> Our team will review your requirements and designs (if provided)</li>
                    <li><strong>Quote Preparation:</strong> We'll prepare a detailed quote with pricing and timeline</li>
                    <li><strong>Follow-up:</strong> You'll receive a personalized response within 24 hours</li>
                    <li><strong>Consultation:</strong> If needed, we'll schedule a call to discuss your specific needs</li>
                </ul>

                <h3>Why Choose MyFuze Enterprise?</h3>
                <ul>
                    <li>✓ Volume discounts for orders of 500+ bottles</li>
                    <li>✓ 2-3 week production time for custom orders</li>
                    <li>✓ Dedicated account manager for large projects</li>
                    <li>✓ Nationwide delivery with tracking</li>
                    <li>✓ Food-grade materials with high-resolution label printing</li>
                </ul>
            </div>

            <div class="footer">
                <p>Thank you for choosing MyFuze for your enterprise water bottle needs.</p>
                <p>
                    <strong>MyFuze Enterprise Team</strong><br>
                    Email: enterprise@myfuze.co.za<br>
                    Phone: +27 11 123 4567
                </p>
                <p>This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

/* To deploy this function:
 * 1. Run: supabase functions deploy send-quote-email
 * 2. Set environment variables in Supabase dashboard:
 *    - RESEND_API_KEY (optional, for actual email sending)
 * 3. Enable the function in your Supabase project
 */
