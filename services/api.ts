import { Product, ProductType, CartItem, WishlistItem, RecentSearch, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://your-django-backend.com/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
};

export const api = {
  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/products/`, { headers });
      return response.json();
    } catch (error) {
      console.error('Get products error:', error);
      return [];
    }
  },

  async getProductById(id: number): Promise<Product> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/products/${id}/`, { headers });
    return response.json();
  },

  async getProductsByType(typeName: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/types/${typeName}/`);
    return response.json();
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/search/input/${query}/`);
    return response.json();
  },

  async filterProducts(params: {
    q?: string;
    size?: string;
    color?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
  }): Promise<Product[]> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    
    const response = await fetch(`${API_BASE_URL}/products/filter/?${queryString}`);
    const data = await response.json();
    return JSON.parse(data);
  },

  async getAutocomplete(query: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/autocomplete/?q=${query}`);
    return response.json();
  },

  // Product Types
  async getProductTypes(): Promise<ProductType[]> {
    const response = await fetch(`${API_BASE_URL}/ipcontent/`);
    return response.json();
  },

  // Cart
  async addToCart(productId: number, quantity: number): Promise<CartItem> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/cart/add/${productId}/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  async getCart(): Promise<CartItem[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/cart/`, { headers });
    return response.json();
  },

  // Wishlist
  async addToWishlist(productId: number): Promise<void> {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE_URL}/wishlist/add/${productId}/`, {
      method: 'POST',
      headers,
    });
  },

  async getWishlist(): Promise<WishlistItem[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/wishlist/`, { headers });
    return response.json();
  },

  // Product Actions
  async likeProduct(id: number): Promise<{ likes: number }> {
    const response = await fetch(`${API_BASE_URL}/product/like/${id}/`);
    return response.json();
  },

  async rateProduct(id: number, rating: number): Promise<void> {
    const formData = new FormData();
    formData.append('rates', String(rating));
    formData.append('id', String(id));
    
    await fetch(`${API_BASE_URL}/product/rate/`, {
      method: 'POST',
      body: formData,
    });
  },

  // Recent Searches
  async getRecentSearches(): Promise<RecentSearch[]> {
    const response = await fetch(`${API_BASE_URL}/recents/`);
    const data = await response.json();
    return JSON.parse(data);
  },

  async addRecentSearch(query: string): Promise<void> {
    await fetch(`${API_BASE_URL}/recent/${query}/`);
  },

  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);
        return { success: true, token: data.token, user: data.user };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async signup(username: string, email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);
        return { success: true, token: data.token, user: data.user };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  },
};

// Mock data for development/demo
export const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Premium Winter Jacket',
    price: 45000,
    discount: 55000,
    desc: 'Stay warm and stylish with our premium winter jacket. Features waterproof material and thermal insulation.',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    typ: 'CLOTHES',
    likes: 1250,
    rates: 5,
    sizes: 'M, L, XL',
    color: 'Black Blue Red',
    description_title: 'Premium Quality',
    description_box: 'Made with high-quality materials for maximum comfort and durability.',
  },
  {
    id: 2,
    title: 'Casual Sneakers',
    price: 35000,
    desc: 'Comfortable and trendy sneakers perfect for everyday wear.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    typ: 'SHOES',
    likes: 890,
    rates: 4,
    sizes: '40, 41, 42, 43',
    color: 'White Black',
  },
  {
    id: 3,
    title: 'Designer Handbag',
    price: 65000,
    discount: 75000,
    desc: 'Elegant designer handbag with premium leather finish.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    typ: 'ACCESSORIES',
    likes: 2100,
    rates: 5,
    color: 'Brown Black Beige',
  },
  {
    id: 4,
    title: 'Smart Watch Pro',
    price: 85000,
    desc: 'Advanced smartwatch with fitness tracking and notifications.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    typ: 'ELECTRONICS',
    likes: 3400,
    rates: 5,
    color: 'Black Silver',
  },
  {
    id: 5,
    title: 'Denim Jeans',
    price: 28000,
    desc: 'Classic denim jeans with a modern fit.',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
    typ: 'CLOTHES',
    likes: 670,
    rates: 4,
    sizes: '30, 32, 34, 36',
    color: 'Blue Black',
  },
  {
    id: 6,
    title: 'Wireless Earbuds',
    price: 42000,
    discount: 50000,
    desc: 'Premium wireless earbuds with noise cancellation.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
    typ: 'ELECTRONICS',
    likes: 1890,
    rates: 5,
    color: 'White Black',
  },
  {
    id: 7,
    title: 'Leather Wallet',
    price: 15000,
    desc: 'Genuine leather wallet with multiple card slots.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
    typ: 'ACCESSORIES',
    likes: 450,
    rates: 4,
    color: 'Brown Black',
  },
  {
    id: 8,
    title: 'Running Shoes',
    price: 48000,
    desc: 'Professional running shoes with advanced cushioning.',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    typ: 'SHOES',
    likes: 1120,
    rates: 5,
    sizes: '40, 41, 42, 43, 44',
    color: 'Red Black White',
  },
];

export const mockProductTypes: ProductType[] = [
  { id: 1, typ: 'CLOTHES' },
  { id: 2, typ: 'SHOES' },
  { id: 3, typ: 'ACCESSORIES' },
  { id: 4, typ: 'ELECTRONICS' },
];
