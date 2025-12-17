import React from 'react';
import Toast, { BaseToast, ErrorToast, InfoToast, ToastProps } from 'react-native-toast-message';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const toastConfig = {
    success: (props: ToastProps) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: colors.success || '#10b981',
          backgroundColor: colors.card || '#ffffff',
          borderLeftWidth: 5,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors. text || '#000000',
        }}
        text2Style={{
          fontSize: 14,
          color: colors.textSecondary || '#666666',
        }}
      />
    ),
    error: (props: ToastProps) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor:  colors.error || '#ef4444',
          backgroundColor: colors.card || '#ffffff',
          borderLeftWidth: 5,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text || '#000000',
        }}
        text2Style={{
          fontSize: 14,
          color: colors.textSecondary || '#666666',
        }}
      />
    ),
    info: (props: ToastProps) => (
      <InfoToast
        {...props}
        style={{
          borderLeftColor: colors.primary || '#3b82f6',
          backgroundColor: colors.card || '#ffffff',
          borderLeftWidth: 5,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors. text || '#000000',
        }}
        text2Style={{
          fontSize: 14,
          color: colors.textSecondary || '#666666',
        }}
      />
    ),
    warning: (props: ToastProps) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor:  colors.warning || '#f59e0b',
          backgroundColor: colors.card || '#ffffff',
          borderLeftWidth: 5,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text || '#000000',
        }}
        text2Style={{
          fontSize:  14,
          color: colors.textSecondary || '#666666',
        }}
      />
    ),
  };

  return (
    <>
      {children}
      <Toast config={toastConfig} />
    </>
  );
};

// Export toast utility
export { default as toast } from 'react-native-toast-message';