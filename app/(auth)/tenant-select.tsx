import { Colors } from "@/constants/color";
import { IBusinessDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GymCardProps {
  gym: IBusinessDetails;
  onPress: () => void;
  index: number;
  colors: (typeof Colors)["light"] | (typeof Colors)["dark"];
}

const GymCard = ({ gym, onPress, index, colors }: GymCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(200 + index * 80).duration(400)}
      style={[
        styles.gymCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <LinearGradient
        colors={[`${colors.primary}05`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.gymCardContent}>
          <View
            style={[
              styles.gymAvatar,
              { 
                backgroundColor: `${colors.primary}15`,
                borderColor: `${colors.primary}20`,
              },
            ]}
          >
            {gym?.imageName ? (
              <Image
                source={{ uri: gym.imageName }}
                style={styles.gymAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.iconContainer}>
                <Ionicons name="barbell" size={28} color={colors.primary} />
              </View>
            )}
          </View>

          <View style={styles.gymInfo}>
            <Text
              style={[styles.gymName, { color: colors.text }]}
              numberOfLines={1}
            >
              {gym?.businessName?.replaceAll("_", " ")}
            </Text>
            <View style={styles.gymLocationRow}>
              <View style={[styles.locationBadge, { backgroundColor: `${colors.primary}10` }]}>
                <Ionicons
                  name="location"
                  size={12}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[styles.gymLocation, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {gym?.businessAddress || "No address"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.selectIndicator,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

export default function TenantSelect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const selectTenant = useAuthStore((state) => state.selectTenant);
  const selectTenantName = useAuthStore((state) => state.selectTenantName);
  const gyms = useBusinessStore((state) => state.businessDetails);
  const fetchGyms = useBusinessStore((state) => state.fetchBusinessDetails);
  const isLoading = useBusinessStore((state) => state.isLoading);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    fetchGyms();
  }, []);

  const filteredGyms = gyms.filter((gym) =>
    `${gym?.businessName} ${gym?.businessAddress}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleSelectGym = async (gym: IBusinessDetails) => {
    await selectTenant(gym?.id?.toString());
    if (gym?.businessName) {
      await selectTenantName(gym?.businessName?.replaceAll("_", " "));
    }
    router.replace("/(auth)/login");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={
            isDark
              ? ["rgba(255, 107, 53, 0.08)", "transparent"]
              : ["rgba(255, 107, 53, 0.05)", "transparent"]
          }
          style={styles.backgroundGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
        />
        <View style={styles.loadingContainer}>
          <View
            style={[
              styles.loadingIconWrapper,
              { backgroundColor: `${colors.primary}15` },
            ]}
          >
            <View style={styles.loadingIconInner}>
              <Ionicons name="barbell" size={36} color={colors.primary} />
            </View>
            <ActivityIndicator 
              size="large" 
              color={colors.primary} 
              style={styles.loadingSpinner}
            />
          </View>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Finding your gyms...
          </Text>
          <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
            Please wait a moment
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={
          isDark
            ? ["rgba(255, 107, 53, 0.08)", "transparent"]
            : ["rgba(255, 107, 53, 0.05)", "transparent"]
        }
        style={styles.backgroundGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.header}
        >
          <View
            style={[
              styles.headerIconWrapper,
              { 
                backgroundColor: `${colors.primary}12`,
                borderColor: `${colors.primary}20`,
              },
            ]}
          >
            <LinearGradient
              colors={[`${colors.primary}25`, `${colors.primary}15`]}
              style={styles.headerIconGradient}
            >
              <Ionicons name="barbell-sharp" size={36} color={colors.primary} />
            </LinearGradient>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Choose Your Gym
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select your gym to get started with your fitness journey
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(500)}
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.card,
              borderColor: isFocused ? colors.primary : colors.border,
              shadowColor: isFocused ? colors.primary : colors.shadow,
            },
          ]}
        >
          <View style={[
            styles.searchIconWrapper,
            { backgroundColor: isFocused ? `${colors.primary}12` : 'transparent' }
          ]}>
            <Ionicons
              name="search"
              size={20}
              color={isFocused ? colors.primary : colors.textTertiary}
            />
          </View>
          <TextInput
            placeholder="Search for your gym..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery("")}
              style={[styles.clearButton, { backgroundColor: `${colors.textTertiary}15` }]}
            >
              <Ionicons
                name="close"
                size={16}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

      

        {/* Gym List */}
        <View style={styles.gymsContainer}>
          {filteredGyms.length === 0 ? (
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={[
                styles.emptyState,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <LinearGradient
                colors={[`${colors.primary}08`, 'transparent']}
                style={styles.emptyStateGradient}
              >
                <View
                  style={[
                    styles.emptyIconWrapper,
                    { backgroundColor: `${colors.primary}12` },
                  ]}
                >
                  <Ionicons
                    name="fitness-outline"
                    size={40}
                    color={colors.textTertiary}
                  />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No gyms found
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: colors.textSecondary }]}
                >
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : "Can't find your gym? Contact your gym owner to register on GymUdaan"
                  }
                </Text>
                <View style={[styles.emptyHintBox, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }]}>
                  <Ionicons name="information-circle" size={16} color={colors.primary} />
                  <Text style={[styles.emptyHint, { color: colors.primary }]}>
                    Need help? Contact support
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ) : (
            filteredGyms.map((gym, index) => (
              <GymCard
                key={gym?.id}
                gym={gym}
                onPress={() => handleSelectGym(gym)}
                index={index}
                colors={colors}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxl + SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxxl,
  },
  loadingIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  loadingIconInner: {
    position: 'absolute',
  },
  loadingSpinner: {
    position: 'absolute',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  loadingSubtext: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: SPACING.xxl + SPACING.xs,
  },
  headerIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  headerIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: SPACING.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: SPACING.sm,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Results
  resultsHeader: {
    marginBottom: SPACING.md,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Gyms
  gymsContainer: {
    gap: SPACING.md,
  },
  gymCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    overflow: 'hidden',
  },
  cardGradient: {
    width: '100%',
  },
  gymCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
  },
  gymAvatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
  },
  gymAvatarImage: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  gymName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  gymLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  locationBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymLocation: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  selectIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginTop: SPACING.xl,
  },
  emptyStateGradient: {
    width: '100%',
    padding: SPACING.xxxl + SPACING.md,
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  emptyHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: SPACING.md,
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: "600",
  },
});