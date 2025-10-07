import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ShoppingCart } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';
import { mockProductTypes } from '@/services/api';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const { products, addToCart, addToWishlist, isInWishlist, likeProduct } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.typ === selectedCategory);

  const renderCategoryChip = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === category && styles.categoryChipTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {}}
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Products</Text>
        <Text style={styles.headerSubtitle}>{filteredProducts.length} items</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', ...mockProductTypes.map((t) => t.typ)]}
          renderItem={({ item }) => renderCategoryChip(item)}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.md,
  },
  categoriesList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.grayLight,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  productsList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
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
});
