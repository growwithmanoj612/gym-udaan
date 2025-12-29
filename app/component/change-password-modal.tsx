import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "@/providers/toast-provider"; // Adjust if your toast import differs

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string, confirmPassword: string) => void;
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

  const handleSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields.",
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
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Change Password
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            secureTextEntry
            placeholder="Current Password"
            placeholderTextColor={colors.textSecondary}
            value={oldPassword}
            onChangeText={setOldPassword}
            style={[
              styles.input,
              { borderColor: colors.textSecondary, color: colors.text },
            ]}
          />
          <TextInput
            secureTextEntry
            placeholder="New Password"
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            style={[
              styles.input,
              { borderColor: colors.textSecondary, color: colors.text },
            ]}
          />
          <TextInput
            secureTextEntry
            placeholder="Confirm New Password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[
              styles.input,
              { borderColor: colors.textSecondary, color: colors.text },
            ]}
          />

          <View style={styles.buttons}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              size="medium"
              style={[styles.button, { borderColor: colors.textSecondary }]}
              textStyle={{ color: colors.textSecondary }}
            />
            <Button
              title={isSubmitting ? "Changing..." : "Update"}
              onPress={handleSubmit}
              disabled={isSubmitting}
              variant="primary"
              size="medium"
              style={[
                styles.button,
                {
                  backgroundColor: isSubmitting
                    ? colors.textSecondary
                    : colors.primary,
                },
              ]}
              textStyle={{ color: "#FFFFFF" }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});