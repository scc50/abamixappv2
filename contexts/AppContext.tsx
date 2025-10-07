import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem, WishlistItem, User } from '@/types';
import { api, mockProducts } from '@/services/api';

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    };
    
    loadUserData();
  }, []);



  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => mockProducts,
  });

  const login = useCallback(async (username: string, password: string) => {
    const result = await api.login(username, password);
    
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      
      const cartData = await api.getCart();
      setCart(cartData);
      
      const wishlistData = await api.getWishlist();
      setWishlist(wishlistData);
    }
    
    return result;
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    const result = await api.signup(username, email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCart([]);
    setWishlist([]);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('authToken');
  }, []);

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    if (isAuthenticated) {
      try {
        await api.addToCart(product.id, quantity);
        const cartData = await api.getCart();
        setCart(cartData);
      } catch (error) {
        console.error('Add to cart error:', error);
      }
    } else {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { id: Date.now(), product, quantity, ordered: false }];
      });
    }
  }, [isAuthenticated]);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addToWishlist = useCallback(async (product: Product) => {
    if (isAuthenticated) {
      try {
        await api.addToWishlist(product.id);
        const wishlistData = await api.getWishlist();
        setWishlist(wishlistData);
      } catch (error) {
        console.error('Add to wishlist error:', error);
      }
    } else {
      setWishlist((prevWishlist) => {
        const exists = prevWishlist.find((item) => item.product.id === product.id);
        if (!exists) {
          return [...prevWishlist, { id: Date.now(), product, user: user?.id || 0 }];
        }
        return prevWishlist;
      });
    }
  }, [isAuthenticated, user]);

  const removeFromWishlist = useCallback((itemId: number) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== itemId));
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => {
      return wishlist.some((item) => item.product.id === productId);
    },
    [wishlist]
  );

  const likeProduct = useCallback(
    (productId: number) => {
      queryClient.setQueryData(['products'], (old: Product[] | undefined) => {
        if (!old) return old;
        return old.map((p) => (p.id === productId ? { ...p, likes: p.likes + 1 } : p));
      });
    },
    [queryClient]
  );

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      signup,
      logout,
      products: productsQuery.data || [],
      isLoadingProducts: productsQuery.isLoading,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      likeProduct,
    }),
    [
      user,
      isAuthenticated,
      login,
      signup,
      logout,
      productsQuery.data,
      productsQuery.isLoading,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      likeProduct,
    ]
  );
});
