import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserLabel {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  design_data: any;
  is_default: boolean;
  dimensions: { width: number; height: number };
  created_at: string;
  updated_at: string;
}

export interface LabelDesignData {
  backgroundColor: string;
  elements: Array<{
    id: string;
    type: 'text' | 'image' | 'shape';
    content?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: string;
    src?: string;
  }>;
}

class UserLabelsService {
  async getUserLabels(userId: string): Promise<UserLabel[]> {
    try {
      const { data, error } = await supabase
        .from('user_labels')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user labels:', error);
      toast.error('Failed to load saved labels');
      return [];
    }
  }

  async getDefaultLabel(userId: string): Promise<UserLabel | null> {
    try {
      const { data, error } = await supabase
        .from('user_labels')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data || null;
    } catch (error) {
      console.error('Error fetching default label:', error);
      return null;
    }
  }

  async saveLabel(
    userId: string,
    name: string,
    designData: LabelDesignData,
    description?: string,
    isDefault: boolean = false
  ): Promise<UserLabel | null> {
    try {
      const labelData = {
        user_id: userId,
        name,
        description,
        design_data: designData,
        is_default: isDefault,
        dimensions: { width: 264, height: 60 }
      };

      const { data, error } = await supabase
        .from('user_labels')
        .insert(labelData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Label "${name}" saved successfully!`);
      return data;
    } catch (error) {
      console.error('Error saving label:', error);
      toast.error('Failed to save label');
      return null;
    }
  }

  async updateLabel(
    labelId: string,
    updates: Partial<{
      name: string;
      description: string;
      design_data: LabelDesignData;
      is_default: boolean;
    }>
  ): Promise<UserLabel | null> {
    try {
      const { data, error } = await supabase
        .from('user_labels')
        .update(updates)
        .eq('id', labelId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Label updated successfully!');
      return data;
    } catch (error) {
      console.error('Error updating label:', error);
      toast.error('Failed to update label');
      return null;
    }
  }

  async deleteLabel(labelId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_labels')
        .delete()
        .eq('id', labelId);

      if (error) throw error;

      toast.success('Label deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting label:', error);
      toast.error('Failed to delete label');
      return false;
    }
  }

  async setDefaultLabel(labelId: string, userId: string): Promise<boolean> {
    try {
      // First, unset all default labels for this user
      await supabase
        .from('user_labels')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);

      // Then set the new default
      const { error } = await supabase
        .from('user_labels')
        .update({ is_default: true })
        .eq('id', labelId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Default label updated!');
      return true;
    } catch (error) {
      console.error('Error setting default label:', error);
      toast.error('Failed to set default label');
      return false;
    }
  }

  // Create a default MyFuze label for new users
  async createDefaultMyFuzeLabel(userId: string): Promise<UserLabel | null> {
    const defaultDesign: LabelDesignData = {
      backgroundColor: '#ffffff',
      elements: [
        {
          id: 'logo-text',
          type: 'text',
          content: 'MyFuze',
          x: 132,
          y: 30,
          fontSize: 28,
          fontFamily: 'Arial, sans-serif',
          color: '#1e40af',
          textAlign: 'center'
        },
        {
          id: 'tagline',
          type: 'text',
          content: 'Pure Water, Pure Quality',
          x: 132,
          y: 45,
          fontSize: 12,
          fontFamily: 'Arial, sans-serif',
          color: '#64748b',
          textAlign: 'center'
        }
      ]
    };

    return this.saveLabel(
      userId,
      'MyFuze Default',
      defaultDesign,
      'Default MyFuze branding label',
      true
    );
  }

  // Export label for enterprise quotes
  exportLabelForQuote(label: UserLabel) {
    return {
      id: label.id,
      name: label.name,
      description: label.description,
      design: label.design_data,
      dimensions: label.dimensions,
      timestamp: label.updated_at
    };
  }
}

export const userLabelsService = new UserLabelsService();
