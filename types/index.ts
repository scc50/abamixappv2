export interface Product {
  id: number;
  title: string;
  price: number;
  discount?: number;
  desc: string;
  image: string;
  thumbnail1?: string;
  thumbnail2?: string;
  thumbnail3?: string;
  thumbnail4?: string;
  typ: string;
  likes: number;
  rates: number;
  sizes?: string;
  color?: string;
  description_title?: string;
  description_box?: string;
}

export interface ProductType {
  id: number;
  typ: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  ordered: boolean;
}

export interface WishlistItem {
  id: number;
  product: Product;
  user: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface Message {
  id: number;
  sender: User;
  receiver: User;
  content: string;
  timestamp: string;
  is_replied: boolean;
}

export interface Comment {
  id: number;
  user: User;
  product: Product;
  comment: string;
  created_at: string;
}

export interface RecentSearch {
  id: number;
  name: string;
}
