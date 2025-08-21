import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuoteEmailData {
  enterpriseRequestId: string;
  userEmail: string;
  companyName: string;
  requirements?: string;
  designs?: any[];
}

class EmailService {
  async sendQuoteEmail(data: QuoteEmailData): Promise<boolean> {
    try {
      console.log('Sending quote email for:', data.companyName);

      // Call the Supabase Edge Function
      const { data: response, error } = await supabase.functions.invoke('send-quote-email', {
        body: data
      });

      if (error) {
        console.error('Error calling email function:', error);
        toast.error('Failed to send confirmation email');
        return false;
      }

      if (response.success) {
        console.log('Email sent successfully:', response.message);
        toast.success('Confirmation email sent successfully!');
        return true;
      } else {
        console.error('Email function returned error:', response.error);
        toast.error('Failed to send confirmation email');
        return false;
      }
    } catch (error) {
      console.error('Error in email service:', error);
      
      // Don't show error to user as the request was still submitted
      // Just log it for debugging
      console.log('Email automation failed, but request was saved successfully');
      return false;
    }
  }

  // Trigger email automation when enterprise request is created
  async triggerQuoteEmailAutomation(enterpriseRequestId: string): Promise<void> {
    try {
      // Get the enterprise request details
      const { data: request, error } = await supabase
        .from('enterprise_requests')
        .select('*')
        .eq('id', enterpriseRequestId)
        .single();

      if (error || !request) {
        console.error('Failed to fetch enterprise request for email:', error);
        return;
      }

      // Send the email
      const emailData: QuoteEmailData = {
        enterpriseRequestId: request.id,
        userEmail: request.contact_email,
        companyName: request.company_name,
        requirements: request.requirements,
        designs: Array.isArray(request.designs) ? request.designs : []
      };

      await this.sendQuoteEmail(emailData);
    } catch (error) {
      console.error('Error in email automation trigger:', error);
    }
  }

  // Send email to admin about new enterprise request
  async notifyAdminNewRequest(enterpriseRequestId: string): Promise<void> {
    try {
      // Get admin email from company settings or use default
      const adminEmail = 'admin@myfuze.co.za'; // This could be fetched from settings

      const { data: request } = await supabase
        .from('enterprise_requests')
        .select('*')
        .eq('id', enterpriseRequestId)
        .single();

      if (request) {
        console.log('Admin notification would be sent for request:', request.id);
        // In a real implementation, you'd send an admin notification email here
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }
}

export const emailService = new EmailService();
