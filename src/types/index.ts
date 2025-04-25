export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  category?: string;
  category_id?: string;
  created_at: string;
  user_id: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
} 