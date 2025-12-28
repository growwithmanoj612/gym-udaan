import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View, Image,
} from "react-native";

export default function TenantSelect() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // ✅ Zustand stores with standard selectors
  const selectTenant = useAuthStore((state) => state.selectTenant);
  const gyms = useBusinessStore((state) => state.businessDetails);
  const fetchGyms = useBusinessStore((state) => state.fetchBusinessDetails);
  const isLoading = useBusinessStore((state) => state.isLoading);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchGyms();
  }, []);

  // Filter gyms based on search
  const filteredGyms = gyms.filter((gym) =>
    `${gym?.businessName} ${gym?.businessAddress}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleSelectGym = async (gymId: string) => {
    await selectTenant(gymId);
    router.replace("/(auth)/login");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading gyms...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.headerIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="business" size={32} color="#FFFFFF" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>
            Select Your Gym
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose the gym location you want to join
          </Text>
        </View>

        {/* Search Bar */}
        <TextInput
          placeholder="Search gyms..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.searchInput,
            { backgroundColor: colors.card, color: colors.text },
          ]}
        />

        {/* Gym Cards */}
        <View style={styles.gymsContainer}>
          {filteredGyms.length === 0 ? (
            <Text style={[styles.noResults, { color: colors.textSecondary }]}>
              No gyms found
            </Text>
          ) : (
            filteredGyms.map((gym) => (
              <TouchableOpacity
                key={gym?.id}
                onPress={() => handleSelectGym(gym?.id?.toString())}
                activeOpacity={0.7}
              // disabled={gym?.status !== 'ACTIVE'}
              >
                <Card
                  elevated
                  style={[
                    styles.gymCard,
                    // gym?.status !== 'ACTIVE' && styles.disabledCard,
                  ]}
                >
                  <View style={styles.gymCardHeader}>
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      style={styles.gymIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Image
                        source={gym?.imageName ? { uri: gym?.imageName } : require('../../assets/images/android-icon-foreground.png')}  // Replace './placeholder.png' with your local fallback image path
                        style={{ width: 32, height: 32, borderRadius: 6 }}
                        resizeMode="cover"
                      />

                    </LinearGradient>

                    <View style={styles.gymInfo}>
                      <Text style={[styles.gymName, { color: colors.text }]}>

                        
                        {gym?.businessName}
                      </Text>

                      <View style={styles.gymMeta}>
                        <Ionicons
                          name="location"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.gymLocation,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {gym?.businessAddress}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            colors.successLight

                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              colors.success

                          },
                        ]}
                      >

                      </Text>
                    </View>
                  </View>

                  <View style={styles.gymCardFooter}>
                    <View style={styles.statItem}>
                      <Ionicons
                        name="people"
                        size={18}
                        color={colors.primary}
                      />

                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textTertiary}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  searchInput: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280
  },
  noResults: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
  },
  gymsContainer: {
    gap: 16,
    marginBottom: 24
  },
  gymCard: {
    padding: 16
  },
  disabledCard: {
    opacity: 0.6
  },
  gymCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  gymIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  gymInfo: {
    flex: 1
  },
  gymName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  },
  gymMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  gymLocation: {
    fontSize: 13
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600"
  },
  gymCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  statText: {
    fontSize: 13
  },
});