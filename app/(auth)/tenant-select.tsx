import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/store/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TenantSelect() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { selectTenant } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  const gyms = [
    {
      id: "gym-fitness-hub",
      name: "Gym Udaan Fitness Hub",
      location: "3 Venues",
      status: "Active",
      members: 245,
      icon: "fitness",
    },
    {
      id: "gym-power-zone",
      name: "Gym Udaan Power Zone",
      location: "5 Venues",
      status: "Active",
      members: 380,
      icon: "barbell",
    },
    {
      id: "gym-elite",
      name: "Gym Udaan Elite",
      location: "2 Venues",
      status: "Coming Soon",
      members: 120,
      icon: "trophy",
    },
  ];

  // FILTER GYMS BASED ON SEARCH
  const filteredGyms = useMemo(() => {
    if (!searchQuery.trim()) return gyms;
    return gyms.filter((gym) =>
      `${gym.name} ${gym.location} ${gym.status}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectGym = (gymId: string) => {
    selectTenant(gymId);
    router.replace("/(auth)/login");
  };

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

        {/* 🔍 Search Bar */}
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
            <Text style={{ textAlign: "center", color: colors.textSecondary }}>
              No gyms found
            </Text>
          ) : (
            filteredGyms.map((gym) => (
              <TouchableOpacity
                key={gym.id}
                onPress={() => handleSelectGym(gym.id)}
                activeOpacity={0.7}
                disabled={gym.status === "Coming Soon"}
              >
                <Card
                  elevated
                  style={[
                    styles.gymCard,
                    gym.status === "Coming Soon" && styles.disabledCard,
                  ]}
                >
                  <View style={styles.gymCardHeader}>
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      style={styles.gymIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons
                        name={gym.icon as any}
                        size={24}
                        color="#FFFFFF"
                      />
                    </LinearGradient>

                    <View style={styles.gymInfo}>
                      <Text style={[styles.gymName, { color: colors.text }]}>
                        {gym.name}
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
                          {gym.location}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            gym.status === "Active"
                              ? colors.successLight
                              : colors.warningLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              gym.status === "Active"
                                ? colors.success
                                : colors.warning,
                          },
                        ]}
                      >
                        {gym.status}
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
                      <Text
                        style={[
                          styles.statText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {gym.members} Members
                      </Text>
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
  container: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40 },

  // Search bar
  searchInput: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 20,
  },

  header: { alignItems: "center", marginBottom: 32 },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: "center", maxWidth: 280 },

  gymsContainer: { gap: 16, marginBottom: 24 },
  gymCard: { padding: 16 },
  disabledCard: { opacity: 0.6 },

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

  gymInfo: { flex: 1 },
  gymName: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  gymMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  gymLocation: { fontSize: 13 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },

  gymCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },

  statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontSize: 13 },

  infoCard: { padding: 16 },
  infoContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
