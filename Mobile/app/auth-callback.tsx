import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { supabase } from '../services/supabase';
import { parseAuthUrl, getFriendlyAuthErrorMessage, resendConfirmationEmail } from '../services/authHelper';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const rawParams = useLocalSearchParams();
  const url = Linking.useURL();
  const initialize = useAuthStore((state) => state.initialize);

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const timerRef = useRef<any>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;
    processAuthUrl();
  }, [url]);

  const processAuthUrl = async () => {
    try {
      const activeUrl = url || (await Linking.getInitialURL()) || '';
      const parsedFromUrl = parseAuthUrl(activeUrl);
      const combinedParams: Record<string, string> = {
        ...parsedFromUrl,
        ...(rawParams as Record<string, string>),
      };

      if (combinedParams.error || combinedParams.error_code) {
        setStatus('error');
        setErrorMessage(
          getFriendlyAuthErrorMessage({
            message: combinedParams.error_description || combinedParams.error_code || combinedParams.error,
          })
        );
        return;
      }

      if (combinedParams.access_token && combinedParams.refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: combinedParams.access_token,
          refresh_token: combinedParams.refresh_token,
        });

        if (error) {
          setStatus('error');
          setErrorMessage(getFriendlyAuthErrorMessage(error));
          return;
        }

        if (data.session) {
          setStatus('success');
          await initialize();
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1200);
          return;
        }
      }

      if (combinedParams.code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(combinedParams.code);
        if (error) {
          setStatus('error');
          setErrorMessage(getFriendlyAuthErrorMessage(error));
          return;
        }

        if (data.session) {
          setStatus('success');
          await initialize();
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1200);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus('success');
        await initialize();
        router.replace('/(tabs)');
      } else {
        setStatus('error');
        setErrorMessage('No authentication parameters were detected in this link.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    }
  };

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      setResendStatus({ type: 'error', message: 'Please enter your registered email address.' });
      return;
    }
    if (cooldown > 0) return;

    setIsResending(true);
    setResendStatus(null);

    const result = await resendConfirmationEmail(resendEmail.trim());
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
          <View style={styles.logoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="terminal" size={28} color="#818CF8" />
            </View>
            <Text style={styles.brandTitle}>NEXORA</Text>
          </View>

          {status === 'processing' && (
            <Card style={styles.card}>
              <ActivityIndicator size="large" color={Colors.dark.primaryLight} />
              <Text style={styles.cardTitle}>Verifying Your Account</Text>
              <Text style={styles.cardSubtitle}>
                Processing confirmation link and initializing your competitive programming profile...
              </Text>
            </Card>
          )}

          {status === 'success' && (
            <Card style={styles.card}>
              <View style={[styles.statusIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="checkmark-circle" size={44} color="#10B981" />
              </View>
              <Text style={styles.cardTitle}>Account Confirmed!</Text>
              <Text style={styles.cardSubtitle}>
                Your email has been verified successfully. Redirecting you to Nexora dashboard...
              </Text>
            </Card>
          )}

          {status === 'error' && (
            <Card style={styles.card}>
              <View style={[styles.statusIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="alert-circle" size={44} color="#EF4444" />
              </View>

              <Text style={styles.cardTitle}>Link Expired or Invalid</Text>
              <Text style={styles.cardSubtitle}>{errorMessage}</Text>

              <View style={styles.rateLimitNoteBox}>
                <Ionicons name="information-circle-outline" size={18} color="#818CF8" />
                <Text style={styles.rateLimitNoteText}>
                  Confirmation links expire after 24 hours and can only be used once. If you already verified, you can log in directly.
                </Text>
              </View>

              {resendStatus && (
                <View
                  style={[
                    styles.feedbackBanner,
                    resendStatus.type === 'error' ? styles.errorBanner : styles.successBanner,
                  ]}
                >
                  <Ionicons
                    name={resendStatus.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
                    size={18}
                    color={resendStatus.type === 'error' ? '#EF4444' : '#10B981'}
                  />
                  <Text
                    style={[
                      styles.feedbackText,
                      resendStatus.type === 'error' ? styles.errorText : styles.successText,
                    ]}
                  >
                    {resendStatus.message}
                  </Text>
                </View>
              )}

              <View style={styles.resendForm}>
                <Input
                  label="Registered Email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChangeText={setResendEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                />

                <Button
                  title={cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Confirmation Email'}
                  variant="primary"
                  size="md"
                  disabled={cooldown > 0 || isResending}
                  loading={isResending}
                  onPress={handleResend}
                  icon={cooldown === 0 ? <Ionicons name="mail" size={16} color="#FFFFFF" /> : undefined}
                  style={styles.resendBtn}
                />
              </View>

              <Button
                title="Go to Log In"
                variant="secondary"
                size="md"
                onPress={() => router.replace('/(auth)/login')}
                style={styles.loginBtn}
              />
            </Card>
          )}
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
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: 2,
  },
  card: {
    padding: 24,
    alignItems: 'center',
  },
  statusIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  rateLimitNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  rateLimitNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    width: '100%',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
  },
  errorText: {
    color: '#EF4444',
  },
  successText: {
    color: '#10B981',
  },
  resendForm: {
    width: '100%',
    marginBottom: 12,
  },
  resendBtn: {
    marginTop: 10,
    width: '100%',
  },
  loginBtn: {
    width: '100%',
    marginTop: 8,
  },
});
