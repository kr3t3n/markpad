export interface Profile {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled';
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Document, 'id'>>;
      };
    };
  };
}