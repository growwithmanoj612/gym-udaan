import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface ForceUpdateModalProps {
  visible:  boolean;
  message?:  string;
  onUpdate:  () => void;
}

export const ForceUpdateModal:  React.FC<ForceUpdateModalProps> = ({  
  visible,
  message = 'A new version is available.  Please update to continue using the app.',
  onUpdate,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <Animated.View 
          entering={ZoomIn. delay(200).springify()}
          style={styles.content}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="rocket" size={80} color="#FFFFFF" />
          </View>

          {/* Title */}
          <Animated.Text 
            entering={FadeIn.delay(400)}
            style={styles.title}
          >
            Update Available!  🎉
          </Animated.Text>

          {/* Message */}
          <Animated.Text 
            entering={FadeIn. delay(600)}
            style={styles.message}
          >
            {message}
          </Animated.Text>

          {/* Features List (Optional) */}
          <Animated.View 
            entering={FadeIn.delay(800)}
            style={styles.featuresList}
          >
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
              <Text style={styles.featureText}>New features & improvements</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
              <Text style={styles.featureText}>Bug fixes & performance boost</Text>
            </View>
            <View style={styles. featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
              <Text style={styles.featureText}>Enhanced security</Text>
            </View>
          </Animated.View>

          {/* Update Button */}
          <Animated.View entering={FadeIn.delay(1000)} style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={onUpdate}
              activeOpacity={0.8}
            >
              <Text style={styles.updateButtonText}>Update Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#667eea" />
            </TouchableOpacity>
          </Animated.View>

          {/* App Version Info */}
          <Text style={styles.versionText}>
            Current version may be outdated
          </Text>
        </Animated.View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content:  {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title:  {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featuresList: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection:  'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
  },
  updateButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 8,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    textAlign: 'center',
  },
});