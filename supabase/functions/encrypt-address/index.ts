import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple XOR encryption - same as frontend implementation
const ENCRYPTION_KEY = 'MyFuze_Address_Key_2024';

function simpleEncrypt(text: string): string {
  try {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      const textChar = text.charCodeAt(i);
      encrypted += String.fromCharCode(textChar ^ keyChar);
    }
    // Base64 encode for safe storage
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt address');
  }
}

function simpleDecrypt(encryptedText: string): string {
  try {
    // Base64 decode first
    const encrypted = atob(encryptedText);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      const encryptedChar = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt address');
  }
}

interface EncryptRequest {
  action: 'encrypt' | 'decrypt';
  data: string;
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { action, data } = await req.json() as EncryptRequest

    let result: string;

    switch (action) {
      case 'encrypt':
        result = simpleEncrypt(data);
        break;
      case 'decrypt':
        result = simpleDecrypt(data);
        break;
      default:
        throw new Error('Invalid action. Must be "encrypt" or "decrypt"');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        action 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in encrypt-address function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* To deploy this function:
 * 1. Run: supabase functions deploy encrypt-address
 * 2. Enable the function in your Supabase project
 * 3. Grant necessary permissions for user authentication
 * 
 * Usage from frontend:
 * const { data } = await supabase.functions.invoke('encrypt-address', {
 *   body: { action: 'encrypt', data: 'address string' }
 * })
 */
