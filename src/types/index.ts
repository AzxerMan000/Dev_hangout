export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  wallet_balance: number;
  created_at: string;
}

export interface Content {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  thumbnail_url?: string;
  content_type: 'video' | 'image' | 'short';
  duration?: number;
  file_size: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: User;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'earning';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}