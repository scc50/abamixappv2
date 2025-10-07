import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Heart, ShoppingCart, X } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const { products, addToCart, addToWishlist, isInWishlist, likeProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Winter Collection',
    'Shoes',
    'Accessories',
  ]);

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.typ.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches([query.trim(), ...recentSearches.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter((s) => s !== search));
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.discount - item.price) / item.discount) * 100)}% OFF
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => addToWishlist(item)}
        >
          <Heart
            size={20}
            color={isInWishlist(item.id) ? COLORS.danger : COLORS.white}
            fill={isInWishlist(item.id) ? COLORS.danger : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.productPriceRow}>
          <View>
            <Text style={styles.productPrice}>{item.price.toLocaleString()} RWF</Text>
            {item.discount && (
              <Text style={styles.productDiscount}>{item.discount.toLocaleString()} RWF</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(item, 1)}
          >
            <ShoppingCart size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.productFooter}>
          <TouchableOpacity onPress={() => likeProduct(item.id)} style={styles.likeButton}>
            <Heart size={14} color={COLORS.danger} />
            <Text style={styles.likesText}>
              {item.likes > 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length === 0 ? (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <View key={index} style={styles.recentSearchItem}>
              <TouchableOpacity
                style={styles.recentSearchButton}
                onPress={() => handleSearch(search)}
              >
                <Search size={16} color={COLORS.gray} />
                <Text style={styles.recentSearchText}>{search}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                <X size={16} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
          </Text>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  recentSearchesContainer: {
    padding: SPACING.md,
  },
  recentSearchesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  recentSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recentSearchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recentSearchText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  productCard: {
    width: (width - SPACING.md * 3) / 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    height: 36,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productDiscount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
});
