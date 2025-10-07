import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Heart, ShoppingCart, TrendingUp } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - SPACING.md * 2;

const heroSlides = [
  {
    id: 1,
    title: 'Winter Collection',
    subtitle: '2025',
    description: 'Stay warm and stylish',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    color: '#4A90E2',
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Fresh Styles',
    description: 'Discover the latest trends',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    color: '#E94B3C',
  },
  {
    id: 3,
    title: 'Special Offers',
    subtitle: 'Up to 50% Off',
    description: 'Limited time deals',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
    color: '#6C5CE7',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { products, addToCart, addToWishlist, isInWishlist, likeProduct, cartItemCount } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const sliderRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % heroSlides.length;
        sliderRef.current?.scrollTo({ x: next * SLIDER_WIDTH, animated: true });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderHeroSlide = (slide: typeof heroSlides[0], index: number) => (
    <View key={slide.id} style={[styles.slide, { width: SLIDER_WIDTH }]}>
      <Image source={{ uri: slide.image }} style={styles.slideImage} />
      <View style={[styles.slideOverlay, { backgroundColor: slide.color + '99' }]}>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDescription}>{slide.description}</Text>
        <TouchableOpacity style={styles.slideButton}>
          <Text style={styles.slideButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
            <Text style={styles.likesText}>{item.likes > 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome to</Text>
          <Text style={styles.headerTitle}>Abami XStore</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(tabs)/cart')}>
          <ShoppingCart size={24} color={COLORS.primary} />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/search' as any)}
        activeOpacity={0.7}
      >
        <Search size={20} color={COLORS.gray} />
        <Text style={styles.searchPlaceholder}>Search products...</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
            })}
            scrollEventThrottle={16}
            style={styles.slider}
          >
            {heroSlides.map(renderHeroSlide)}
          </ScrollView>
          <View style={styles.pagination}>
            {heroSlides.map((_, index) => (
              <View
                key={index}
                style={[styles.paginationDot, currentSlide === index && styles.paginationDotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Trending Products</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={products.slice(0, 6)}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerGreeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  heroSection: {
    marginBottom: SPACING.lg,
  },
  slider: {
    marginHorizontal: SPACING.md,
  },
  slide: {
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  slideSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  slideTitle: {
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  slideDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  slideButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  slideButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.grayLight,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  section: {
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
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
});
