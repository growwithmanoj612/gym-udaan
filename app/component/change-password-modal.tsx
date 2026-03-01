import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { toast } from "@/providers/toast-provider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => void;
  isSubmitting: boolean;
}

export default function ChangePasswordModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: ChangePasswordModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields.",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast.show({
        type: "error",
        text1: "Error",
        text2: "New password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.show({
        type: "error",
        text1: "Error",
        text2: "New passwords do not match.",
      });
      return;
    }
    onSubmit(oldPassword, newPassword, confirmPassword);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    onClose();
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFocusedField(null);
  };

  const isFormValid =
    oldPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => { }} style={{ width: '100%' }}>
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              style={[
                styles.modal,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              {/* Header with gradient accent */}
              <View style={styles.headerSection}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.headerIconBg}
                >
                  <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                </LinearGradient>

                <View style={styles.headerText}>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Change Password
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Keep your account secure
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleClose}
                  style={[
                    styles.closeButton,
                    { backgroundColor: colors.backgroundSecondary },
                  ]}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              {/* Form Fields */}
              <View style={styles.formSection}>
                {/* Current Password */}
                <View style={styles.fieldContainer}>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Current Password
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderColor:
                          focusedField === "old"
                            ? colors.primary
                            : colors.border,
                        backgroundColor:
                          focusedField === "old"
                            ? `${colors.primary}06`
                            : colors.backgroundSecondary,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.inputIcon,
                        {
                          backgroundColor:
                            focusedField === "old"
                              ? `${colors.primary}15`
                              : `${colors.textTertiary}12`,
                        },
                      ]}
                    >
                      <Ionicons
                        name="lock-closed"
                        size={16}
                        color={
                          focusedField === "old"
                            ? colors.primary
                            : colors.textTertiary
                        }
                      />
                    </View>
                    <TextInput
                      secureTextEntry={!showOld}
                      placeholder="Enter current password"
                      placeholderTextColor={colors.textTertiary}
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      onFocus={() => setFocusedField("old")}
                      onBlur={() => setFocusedField(null)}
                      style={[styles.input, { color: colors.text }]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowOld(!showOld)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showOld ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.fieldContainer}>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    New Password
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderColor:
                          focusedField === "new"
                            ? colors.primary
                            : colors.border,
                        backgroundColor:
                          focusedField === "new"
                            ? `${colors.primary}06`
                            : colors.backgroundSecondary,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.inputIcon,
                        {
                          backgroundColor:
                            focusedField === "new"
                              ? `${colors.primary}15`
                              : `${colors.textTertiary}12`,
                        },
                      ]}
                    >
                      <Ionicons
                        name="key"
                        size={16}
                        color={
                          focusedField === "new"
                            ? colors.primary
                            : colors.textTertiary
                        }
                      />
                    </View>
                    <TextInput
                      secureTextEntry={!showNew}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.textTertiary}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      onFocus={() => setFocusedField("new")}
                      onBlur={() => setFocusedField(null)}
                      style={[styles.input, { color: colors.text }]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNew(!showNew)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showNew ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                  {/* Password strength hint */}
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <View style={styles.hintRow}>
                      <Ionicons
                        name="alert-circle"
                        size={13}
                        color={colors.warning}
                      />
                      <Text
                        style={[styles.hintText, { color: colors.warning }]}
                      >
                        Must be at least 6 characters
                      </Text>
                    </View>
                  )}
                  {newPassword.length >= 6 && (
                    <View style={styles.hintRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color={colors.success}
                      />
                      <Text
                        style={[styles.hintText, { color: colors.success }]}
                      >
                        Password length looks good
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.fieldContainer}>
                  <Text
                    style={[styles.fieldLabel, { color: colors.textSecondary }]}
                  >
                    Confirm New Password
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderColor: passwordsMismatch
                          ? colors.error
                          : passwordsMatch
                            ? colors.success
                            : focusedField === "confirm"
                              ? colors.primary
                              : colors.border,
                        backgroundColor:
                          focusedField === "confirm"
                            ? `${colors.primary}06`
                            : colors.backgroundSecondary,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.inputIcon,
                        {
                          backgroundColor: passwordsMismatch
                            ? `${colors.error}15`
                            : passwordsMatch
                              ? `${colors.success}15`
                              : focusedField === "confirm"
                                ? `${colors.primary}15`
                                : `${colors.textTertiary}12`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          passwordsMatch
                            ? "checkmark-circle"
                            : "shield-half"
                        }
                        size={16}
                        color={
                          passwordsMismatch
                            ? colors.error
                            : passwordsMatch
                              ? colors.success
                              : focusedField === "confirm"
                                ? colors.primary
                                : colors.textTertiary
                        }
                      />
                    </View>
                    <TextInput
                      secureTextEntry={!showConfirm}
                      placeholder="Re-enter new password"
                      placeholderTextColor={colors.textTertiary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setFocusedField("confirm")}
                      onBlur={() => setFocusedField(null)}
                      style={[styles.input, { color: colors.text }]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirm(!showConfirm)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showConfirm ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordsMismatch && (
                    <View style={styles.hintRow}>
                      <Ionicons
                        name="close-circle"
                        size={13}
                        color={colors.error}
                      />
                      <Text style={[styles.hintText, { color: colors.error }]}>
                        Passwords do not match
                      </Text>
                    </View>
                  )}
                  {passwordsMatch && (
                    <View style={styles.hintRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color={colors.success}
                      />
                      <Text
                        style={[styles.hintText, { color: colors.success }]}
                      >
                        Passwords match
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonSection}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    {
                      opacity: !isFormValid || isSubmitting ? 0.5 : 1,
                    },
                  ]}
                  onPress={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.submitButtonText}>Update</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  modal: {
    width: "100%",
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },

  // ── Header ──
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  // ── Form ──
  formSection: {
    paddingHorizontal: 20,
    gap: 18,
    marginBottom: 24,
  },
  fieldContainer: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: Platform.OS === "ios" ? 4 : 2,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
  },
  eyeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 2,
    marginTop: 2,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ── Buttons ──
  buttonSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1.5,
    borderRadius: 14,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});