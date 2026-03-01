import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/color";
import { AppUserRoles } from "@/global/enums";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TENANT_KEY, useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);
  const selectTenant = useAuthStore((state) => state.selectTenant);
  const selectedTenantDetails = useAuthStore((state) => state.selectedTenantDetails);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ phone: "", password: "" });

  const buttonScale = useSharedValue(1);
  const floatValue = useSharedValue(0);

  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2500 }),
        withTiming(8, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }],
  }));

  const validateForm = () => {
    let valid = true;
    const newErrors = { phone: "", password: "" };

    if (!phoneNumber.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (phoneNumber.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return valid;
  };

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateForm()) return;

    if (!selectedTenantId) {
      const tenantId = (await AsyncStorage.getItem(TENANT_KEY)) || "";
      if (tenantId) {
        selectTenant(tenantId);
      } else {
        Alert.alert(
          "Select Your Gym",
          "Please select your gym before logging in",
          [
            {
              text: "Select Gym",
              onPress: () => router.push("/(auth)/tenant-select"),
            },
          ]
        );
        return;
      }
    }

    try {
      const role = await login({
        userName: phoneNumber,
        password,
        businessDetailsId: parseInt(selectedTenantId!),
      });

      if (role) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (role === AppUserRoles.ROLE_MEMBER) {
          router.replace("/(tabs)");
        } else if (role === AppUserRoles.ROLE_ADMIN) {
          router.replace("/(admin)");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Login error:", error);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password?",
      "Please contact your gym administrator to reset your password.",
      [{ text: "Got it", style: "default" }]
    );
  };

  const handleChangeGym = () => {
    Haptics.selectionAsync();
    router.push("/(auth)/tenant-select");
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          <Animated.View style={[styles.headerIconWrapper, { backgroundColor: colors.card, borderColor: colors.border + '60' }, floatingStyle]}>
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.primary}05`]}
              style={styles.headerIconGradient}
            >
              <Ionicons name="lock-closed" size={32} color={colors.primary} />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome{"\n"}
            <Text style={{ color: colors.primary }}>Back.</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in below to access your fitness dashboard.
          </Text>
        </Animated.View>

        {/* Selected Gym Badge */}
        {selectedTenantDetails && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(500).springify()}
            style={[
              styles.gymBadge,
              {
                backgroundColor: colors.card,
                borderColor: colors.border + '50',
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={[styles.gymIconWrapper, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="business" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.gymBadgeLabel, { color: colors.textTertiary }]}>Logging into</Text>
              <Text style={[styles.gymBadgeText, { color: colors.text }]} numberOfLines={1}>
                {selectedTenantDetails.businessName?.replaceAll("_", " ")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleChangeGym}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.changeGymButton, { backgroundColor: colors.backgroundSecondary }]}
            >
              <Ionicons name="swap-horizontal" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Form Card */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(600).springify()}
          style={styles.formCardWrapper}
        >
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border + '40',
                shadowColor: isDark ? "#000" : colors.shadow,
              },
            ]}
          >
            <View style={styles.formContent}>
              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                leftIcon="call"
                error={errors.phone}
                maxLength={10}
                editable={!isLoading}
              />

              <View style={{ marginTop: 4 }}>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  leftIcon="lock-closed"
                  rightIcon={showPassword ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  error={errors.password}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Animated.View style={[buttonAnimatedStyle, { marginTop: 12 }]}>
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.9}
                  onPressIn={() => {
                    buttonScale.value = withSpring(0.96);
                  }}
                  onPressOut={() => {
                    buttonScale.value = withSpring(1);
                  }}
                >
                  <LinearGradient
                    colors={
                      isLoading
                        ? [colors.border, colors.borderLight]
                        : [colors.primary, colors.primaryLight]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButton}
                  >
                    {isLoading ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.loginButtonText}>Authenticating...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.loginButtonText}>Login securely</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Change Gym Link (Fallback if badge isn't available) */}
              {!selectedTenantDetails && (
                <TouchableOpacity
                  style={styles.changeGymLink}
                  onPress={handleChangeGym}
                  disabled={isLoading}
                >
                  <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.changeGymLinkText, { color: colors.textSecondary }]}>
                    Choose your facility first
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Info Section */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(600).springify()}
          style={styles.infoSection}
        >
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.primary + '0A',
                borderColor: colors.primary + '20',
              },
            ]}
          >
            <View
              style={[
                styles.infoIconWrapper,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="information" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Need an account?
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Contact your facility administrator. New memberships are provisioned directly via{" "}
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  gymudaan.com
                </Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    right: -SCREEN_WIDTH * 0.8,
  },
  scrollContent: {
    paddingHorizontal: 28,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 32,
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
  gymBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gymIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gymBadgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  gymBadgeText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  changeGymButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCardWrapper: {
    marginBottom: 24,
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 6,
  },
  formContent: {
    padding: 24,
    gap: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "700",
  },
  loginButton: {
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  changeGymLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  changeGymLinkText: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
  },
});