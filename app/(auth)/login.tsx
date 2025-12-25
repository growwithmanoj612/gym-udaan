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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // ✅ Zustand store with standard selectors
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);
  const selectTenant = useAuthStore((state) => state.selectTenant);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ phone: "", password: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { phone: "", password: "" };

    if (!phoneNumber || phoneNumber.length < 10) {
      newErrors.phone = "Please enter a valid phone number";
      valid = false;
    }

    // if (!password || password.length < 6) {
    //   newErrors.password = "Password must be at least 6 characters";
    //   valid = false;
    // }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    if (!selectedTenantId) {
      const tenantId = await AsyncStorage.getItem(TENANT_KEY) || "";
      selectTenant(tenantId);
      // setErrors({ ...errors, phone: "Please select a gym first" });
      return;
    }

    try {
      const role = await login({
        userName: phoneNumber,
        password,
        businessDetailsId: parseInt(selectedTenantId)
      });

      if (role) {
        console.log("Login successful");
        // Navigation is handled by root layout based on auth state

        console.log("appuser role in login is " + role)
        if (role === AppUserRoles.ROLE_MEMBER) {
          router.replace("/(tabs)");
        } else if (role === AppUserRoles.ROLE_ADMIN) {
          router.replace("/(admin)");
        }
        else {
          // Fallback: default to member if role is unknown
          router.replace("/(tabs)");
        }




      }


    } catch (error) {
      // Error is already handled by store with toast
      console.error("Login error:", error);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Please contact your gym administrator to reset your password.",
      [{ text: "OK", style: "default" }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="barbell" size={40} color="#FFFFFF" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Login to continue your fitness journey
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Input
            label="Phone Number"
            placeholder="9812345015"
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
            <Text
              style={[styles.forgotPasswordText, { color: colors.primary }]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="LOGIN"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 24,
  },
});