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
import {
  getFriendlyAuthErrorMessage,
  isRateLimitError,
  resendConfirmationEmail,
} from '../../services/authHelper';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    type: 'error' | 'success';
    message: string;
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

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setErrorMessage('');
    setIsRateLimited(false);
    setIsUnconfirmed(false);
    setResendStatus(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const rateLimit = isRateLimitError(error);
        setIsRateLimited(rateLimit);

        const errorMsg = (error.message || '').toLowerCase();
        if (errorMsg.includes('email not confirmed')) {
          setIsUnconfirmed(true);
        }

        setErrorMessage(getFriendlyAuthErrorMessage(error));
        return;
      }

      if (data.session) {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const rateLimit = isRateLimitError(err);
      setIsRateLimited(rateLimit);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendStatus(null);

    const result = await resendConfirmationEmail(email.trim());
    setIsResending(false);

    if (result.success) {
      setResendStatus({ type: 'success', message: result.message });
      setCooldown(60);
    } else {
      setResendStatus({ type: 'error', message: result.message });
      if (result.isRateLimit) {
        setCooldown(120);
      }
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue your competitive journey on Nexora.</Text>
          </View>

          {errorMessage ? (
            <View style={[styles.errorBanner, isRateLimited && styles.rateLimitBanner]}>
              <Ionicons
                name={isRateLimited ? 'time-outline' : 'alert-circle'}
                size={18}
                color={isRateLimited ? '#F59E0B' : '#EF4444'}
              />
              <Text style={[styles.errorBannerText, isRateLimited && styles.rateLimitText]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {isUnconfirmed && (
            <View style={styles.unconfirmedBox}>
              <View style={styles.unconfirmedHeader}>
                <Ionicons name="mail-outline" size={18} color="#818CF8" />
                <Text style={styles.unconfirmedTitle}>Confirmation Pending</Text>
              </View>
              <Text style={styles.unconfirmedText}>
                Need another activation email? Tap below to send a fresh link to {email.trim()}.
              </Text>

              {resendStatus && (
                <View
                  style={[
                    styles.resendStatusBanner,
                    resendStatus.type === 'error' ? styles.resendError : styles.resendSuccess,
                  ]}
                >
                  <Text
                    style={
                      resendStatus.type === 'error' ? styles.resendErrorText : styles.resendSuccessText
                    }
                  >
                    {resendStatus.message}
                  </Text>
                </View>
              )}

              <Button
                title={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Confirmation Email'}
                variant="secondary"
                size="sm"
                disabled={cooldown > 0 || isResending}
                loading={isResending}
                onPress={handleResend}
                style={styles.resendBtn}
              />
            </View>
          )}

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

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              title="Log In"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleLogin}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  rateLimitBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  errorBannerText: {
    color: '#F87171',
    fontSize: 13,
    flex: 1,
  },
  rateLimitText: {
    color: '#FBBF24',
  },
  unconfirmedBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  unconfirmedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  unconfirmedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.primaryLight,
  },
  unconfirmedText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  resendStatusBanner: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  resendError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  resendSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  resendErrorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  resendSuccessText: {
    color: '#10B981',
    fontSize: 12,
  },
  resendBtn: {
    width: '100%',
  },
  form: {
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: Colors.dark.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 18,
  },
  footerText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.dark.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
