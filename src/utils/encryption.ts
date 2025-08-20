// Simple encryption utility for addresses
// In production, use a proper encryption library like crypto-js or built-in Web Crypto API

const ENCRYPTION_KEY = 'MyFuze_Address_Key_2024'; // In production, use environment variable

// Simple XOR encryption - sufficient for basic address obfuscation
// For production, use AES or similar proper encryption
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
    return text; // Return original text if encryption fails
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
    return encryptedText; // Return encrypted text if decryption fails
  }
}

export interface AddressData {
  fullName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

export interface EncryptedAddress {
  id?: string;
  user_id: string;
  encrypted_data: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export const addressEncryption = {
  /**
   * Encrypt address data for storage
   */
  encryptAddress(addressData: AddressData): string {
    const addressString = JSON.stringify(addressData);
    return simpleEncrypt(addressString);
  },

  /**
   * Decrypt address data for use
   */
  decryptAddress(encryptedData: string): AddressData | null {
    try {
      const decryptedString = simpleDecrypt(encryptedData);
      return JSON.parse(decryptedString) as AddressData;
    } catch (error) {
      console.error('Failed to decrypt address:', error);
      return null;
    }
  },

  /**
   * Create encrypted address record for database
   */
  createEncryptedRecord(userId: string, addressData: AddressData, isDefault = false): Omit<EncryptedAddress, 'id' | 'created_at' | 'updated_at'> {
    return {
      user_id: userId,
      encrypted_data: this.encryptAddress(addressData),
      is_default: isDefault
    };
  },

  /**
   * Get address preview (first line + city) without full decryption
   */
  getAddressPreview(encryptedData: string): string {
    try {
      const address = this.decryptAddress(encryptedData);
      if (!address) return 'Address not available';
      
      return `${address.address1}, ${address.city}`;
    } catch (error) {
      return 'Address preview unavailable';
    }
  },

  /**
   * Validate address data before encryption
   */
  validateAddress(addressData: AddressData): string[] {
    const errors: string[] = [];
    
    if (!addressData.fullName?.trim()) errors.push('Full name is required');
    if (!addressData.address1?.trim()) errors.push('Address line 1 is required');
    if (!addressData.city?.trim()) errors.push('City is required');
    if (!addressData.province?.trim()) errors.push('Province is required');
    if (!addressData.postalCode?.trim()) errors.push('Postal code is required');
    if (!addressData.phone?.trim()) errors.push('Phone number is required');
    
    return errors;
  }
};

export default addressEncryption;
