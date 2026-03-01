import { Colors } from '@/constants/color';
import { IItemDetails, IPlansDetails } from '@/global/interfaces';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useServicesStore } from '@/store/useServicesStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type TabType = 'plans' | 'store';
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

// ==================== MAIN COMPONENT ====================
export default function MemberServicesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Store
  const { gymPlans, gymItems, isLoadingPlans, isLoadingItems, fetchAll } = useServicesStore();

  const [activeTab, setActiveTab] = useState<TabType>('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on mount
  useFocusEffect(
    React.useCallback(() => {
      fetchAll();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  // Get unique categories from gym items
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(gymItems.map(p => p.category))];
    return cats;
  }, [gymItems]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return gymItems.filter(product => {
      const matchesSearch = product?.name?.toLowerCase().includes(searchQuery?.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product?.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [gymItems, searchQuery, selectedCategory]);

  // Get stock status
  const getStockStatus = (item: IItemDetails): StockStatus => {
    if (item?.stockQuantity <= 0) return 'Out of Stock';
    if (item?.stockQuantity <= item?.lowStockAlert) return 'Low Stock';
    return 'In Stock';
  };

  const getStockColor = (status: StockStatus) => {
    switch (status) {
      case 'In Stock':
        return '#10B981';
      case 'Low Stock':
        return '#F59E0B';
      case 'Out of Stock':
        return '#EF4444';
    }
  };

  // ==================== RENDER PLAN CARD ====================
  const renderPlanCard = ({ item, index }: { item: IPlansDetails; index: number }) => {
    const withOutDiscount = item?.price + item?.discount;
    const finalPrice = item?.price;
    const savings = item?.discount;
    const hasDiscount = savings > 0;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).duration(600).springify()}
        layout={Layout.springify()}
      >
        <View
          style={[
            styles.planCard,
            {
              backgroundColor: colors.card,
              borderColor: item?.isSelected ? colors.primary : 'transparent',
              shadowColor: isDark ? '#000' : '#000',
            },
          ]}
        >
          {/* Active Badge Overlay */}
          {item?.isSelected && (
            <View style={[styles.activeBadgeOverlay, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.activeBadgeText}>CURRENT PLAN</Text>
            </View>
          )}

          {/* Discount Badge */}
          {hasDiscount && !item?.isSelected && (
            <View style={styles.discountBadgeTop}>
              <Text style={styles.discountBadgeText}>SAVE Rs {savings}</Text>
            </View>
          )}

          {/* Plan Header */}
          <View style={styles.planCardHeader}>
            <View style={styles.planIconContainer}>
              <Ionicons name="barbell" size={24} color={colors.primary} />
            </View>
            <View style={styles.planHeaderInfo}>
              <Text style={[styles.planTitle, { color: colors.text }]} numberOfLines={2}>
                {item?.planName}
              </Text>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.durationText, { color: colors.textSecondary }]}>
                  {item?.durationInDays} Days Duration
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {item?.description && (
            <Text style={[styles.planDescription, { color: colors.textSecondary }]} numberOfLines={3}>
              {item?.description}
            </Text>
          )}

          {/* Facilities */}
          {item?.facilities && (
            <View style={styles.facilitiesSection}>
              <Text style={[styles.facilitiesTitle, { color: colors.textSecondary }]}>
                Includes:
              </Text>
              <Text style={[styles.facilitiesText, { color: colors.text }]}>
                {item?.facilities}
              </Text>
            </View>
          )}

          {/* Pricing Section */}
          <View style={[styles.pricingSection, { borderTopColor: colors.border }]}>
            {hasDiscount && (
              <View style={styles.originalPriceContainer}>
                <Text style={[styles.originalPriceLabel, { color: colors.textTertiary }]}>
                  Regular Price
                </Text>
                <Text style={[styles.originalPrice, { color: colors.textTertiary }]}>
                  Rs {withOutDiscount?.toLocaleString()}
                </Text>
              </View>
            )}
            
            <View style={styles.finalPriceRow}>
              <View style={styles.priceColumn}>
                <Text style={[styles.finalPriceLabel, { color: colors.textSecondary }]}>
                  {hasDiscount ? 'Special Price' : 'Price'}
                </Text>
                <Text style={[styles.finalPrice, { color: colors.primary }]}>
                  Rs {finalPrice?.toLocaleString()}
                </Text>
              </View>
            </View>

            {hasDiscount && (
              <View style={styles.savingsContainer}>
                <Ionicons name="pricetag" size={16} color="#10B981" />
                <Text style={styles.savingsText}>
                  You save Rs {savings?.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  // ==================== RENDER PRODUCT CARD ====================
  const renderProductCard = ({ item, index }: { item: IItemDetails; index: number }) => {
    const stockStatus = getStockStatus(item);
    const stockColor = getStockColor(stockStatus);
    const isOutOfStock = stockStatus === 'Out of Stock';

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 80).duration(500).springify()}
        layout={Layout.springify()}
        style={{ width: width - 40 }}
      >
        <View
          style={[
            styles.productCard,
            {
              backgroundColor: colors.card,
              shadowColor: isDark ? '#000' : '#000',
              opacity: isOutOfStock ? 0.65 : 1,
            },
          ]}
        >
          {/* Product Header */}
          <View style={styles.productCardHeader}>
            <View style={[styles.productIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="nutrition" size={22} color={colors.primary} />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
                {item?.name}
              </Text>
              
              {/* Category Badge */}
              <View style={[styles.categoryBadgeSmall, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
                  {item?.category}
                </Text>
              </View>
            </View>

            {/* Stock Status */}
            <View style={[styles.stockStatusBadge, { backgroundColor: stockColor + '20' }]}>
              <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
              <Text style={[styles.stockStatusText, { color: stockColor }]}>
                {stockStatus}
              </Text>
            </View>
          </View>

          {/* Stock Info */}
          {!isOutOfStock && (
            <View style={styles.stockInfoContainer}>
              <Ionicons name="archive-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.stockInfoText, { color: colors.textSecondary }]}>
                {item?.stockQuantity} {item?.primaryUnit} in stock
              </Text>
            </View>
          )}

          {/* Price Section */}
          <View style={[styles.productPricingSection, { borderTopColor: colors.border }]}>
            <View>
              <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>
                Selling Price
              </Text>
              <View style={styles.priceRow}>
                <Text style={[styles.currencySymbol, { color: colors.text }]}>Rs </Text>
                <Text style={[styles.productPrice, { color: colors.text }]}>
                  {item?.sp?.toLocaleString()}
                </Text>
                <Text style={[styles.perUnitText, { color: colors.textSecondary }]}>
                  /{item?.primaryUnit}
                </Text>
              </View>
            </View>

            {isOutOfStock && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  // ==================== RENDER EMPTY STATE ====================
  const renderEmptyState = (type: 'plans' | 'products') => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons
          name={type === 'plans' ? 'barbell-outline' : 'nutrition-outline'}
          size={48}
          color={colors.textTertiary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {type === 'plans' ? 'No Plans Available' : 'No Products Found'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {type === 'plans'
          ? 'New membership plans will appear here'
          : 'Try adjusting your search or filter criteria'}
      </Text>
    </View>
  );

  // ==================== RENDER LOADING STATE ====================
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Loading amazing offers...
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Enhanced Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Services</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Explore our offerings
            </Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Modern Tab Bar */}
      <View style={styles.tabBarContainer}>
        <View style={[styles.tabBar, { backgroundColor: colors.backgroundSecondary }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'plans' && [styles.activeTab, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('plans')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="barbell"
              size={22}
              color={activeTab === 'plans' ? '#fff' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'plans' ? '#fff' : colors.textSecondary },
                activeTab === 'plans' && styles.activeTabText,
              ]}
            >
              Gym Plans
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'store' && [styles.activeTab, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setActiveTab('store')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="nutrition"
              size={22}
              color={activeTab === 'store' ? '#fff' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'store' ? '#fff' : colors.textSecondary },
                activeTab === 'store' && styles.activeTabText,
              ]}
            >
              Store
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <FlatList
            data={gymPlans}
            renderItem={renderPlanCard}
            keyExtractor={(item) => item?.id?.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={isLoadingPlans ? renderLoading() : renderEmptyState('plans')}
          />
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <>
            {/* Enhanced Search and Filter */}
            <View style={styles.filterSection}>
              <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="search" size={20} color={colors.textTertiary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search supplements, protein..."
                  placeholderTextColor={colors.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipsContainer}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          selectedCategory === category ? colors.primary : colors.card,
                        borderColor: selectedCategory === category ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: selectedCategory === category ? '#fff' : colors.textSecondary,
                        },
                        selectedCategory === category && styles.activeCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={filteredProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item?.id?.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
              ListEmptyComponent={isLoadingItems ? renderLoading() : renderEmptyState('products')}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==================== ENHANCED STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },

  // Tab Bar Styles
  tabBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },

  listContent: {
    padding: 20,
    gap: 20,
  },

  // Plan Card Styles
  planCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  activeBadgeOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  discountBadgeTop: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  planHeaderInfo: {
    flex: 1,
    paddingRight: 8,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
    lineHeight: 26,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  facilitiesSection: {
    marginBottom: 20,
  },
  facilitiesTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  facilitiesText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  pricingSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  originalPriceContainer: {
    marginBottom: 4,
  },
  originalPriceLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalPrice: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  finalPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceColumn: {
    flex: 1,
  },
  finalPriceLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finalPrice: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  savingsText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },

  // Product Card Styles
  productCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  productCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  productIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 8,
    lineHeight: 24,
  },
  categoryBadgeSmall: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stockStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  stockStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stockInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  stockInfoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  productPricingSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
  },
  productPrice: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  perUnitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  outOfStockText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Filter Section Styles
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  categoryChipsContainer: {
    gap: 10,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
    fontWeight: '700',
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
  },
});