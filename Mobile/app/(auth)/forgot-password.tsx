import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { supabase } from '../../services/supabase';
import { getFriendlyAuthErrorMessage, isRateLimitError } from '../../services/authHelper';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'error' | 'success';
    text: string;
    isRateLimit?: boolean;
  } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }

    if (cooldown > 0) return;

    setStatusMessage(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'nexora://auth-callback',
      });

      if (error) {
        const rateLimit = isRateLimitError(error);
        setStatusMessage({
          type: 'error',
          text: getFriendlyAuthErrorMessage(error),
          isRateLimit: rateLimit,
        });
        if (rateLimit) {
          setCooldown(120);
        }
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Password reset link sent! Please check your email inbox and spam folder.',
        });
        setCooldown(60);
      }
    } catch (err: any) {
      const rateLimit = isRateLimitError(err);
      setStatusMessage({
        type: 'error',
        text: getFriendlyAuthErrorMessage(err),
        isRateLimit: rateLimit,
      });
      if (rateLimit) {
        setCooldown(120);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we will send you instructions to reset your password.
            </Text>
          </View>

          {statusMessage ? (
            <View
              style={[
                styles.statusBanner,
                statusMessage.type === 'error'
                  ? statusMessage.isRateLimit
                    ? styles.rateLimitBanner
                    : styles.errorBanner
                  : styles.successBanner,
              ]}
            >
              <Ionicons
                name={
                  statusMessage.type === 'error'
                    ? statusMessage.isRateLimit
                      ? 'time-outline'
                      : 'alert-circle'
                    : 'checkmark-circle'
                }
                size={18}
                color={
                  statusMessage.type === 'error'
                    ? statusMessage.isRateLimit
                      ? '#F59E0B'
                      : '#EF4444'
                    : '#10B981'
                }
              />
              <Text
                style={[
                  styles.statusText,
                  statusMessage.type === 'error'
                    ? statusMessage.isRateLimit
                      ? styles.rateLimitText
                      : styles.errorText
                    : styles.successText,
                ]}
              >
                {statusMessage.text}
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />

            <Button
              title={cooldown > 0 ? `Resend available in ${cooldown}s` : 'Send Reset Instructions'}
              size="lg"
              loading={isLoading}
              disabled={isLoading || cooldown > 0}
              onPress={handleResetPassword}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.footerLink}>Back to Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  rateLimitBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusText: {
    fontSize: 13,
    flex: 1,
  },
  errorText: {
    color: '#F87171',
  },
  rateLimitText: {
    color: '#FBBF24',
  },
  successText: {
    color: '#34D399',
  },
  form: {
    flex: 1,
  },
  actionButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  footerLink: {
    color: Colors.dark.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
