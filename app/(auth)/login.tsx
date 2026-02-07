import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/color";
import { AppUserRoles } from "@/global/enums";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TENANT_KEY, useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
  const selectedTenantName = useAuthStore((state) => state.selectedTenantName);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ phone: "", password: "" });

  const buttonScale = useSharedValue(1);

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
    return valid;
  };

  const handleLogin = async () => {
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
        if (role === AppUserRoles.ROLE_MEMBER) {
          router.replace("/(tabs)");
        } else if (role === AppUserRoles.ROLE_ADMIN) {
          router.replace("/(admin)");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error) {
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
      {/* Clean Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? [colors.background, colors.background]
            : ["#FFF8F5", "#FFF0E8", colors.background]
        }
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Animated.View
            entering={FadeIn.delay(200).duration(500)}
            style={[
              styles.logoWrapper,
              {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, "#FF8C5A"]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="barbell-sharp" size={36} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(300).duration(500)}
            style={[styles.title, { color: colors.text }]}
          >
            Welcome Back
          </Animated.Text>

          {selectedTenantName ? (
            <Animated.View
              entering={FadeInDown.delay(400).duration(500)}
              style={[
                styles.gymBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 107, 53, 0.15)"
                    : "rgba(255, 107, 53, 0.1)",
                  borderColor: `${colors.primary}40`,
                },
              ]}
            >
              <View style={[styles.gymIconWrapper, { backgroundColor: colors.primary }]}>
                <Ionicons name="barbell" size={12} color="#FFFFFF" />
              </View>
              <Text style={[styles.gymBadgeText, { color: colors.text }]}>
                {selectedTenantName}
              </Text>
              <TouchableOpacity
                onPress={handleChangeGym}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.changeGymButton}
              >
                <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
              </TouchableOpacity>
            </Animated.View>
          ) : null}

          <Animated.Text
            entering={FadeInUp.delay(500).duration(500)}
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Sign in to continue to your gym
          </Animated.Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.formCardWrapper}
        >
          <LinearGradient
            colors={
              isDark
                ? ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]
                : ["#FFFFFF", "#FFFFFF"]
            }
            style={[
              styles.formCard,
              {
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.06)",
                shadowColor: isDark ? "#000000" : "rgba(0, 0, 0, 0.1)",
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

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.9}
                  onPressIn={() => {
                    buttonScale.value = withSpring(0.97);
                  }}
                  onPressOut={() => {
                    buttonScale.value = withSpring(1);
                  }}
                >
                  <LinearGradient
                    colors={
                      isLoading
                        ? ["#CCCCCC", "#999999"]
                        : [colors.primary, "#FF8C5A"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.loginButton,
                      {
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                      },
                    ]}
                  >
                    {isLoading ? (
                      <View style={styles.buttonContent}>
                        <Ionicons name="hourglass-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.loginButtonText}>Logging in...</Text>
                      </View>
                    ) : (
                      <Text style={styles.loginButtonText}>Login</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Change Gym Link */}
              {!selectedTenantName && (
                <TouchableOpacity
                  style={styles.changeGymLink}
                  onPress={handleChangeGym}
                  disabled={isLoading}
                >
                  <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.changeGymLinkText, { color: colors.textSecondary }]}>
                    Select your gym
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Info Section */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(500)}
          style={styles.infoSection}
        >
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark
                  ? "rgba(255, 107, 53, 0.08)"
                  : "rgba(255, 107, 53, 0.05)",
                borderColor: isDark
                  ? "rgba(255, 107, 53, 0.2)"
                  : "rgba(255, 107, 53, 0.15)",
              },
            ]}
          >
            <View
              style={[
                styles.infoIconWrapper,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Ionicons name="information-circle" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Don't have an account?
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Contact your gym administrator. Accounts are created from{" "}
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  gymudaan.com
                </Text>
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxl + SPACING.xl,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: SPACING.xxxl + SPACING.sm,
  },
  logoWrapper: {
    marginBottom: SPACING.xl,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
  },
  logoGradient: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  gymBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + SPACING.xs,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  gymIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  gymBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  changeGymButton: {
    padding: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },

  // Form Card
  formCardWrapper: {
    marginBottom: SPACING.xxl,
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  formContent: {
    padding: SPACING.xxl + SPACING.xs,
    gap: SPACING.lg,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -SPACING.xs,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    paddingVertical: SPACING.lg + SPACING.xs,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 16,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  changeGymLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  changeGymLinkText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Info Section
  infoSection: {
    marginBottom: SPACING.xl,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.lg,
    borderRadius: 16,
    gap: SPACING.md,
    borderWidth: 1,
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
  },
});