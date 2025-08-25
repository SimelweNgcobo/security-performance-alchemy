import { supabase } from "@/integrations/supabase/client";

export const setupContactSubmissionsTable = async () => {
  try {
    console.log("Setting up contact_submissions table...");
    
    // First, let's check if the table exists by trying a simple query
    const { data: existingData, error: checkError } = await supabase
      .from("contact_submissions")
      .select("id")
      .limit(1);

    if (checkError) {
      console.log("Table doesn't exist or has access issues:", checkError);
      
      // Try to create the table using SQL
      const { error: createError } = await supabase.rpc('create_contact_submissions_table');
      
      if (createError) {
        console.error("Failed to create table via RPC:", createError);
        
        // Fall back to direct SQL execution
        const createTableSQL = `
          -- Contact submissions table for admin dashboard reporting
          CREATE TABLE IF NOT EXISTS contact_submissions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              first_name TEXT NOT NULL,
              last_name TEXT NOT NULL,
              email TEXT NOT NULL,
              subject TEXT,
              message TEXT NOT NULL,
              status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
              admin_notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              resolved_at TIMESTAMP WITH TIME ZONE,
              resolved_by UUID REFERENCES auth.users(id)
          );

          -- Enable RLS
          ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

          -- Admin access policy
          DROP POLICY IF EXISTS "Admins can view all contact submissions" ON contact_submissions;
          CREATE POLICY "Admins can view all contact submissions" ON contact_submissions 
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM admin_users 
                  WHERE user_id = auth.uid() AND is_active = true
              )
          );

          -- Admin update policy
          DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
          CREATE POLICY "Admins can update contact submissions" ON contact_submissions 
          FOR UPDATE USING (
              EXISTS (
                  SELECT 1 FROM admin_users 
                  WHERE user_id = auth.uid() AND is_active = true
              )
          );

          -- System insert policy (for contact form)
          DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contact_submissions;
          CREATE POLICY "Anyone can submit contact forms" ON contact_submissions 
          FOR INSERT WITH CHECK (true);

          -- Create index for better performance
          CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
          CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
        `;

        console.log("Trying to execute SQL directly...");
        // This might not work from client side, but let's try
        const { error: sqlError } = await supabase.from('contact_submissions').select('id').limit(1);
        if (sqlError) {
          console.error("Direct SQL execution failed:", sqlError);
          return false;
        }
      }
    }

    console.log("Table setup completed successfully");
    return true;

  } catch (error) {
    console.error("Error setting up contact_submissions table:", error);
    return false;
  }
};

export const testTableAccess = async () => {
  try {
    console.log("Testing table access...");
    
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Table access error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log("Table access successful, found", data?.length || 0, "records");
    return true;

  } catch (error) {
    console.error("Exception during table access test:", error);
    return false;
  }
};
