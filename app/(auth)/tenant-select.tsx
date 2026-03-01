import { Colors } from "@/constants/color";
import { IBusinessDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(150 + index * 80).duration(500).springify()}
      style={[
        styles.gymCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border + '60',
          shadowColor: colors.shadow,
        },
        animatedStyle,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[`${colors.primary}08`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.gymCardContent}>
          <View
            style={[
              styles.gymAvatar,
              {
                backgroundColor: `${colors.primary}10`,
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
              <View style={[styles.locationBadge, { backgroundColor: `${colors.primary}12` }]}>
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
                {gym?.businessAddress || "Unknown location"}
              </Text>
            </View>
          </View>

          <View style={[styles.selectIndicator, { backgroundColor: colors.text }]}>
            <Ionicons name="arrow-forward" size={18} color={colors.background} />
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
  const gyms = useBusinessStore((state) => state.businessDetails);
  const fetchGyms = useBusinessStore((state) => state.fetchBusinessDetails);
  const isLoading = useBusinessStore((state) => state.isLoading);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const pulseValue = useSharedValue(1);

  useEffect(() => {
    fetchGyms();
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const filteredGyms = gyms.filter((gym) =>
    `${gym?.businessName} ${gym?.businessAddress}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleSelectGym = async (gym: IBusinessDetails) => {
    await selectTenant(gym?.id?.toString(), gym);
    router.replace("/(auth)/login");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={
              isDark
                ? [colors.background, colors.primary + '1A', colors.background]
                : [colors.background, colors.primary + '12', colors.background]
            }
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingIconWrapper, { backgroundColor: `${colors.primary}15` }, pulseStyle]}>
            <Ionicons name="compass" size={40} color={colors.primary} style={{ position: 'absolute' }} />
            <ActivityIndicator size="large" color={colors.primary} style={{ position: 'absolute' }} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Locating Facilities...
          </Text>
          <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
            Connecting to the Gym Udaan network
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={
            isDark
              ? [colors.background, colors.primary + '10', colors.background]
              : [colors.background, colors.primary + '0A', colors.background]
          }
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Animated.View style={[styles.glowSphere, styles.glowTop, { backgroundColor: colors.primary }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
          <View style={[styles.headerIconWrapper, { backgroundColor: colors.card, borderColor: colors.border + '60' }]}>
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.primary}05`]}
              style={styles.headerIconGradient}
            >
              <Ionicons name="barbell-sharp" size={32} color={colors.primary} />
            </LinearGradient>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Select Your{"\n"}
            <Text style={{ color: colors.primary }}>Gym.</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            select the gym where your membership is active to proceed.
          </Text>
        </Animated.View>

        {/* Search Input */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600).springify()}
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.card,
              borderColor: isFocused ? colors.primary : colors.border + '60',
              shadowColor: isFocused ? colors.primary : '#000',
            },
          ]}
        >
          <View style={[styles.searchIconWrapper, { backgroundColor: isFocused ? `${colors.primary}15` : 'transparent' }]}>
            <Ionicons name="search" size={20} color={isFocused ? colors.primary : colors.textTertiary} />
          </View>
          <TextInput
            placeholder="Search by name or city..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setSearchQuery("");
              }}
              style={[styles.clearButton, { backgroundColor: `${colors.textTertiary}15` }]}
            >
              <Ionicons name="close" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Gym List */}
        <View style={styles.gymsContainer}>
          {filteredGyms.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(200).duration(500).springify()}
              style={[
                styles.emptyState,
                { backgroundColor: colors.card, borderColor: colors.border + '60' },
              ]}
            >
              <LinearGradient
                colors={[`${colors.primary}08`, 'transparent']}
                style={styles.emptyStateGradient}
              >
                <View style={[styles.emptyIconWrapper, { backgroundColor: `${colors.primary}12` }]}>
                  <Ionicons name="map-outline" size={36} color={colors.textTertiary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Facilities Found
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {searchQuery
                    ? "We couldn't find a match. Adjust your search parameters."
                    : "There are currently no gym facilities listed in the network."
                  }
                </Text>
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
  glowSphere: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderRadius: SCREEN_WIDTH * 0.75,
    opacity: 0.1,
  },
  glowTop: {
    top: -SCREEN_WIDTH * 0.8,
    left: -SCREEN_WIDTH * 0.8,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  loadingSubtext: {
    fontSize: 15,
    fontWeight: "500",
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 40,
    paddingTop: 16,
  },
  headerIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  headerIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    maxWidth: '96%',
    opacity: 0.85,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  searchIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 10,
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymsContainer: {
    gap: 16,
  },
  gymCard: {
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  cardGradient: {
    width: '100%',
  },
  gymCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  gymAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
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
    marginLeft: 16,
  },
  gymName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  gymLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationBadge: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymLocation: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  selectIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyState: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 16,
  },
  emptyStateGradient: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
  },
});