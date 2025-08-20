import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addressEncryption, AddressData, EncryptedAddress } from "@/utils/encryption";

class EncryptedAddressService {
  /**
   * Save encrypted address to database
   */
  async saveAddress(userId: string, addressData: AddressData, isDefault = false): Promise<EncryptedAddress | null> {
    try {
      // Validate address data
      const validationErrors = addressEncryption.validateAddress(addressData);
      if (validationErrors.length > 0) {
        toast.error(`Address validation failed: ${validationErrors.join(', ')}`);
        return null;
      }

      // If setting as default, unset current default
      if (isDefault) {
        await supabase
          .from('encrypted_addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
          .eq('is_default', true);
      }

      // Create encrypted record
      const encryptedRecord = addressEncryption.createEncryptedRecord(userId, addressData, isDefault);

      const { data, error } = await supabase
        .from('encrypted_addresses')
        .insert(encryptedRecord)
        .select()
        .single();

      if (error) throw error;

      toast.success('Address saved securely!');
      return data;
    } catch (error) {
      console.error('Error saving encrypted address:', error);
      toast.error('Failed to save address');
      return null;
    }
  }

  /**
   * Get all encrypted addresses for a user
   */
  async getUserAddresses(userId: string): Promise<EncryptedAddress[]> {
    try {
      const { data, error } = await supabase
        .from('encrypted_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      toast.error('Failed to load addresses');
      return [];
    }
  }

  /**
   * Get default address for a user
   */
  async getDefaultAddress(userId: string): Promise<EncryptedAddress | null> {
    try {
      const { data, error } = await supabase
        .from('encrypted_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data;
    } catch (error) {
      console.error('Error fetching default address:', error);
      return null;
    }
  }

  /**
   * Decrypt address for use (e.g., during delivery)
   */
  async getDecryptedAddress(addressId: string, userId: string): Promise<AddressData | null> {
    try {
      const { data, error } = await supabase
        .from('encrypted_addresses')
        .select('encrypted_data')
        .eq('id', addressId)
        .eq('user_id', userId) // Security: only user can decrypt their own address
        .single();

      if (error) throw error;

      return addressEncryption.decryptAddress(data.encrypted_data);
    } catch (error) {
      console.error('Error decrypting address:', error);
      toast.error('Failed to load address details');
      return null;
    }
  }

  /**
   * Update address
   */
  async updateAddress(addressId: string, userId: string, addressData: AddressData, isDefault?: boolean): Promise<EncryptedAddress | null> {
    try {
      // Validate address data
      const validationErrors = addressEncryption.validateAddress(addressData);
      if (validationErrors.length > 0) {
        toast.error(`Address validation failed: ${validationErrors.join(', ')}`);
        return null;
      }

      // If setting as default, unset current default
      if (isDefault) {
        await supabase
          .from('encrypted_addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
          .eq('is_default', true);
      }

      const updateData: any = {
        encrypted_data: addressEncryption.encryptAddress(addressData),
      };

      if (isDefault !== undefined) {
        updateData.is_default = isDefault;
      }

      const { data, error } = await supabase
        .from('encrypted_addresses')
        .update(updateData)
        .eq('id', addressId)
        .eq('user_id', userId) // Security: only user can update their own address
        .select()
        .single();

      if (error) throw error;

      toast.success('Address updated successfully!');
      return data;
    } catch (error) {
      console.error('Error updating encrypted address:', error);
      toast.error('Failed to update address');
      return null;
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('encrypted_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId); // Security: only user can delete their own address

      if (error) throw error;

      toast.success('Address deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting encrypted address:', error);
      toast.error('Failed to delete address');
      return false;
    }
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(addressId: string, userId: string): Promise<boolean> {
    try {
      // First, unset all defaults for this user
      await supabase
        .from('encrypted_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);

      // Then set the new default
      const { error } = await supabase
        .from('encrypted_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Default address updated!');
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
      return false;
    }
  }

  /**
   * Get address preview for display (without full decryption)
   */
  getAddressPreview(encryptedAddress: EncryptedAddress): string {
    return addressEncryption.getAddressPreview(encryptedAddress.encrypted_data);
  }

  /**
   * Export address for delivery (decrypts for delivery purposes)
   */
  async exportForDelivery(addressId: string, userId: string): Promise<AddressData | null> {
    try {
      // Only allow export for delivery purposes - could add additional security checks
      return await this.getDecryptedAddress(addressId, userId);
    } catch (error) {
      console.error('Error exporting address for delivery:', error);
      return null;
    }
  }
}

export const encryptedAddressService = new EncryptedAddressService();
export default encryptedAddressService;
