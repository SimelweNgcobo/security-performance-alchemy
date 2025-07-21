export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: never
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: never
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banking_details: {
        Row: {
          account_type: string
          account_verified: boolean | null
          bank_account_number: string
          bank_name: string
          branch_code: string | null
          created_at: string
          encrypted_data: string | null
          encryption_salt: string | null
          fields_encrypted: string[] | null
          full_name: string
          id: string
          password_hash: string | null
          paystack_subaccount_code: string | null
          paystack_subaccount_id: string | null
          recipient_code: string | null
          recipient_type: string
          subaccount_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          account_verified?: boolean | null
          bank_account_number: string
          bank_name: string
          branch_code?: string | null
          created_at?: string
          encrypted_data?: string | null
          encryption_salt?: string | null
          fields_encrypted?: string[] | null
          full_name: string
          id?: string
          password_hash?: string | null
          paystack_subaccount_code?: string | null
          paystack_subaccount_id?: string | null
          recipient_code?: string | null
          recipient_type: string
          subaccount_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          account_verified?: boolean | null
          bank_account_number?: string
          bank_name?: string
          branch_code?: string | null
          created_at?: string
          encrypted_data?: string | null
          encryption_salt?: string | null
          fields_encrypted?: string[] | null
          full_name?: string
          id?: string
          password_hash?: string | null
          paystack_subaccount_code?: string | null
          paystack_subaccount_id?: string | null
          recipient_code?: string | null
          recipient_type?: string
          subaccount_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      banking_subaccounts: {
        Row: {
          account_number: string
          bank_code: string
          bank_name: string
          business_name: string
          created_at: string | null
          email: string
          id: string
          paystack_response: Json | null
          status: string | null
          subaccount_code: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_number: string
          bank_code: string
          bank_name: string
          business_name: string
          created_at?: string | null
          email: string
          id?: string
          paystack_response?: Json | null
          status?: string | null
          subaccount_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_number?: string
          bank_code?: string
          bank_name?: string
          business_name?: string
          created_at?: string | null
          email?: string
          id?: string
          paystack_response?: Json | null
          status?: string | null
          subaccount_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          availability: string | null
          back_cover: string | null
          category: string
          condition: string
          created_at: string
          description: string
          front_cover: string | null
          grade: string | null
          id: string
          image_url: string
          inside_pages: string | null
          price: number
          province: string | null
          seller_id: string
          sold: boolean
          subaccount_code: string | null
          title: string
          university: string | null
          university_year: string | null
          updated_at: string | null
        }
        Insert: {
          author: string
          availability?: string | null
          back_cover?: string | null
          category: string
          condition: string
          created_at?: string
          description: string
          front_cover?: string | null
          grade?: string | null
          id?: string
          image_url: string
          inside_pages?: string | null
          price: number
          province?: string | null
          seller_id: string
          sold?: boolean
          subaccount_code?: string | null
          title: string
          university?: string | null
          university_year?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string
          availability?: string | null
          back_cover?: string | null
          category?: string
          condition?: string
          created_at?: string
          description?: string
          front_cover?: string | null
          grade?: string | null
          id?: string
          image_url?: string
          inside_pages?: string | null
          price?: number
          province?: string | null
          seller_id?: string
          sold?: boolean
          subaccount_code?: string | null
          title?: string
          university?: string | null
          university_year?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_books_seller_profile"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "account_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_books_seller_profile"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "account_details"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_books_seller_profile"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          message: string
          priority: Database["public"]["Enums"]["broadcast_priority"]
          target_audience:
            | Database["public"]["Enums"]["broadcast_target_audience"]
            | null
          title: string
          type: Database["public"]["Enums"]["broadcast_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: Database["public"]["Enums"]["broadcast_priority"]
          target_audience?:
            | Database["public"]["Enums"]["broadcast_target_audience"]
            | null
          title: string
          type?: Database["public"]["Enums"]["broadcast_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: Database["public"]["Enums"]["broadcast_priority"]
          target_audience?:
            | Database["public"]["Enums"]["broadcast_target_audience"]
            | null
          title?: string
          type?: Database["public"]["Enums"]["broadcast_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "account_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "account_details"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "broadcasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commitment_notifications: {
        Row: {
          commitment_id: string
          created_at: string
          id: string
          notification_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          commitment_id: string
          created_at?: string
          id?: string
          notification_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          commitment_id?: string
          created_at?: string
          id?: string
          notification_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitment_notifications_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "sale_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_automation_log: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          order_id: string
          provider: string | null
          request_data: Json | null
          response_data: Json | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          order_id: string
          provider?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          order_id?: string
          provider?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_automation_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notification_requests: {
        Row: {
          course_code: string | null
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          notification_type: string
          notified_at: string | null
          program_id: string | null
          program_name: string | null
          status: string
          university_id: string | null
          university_name: string | null
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          course_code?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          notification_type: string
          notified_at?: string | null
          program_id?: string | null
          program_name?: string | null
          status?: string
          university_id?: string | null
          university_name?: string | null
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          course_code?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          notification_type?: string
          notified_at?: string | null
          program_id?: string | null
          program_name?: string | null
          status?: string
          university_id?: string | null
          university_name?: string | null
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          old_status: string | null
          order_id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          order_id: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          order_id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_activity_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          order_id: string | null
          read: boolean | null
          sent_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          order_id?: string | null
          read?: boolean | null
          sent_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          order_id?: string | null
          read?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          book_id: string | null
          buyer_email: string
          buyer_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          commit_deadline: string | null
          committed_at: string | null
          created_at: string
          delivery_address: Json | null
          delivery_data: Json | null
          delivery_option: string | null
          delivery_status: string | null
          id: string
          items: Json
          metadata: Json | null
          paid_at: string | null
          payment_data: Json | null
          payment_reference: string | null
          payment_status: string | null
          paystack_ref: string | null
          paystack_reference: string | null
          paystack_subaccount: string | null
          refund_reference: string | null
          refund_status: string | null
          refunded_at: string | null
          seller_id: string
          shipping_address: Json | null
          status: string
          total_amount: number | null
          total_refunded: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          book_id?: string | null
          buyer_email: string
          buyer_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commit_deadline?: string | null
          committed_at?: string | null
          created_at?: string
          delivery_address?: Json | null
          delivery_data?: Json | null
          delivery_option?: string | null
          delivery_status?: string | null
          id?: string
          items?: Json
          metadata?: Json | null
          paid_at?: string | null
          payment_data?: Json | null
          payment_reference?: string | null
          payment_status?: string | null
          paystack_ref?: string | null
          paystack_reference?: string | null
          paystack_subaccount?: string | null
          refund_reference?: string | null
          refund_status?: string | null
          refunded_at?: string | null
          seller_id: string
          shipping_address?: Json | null
          status?: string
          total_amount?: number | null
          total_refunded?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          book_id?: string | null
          buyer_email?: string
          buyer_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commit_deadline?: string | null
          committed_at?: string | null
          created_at?: string
          delivery_address?: Json | null
          delivery_data?: Json | null
          delivery_option?: string | null
          delivery_status?: string | null
          id?: string
          items?: Json
          metadata?: Json | null
          paid_at?: string | null
          payment_data?: Json | null
          payment_reference?: string | null
          payment_status?: string | null
          paystack_ref?: string | null
          paystack_reference?: string | null
          paystack_subaccount?: string | null
          refund_reference?: string | null
          refund_status?: string | null
          refunded_at?: string | null
          seller_id?: string
          shipping_address?: Json | null
          status?: string
          total_amount?: number | null
          total_refunded?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_logs: {
        Row: {
          event_type: string
          id: string
          payload: Json | null
          paystack_event_id: string | null
          processed_at: string | null
          transaction_id: string | null
        }
        Insert: {
          event_type: string
          id?: string
          payload?: Json | null
          paystack_event_id?: string | null
          processed_at?: string | null
          transaction_id?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json | null
          paystack_event_id?: string | null
          processed_at?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_splits: {
        Row: {
          amount: number | null
          book_amount: number
          courier_amount: number
          courier_subaccount: string | null
          created_at: string
          delivery_amount: number
          id: string
          order_id: string | null
          payment_reference: string | null
          paystack_reference: string | null
          paystack_split_id: string | null
          pickup_confirmed: boolean
          platform_commission: number
          seller_amount: number
          seller_id: string | null
          seller_subaccount: string
          split_executed: boolean
          status: string | null
          subaccount_code: string | null
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          book_amount: number
          courier_amount?: number
          courier_subaccount?: string | null
          created_at?: string
          delivery_amount?: number
          id?: string
          order_id?: string | null
          payment_reference?: string | null
          paystack_reference?: string | null
          paystack_split_id?: string | null
          pickup_confirmed?: boolean
          platform_commission: number
          seller_amount: number
          seller_id?: string | null
          seller_subaccount: string
          split_executed?: boolean
          status?: string | null
          subaccount_code?: string | null
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          book_amount?: number
          courier_amount?: number
          courier_subaccount?: string | null
          created_at?: string
          delivery_amount?: number
          id?: string
          order_id?: string | null
          payment_reference?: string | null
          paystack_reference?: string | null
          paystack_split_id?: string | null
          pickup_confirmed?: boolean
          platform_commission?: number
          seller_amount?: number
          seller_id?: string | null
          seller_subaccount?: string
          split_executed?: boolean
          status?: string | null
          subaccount_code?: string | null
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_splits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          payment_method: string | null
          paystack_response: Json | null
          reference: string
          status: string
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          paystack_response?: Json | null
          reference: string
          status?: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          paystack_response?: Json | null
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_logs: {
        Row: {
          amount: number
          commission: number
          created_at: string
          error_message: string | null
          id: string
          order_id: string
          paystack_response: Json | null
          recipient_code: string | null
          reference: string | null
          retry_count: number | null
          seller_id: string
          status: string
          transfer_code: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          commission?: number
          created_at?: string
          error_message?: string | null
          id?: string
          order_id: string
          paystack_response?: Json | null
          recipient_code?: string | null
          reference?: string | null
          retry_count?: number | null
          seller_id: string
          status?: string
          transfer_code?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          commission?: number
          created_at?: string
          error_message?: string | null
          id?: string
          order_id?: string
          paystack_response?: Json | null
          recipient_code?: string | null
          reference?: string | null
          retry_count?: number | null
          seller_id?: string
          status?: string
          transfer_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          initiated_at: string | null
          order_id: string
          paystack_response: Json | null
          seller_id: string
          status: string
          transfer_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_at?: string | null
          order_id: string
          paystack_response?: Json | null
          seller_id: string
          status?: string
          transfer_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_at?: string | null
          order_id?: string
          paystack_response?: Json | null
          seller_id?: string
          status?: string
          transfer_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      paystack_subaccounts: {
        Row: {
          account_number: string
          business_name: string
          created_at: string
          id: string
          paystack_response: Json | null
          percentage_charge: number
          settlement_bank: string
          status: string
          subaccount_code: string
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          account_number: string
          business_name: string
          created_at?: string
          id?: string
          paystack_response?: Json | null
          percentage_charge?: number
          settlement_bank: string
          status?: string
          subaccount_code: string
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          account_number?: string
          business_name?: string
          created_at?: string
          id?: string
          paystack_response?: Json | null
          percentage_charge?: number
          settlement_bank?: string
          status?: string
          subaccount_code?: string
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          addresses_same: boolean | null
          aps_profile: Json | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          email_verification_token: string | null
          email_verified: boolean | null
          first_name: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          name: string | null
          phone_number: string | null
          phone_verification_code: string | null
          phone_verified: boolean | null
          pickup_address: Json | null
          preferences: Json | null
          profile_picture_url: string | null
          shipping_address: Json | null
          status: string | null
          subaccount_code: string | null
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string
          user_tier: string | null
          verification_expires_at: string | null
        }
        Insert: {
          addresses_same?: boolean | null
          aps_profile?: Json | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          name?: string | null
          phone_number?: string | null
          phone_verification_code?: string | null
          phone_verified?: boolean | null
          pickup_address?: Json | null
          preferences?: Json | null
          profile_picture_url?: string | null
          shipping_address?: Json | null
          status?: string | null
          subaccount_code?: string | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_tier?: string | null
          verification_expires_at?: string | null
        }
        Update: {
          addresses_same?: boolean | null
          aps_profile?: Json | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          email_verification_token?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          name?: string | null
          phone_number?: string | null
          phone_verification_code?: string | null
          phone_verified?: boolean | null
          pickup_address?: Json | null
          preferences?: Json | null
          profile_picture_url?: string | null
          shipping_address?: Json | null
          status?: string | null
          subaccount_code?: string | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_tier?: string | null
          verification_expires_at?: string | null
        }
        Relationships: []
      }
      receipts: {
        Row: {
          buyer_email: string
          generated_at: string | null
          id: string
          order_id: string | null
          receipt_data: Json
          receipt_number: string
          seller_email: string
          sent_to_admin: boolean | null
          sent_to_buyer: boolean | null
        }
        Insert: {
          buyer_email: string
          generated_at?: string | null
          id?: string
          order_id?: string | null
          receipt_data: Json
          receipt_number: string
          seller_email: string
          sent_to_admin?: boolean | null
          sent_to_buyer?: boolean | null
        }
        Update: {
          buyer_email?: string
          generated_at?: string | null
          id?: string
          order_id?: string | null
          receipt_data?: Json
          receipt_number?: string
          seller_email?: string
          sent_to_admin?: boolean | null
          sent_to_buyer?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          initiated_by: string | null
          order_id: string
          paystack_refund_reference: string | null
          paystack_response: Json | null
          processed_at: string | null
          reason: string
          status: string
          transaction_reference: string
          updated_at: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_by?: string | null
          order_id: string
          paystack_refund_reference?: string | null
          paystack_response?: Json | null
          processed_at?: string | null
          reason: string
          status?: string
          transaction_reference: string
          updated_at?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_by?: string | null
          order_id?: string
          paystack_refund_reference?: string | null
          paystack_response?: Json | null
          processed_at?: string | null
          reason?: string
          status?: string
          transaction_reference?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          book_id: string | null
          book_title: string
          created_at: string
          id: string
          reason: string
          reported_user_id: string
          reporter_user_id: string
          seller_name: string
          status: string
          updated_at: string
        }
        Insert: {
          book_id?: string | null
          book_title: string
          created_at?: string
          id?: string
          reason: string
          reported_user_id: string
          reporter_user_id: string
          seller_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          book_id?: string | null
          book_title?: string
          created_at?: string
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_user_id?: string
          seller_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_commitments: {
        Row: {
          commitment_deadline: string
          committed_at: string | null
          created_at: string
          id: string
          order_id: string
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          commitment_deadline: string
          committed_at?: string | null
          created_at?: string
          id?: string
          order_id: string
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          commitment_deadline?: string
          committed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_commitments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          paystack_response: Json | null
          platform_fee: number
          seller_id: string
          status: string
          total_amount: number
          transfer_reference: string | null
          triggered_by: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          paystack_response?: Json | null
          platform_fee: number
          seller_id: string
          status?: string
          total_amount: number
          transfer_reference?: string | null
          triggered_by?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          paystack_response?: Json | null
          platform_fee?: number
          seller_id?: string
          status?: string
          total_amount?: number
          transfer_reference?: string | null
          triggered_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      study_resources: {
        Row: {
          content: string | null
          course_code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          download_count: number | null
          file_url: string | null
          grade_level: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          resource_type: string
          subject: string | null
          thumbnail_url: string | null
          title: string
          university: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          course_code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          resource_type: string
          subject?: string | null
          thumbnail_url?: string | null
          title: string
          university?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          course_code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          resource_type?: string
          subject?: string | null
          thumbnail_url?: string | null
          title?: string
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      study_tips: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          difficulty_level: string | null
          estimated_read_time: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          subject: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          estimated_read_time?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          subject?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          estimated_read_time?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          subject?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          book_id: string
          book_title: string
          buyer_email: string | null
          buyer_id: string
          buyer_phone: string | null
          commission: number
          committed_at: string | null
          created_at: string
          delivery_address: Json | null
          delivery_fee: number | null
          expires_at: string | null
          id: string
          paystack_reference: string | null
          paystack_subaccount_code: string | null
          price: number
          refund_reason: string | null
          refunded: boolean | null
          seller_committed: boolean | null
          seller_id: string
          status: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          book_id: string
          book_title: string
          buyer_email?: string | null
          buyer_id: string
          buyer_phone?: string | null
          commission: number
          committed_at?: string | null
          created_at?: string
          delivery_address?: Json | null
          delivery_fee?: number | null
          expires_at?: string | null
          id?: string
          paystack_reference?: string | null
          paystack_subaccount_code?: string | null
          price: number
          refund_reason?: string | null
          refunded?: boolean | null
          seller_committed?: boolean | null
          seller_id: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          book_id?: string
          book_title?: string
          buyer_email?: string | null
          buyer_id?: string
          buyer_phone?: string | null
          commission?: number
          committed_at?: string | null
          created_at?: string
          delivery_address?: Json | null
          delivery_fee?: number | null
          expires_at?: string | null
          id?: string
          paystack_reference?: string | null
          paystack_subaccount_code?: string | null
          price?: number
          refund_reason?: string | null
          refunded?: boolean | null
          seller_committed?: boolean | null
          seller_id?: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      account_details: {
        Row: {
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          email_verified: boolean | null
          first_name: string | null
          full_name: string | null
          id: string | null
          last_name: string | null
          phone_number: string | null
          phone_verified: boolean | null
          preferences: Json | null
          profile_picture_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id?: string | null
          last_name?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferences?: Json | null
          profile_picture_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id?: string | null
          last_name?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferences?: Json | null
          profile_picture_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      refund_summary: {
        Row: {
          amount: number | null
          buyer_email: string | null
          buyer_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string | null
          initiated_by_email: string | null
          order_id: string | null
          paystack_refund_reference: string | null
          processing_hours: number | null
          reason: string | null
          seller_email: string | null
          seller_id: string | null
          status: string | null
          transaction_reference: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_earnings_summary: {
        Row: {
          completed_orders: number | null
          gross_earnings: number | null
          net_earnings: number | null
          paid_earnings: number | null
          paid_orders: number | null
          pending_earnings: number | null
          ready_orders: number | null
          seller_email: string | null
          seller_id: string | null
          seller_name: string | null
          total_orders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      atomic_book_purchase: {
        Args: { p_book_id: string; p_buyer_id: string; p_amount: number }
        Returns: string
      }
      auto_cancel_expired_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      auto_process_ready_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_commission: {
        Args: { base_amount: number; user_tier?: string }
        Returns: number
      }
      calculate_payment_split: {
        Args: {
          p_book_amount: number
          p_delivery_amount?: number
          p_platform_commission_rate?: number
        }
        Returns: {
          platform_commission: number
          seller_amount: number
          courier_amount: number
        }[]
      }
      check_refund_eligibility: {
        Args: { p_order_id: string }
        Returns: {
          eligible: boolean
          reason: string
          max_refund_amount: number
        }[]
      }
      clear_user_aps_profile: {
        Args: { user_id?: string }
        Returns: boolean
      }
      create_order_notification: {
        Args: {
          p_order_id: string
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
        }
        Returns: string
      }
      create_payment_split: {
        Args: {
          p_transaction_id: string
          p_seller_subaccount: string
          p_courier_subaccount: string
          p_book_amount: number
          p_delivery_amount?: number
        }
        Returns: string
      }
      delete_user_profile: {
        Args: { user_id: string }
        Returns: undefined
      }
      execute_payment_split_after_pickup: {
        Args: { p_transaction_id: string }
        Returns: boolean
      }
      generate_api_key: {
        Args: { user_id: string }
        Returns: string
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_payment_statistics: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_payments: number
          successful_payments: number
          failed_payments: number
          pending_payments: number
          total_amount: number
          avg_payment_amount: number
        }[]
      }
      get_payment_transaction: {
        Args: { p_reference: string }
        Returns: {
          id: string
          reference: string
          order_id: string
          amount: number
          status: string
          created_at: string
          verified_at: string
        }[]
      }
      get_refund_statistics: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_refunds: number
          pending_refunds: number
          processing_refunds: number
          successful_refunds: number
          failed_refunds: number
          total_refund_amount: number
          avg_refund_amount: number
          avg_processing_time: unknown
        }[]
      }
      get_seller_profile_for_delivery: {
        Args: { p_seller_id: string }
        Returns: {
          seller_id: string
          seller_name: string
          seller_email: string
          pickup_address: Json
          has_subaccount: boolean
        }[]
      }
      get_user_aps_profile: {
        Args: { user_id?: string }
        Returns: Json
      }
      get_user_payment_history: {
        Args: { p_user_id: string }
        Returns: {
          transaction_id: string
          reference: string
          order_id: string
          amount: number
          status: string
          payment_method: string
          created_at: string
          verified_at: string
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          name: string
          email: string
        }[]
      }
      has_role: {
        Args:
          | { user_id: number; role_name: string }
          | { user_id: string; role_name: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_seller_ready_for_orders: {
        Args: { p_seller_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      list_all_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          username: string
          email: string
          created_at: string
        }[]
      }
      save_user_aps_profile: {
        Args: { profile_data: Json; user_id?: string }
        Returns: boolean
      }
      search_books: {
        Args: {
          search_term: string
          category_filter?: string
          max_price?: number
        }
        Returns: {
          id: string
          title: string
          author: string
          description: string
          price: number
          category: string
          condition: string
          image_url: string
          seller_id: string
          created_at: string
        }[]
      }
      secure_atomic_book_purchase: {
        Args: {
          p_book_id: string
          p_buyer_id: string
          p_amount: number
          p_book_title: string
        }
        Returns: string
      }
      send_commit_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_expired_transactions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_profile: {
        Args: { user_id: string; new_name: string; new_email: string }
        Returns: undefined
      }
      validate_aps_profile: {
        Args: { profile_data: Json }
        Returns: boolean
      }
      validate_book_availability: {
        Args: { book_id: string }
        Returns: boolean
      }
      validate_book_ownership: {
        Args: { book_id: string; user_id: string }
        Returns: boolean
      }
      validate_payment_amount: {
        Args: { amount: number }
        Returns: boolean
      }
      validate_refund_amount: {
        Args: { p_order_id: string; p_amount: number }
        Returns: {
          valid: boolean
          reason: string
          validated_amount: number
        }[]
      }
      verify_book_seller_relationship: {
        Args: { p_book_id: string }
        Returns: {
          book_id: string
          book_title: string
          seller_id: string
          seller_name: string
          seller_has_address: boolean
          seller_has_subaccount: boolean
        }[]
      }
    }
    Enums: {
      broadcast_priority: "low" | "normal" | "medium" | "high" | "urgent"
      broadcast_target_audience: "all" | "users" | "admin"
      broadcast_type: "info" | "warning" | "success" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      broadcast_priority: ["low", "normal", "medium", "high", "urgent"],
      broadcast_target_audience: ["all", "users", "admin"],
      broadcast_type: ["info", "warning", "success", "error"],
    },
  },
} as const
