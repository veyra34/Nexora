import React, { useState, useEffect, useRef } from 'react';
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
import { Card } from '../../components/common/Card';
import { supabase } from '../../services/supabase';
import {
  getFriendlyAuthErrorMessage,
  isRateLimitError,
  resendConfirmationEmail,
} from '../../services/authHelper';

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const isSubmittingRef = useRef(false);

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

  const handleSignup = async () => {
    if (isSubmittingRef.current || isLoading) return;

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setIsRateLimited(false);
    setIsLoading(true);
    isSubmittingRef.current = true;

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: 'nexora://auth-callback',
          data: {
            username: username.trim().toLowerCase(),
            display_name: displayName.trim() || username.trim(),
          },
        },
      });

      if (error) {
        const rateLimit = isRateLimitError(error);
        setIsRateLimited(rateLimit);
        setErrorMessage(getFriendlyAuthErrorMessage(error));
        return;
      }

      if (data.session) {
        router.replace('/(tabs)');
      } else {
        setPendingEmail(cleanEmail);
        setStep('verification');
        setCooldown(60);
      }
    } catch (err: any) {
      const rateLimit = isRateLimitError(err);
      setIsRateLimited(rateLimit);
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResend = async () => {
    if (!pendingEmail || cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendStatus(null);

    const result = await resendConfirmationEmail(pendingEmail);
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

  if (step === 'verification') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.verificationContainer}>
          <Card style={styles.verificationCard}>
            <View style={styles.verificationIconCircle}>
              <Ionicons name="mail-unread" size={40} color={Colors.dark.primaryLight} />
            </View>

            <Text style={styles.verificationTitle}>Confirm Your Email</Text>
            <Text style={styles.verificationSubtitle}>
              We sent a verification link to{' '}
              <Text style={styles.highlightEmail}>{pendingEmail}</Text>. Tap the link in your email to activate your account.
            </Text>

            <View style={styles.smtpNoteBox}>
              <Ionicons name="information-circle-outline" size={18} color="#818CF8" />
              <Text style={styles.smtpNoteText}>
                Supabase enforces outgoing email limits to prevent spam. Please check your inbox and spam folder before requesting a new link.
              </Text>
            </View>

            {resendStatus && (
              <View
                style={[
                  styles.statusBanner,
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
                    styles.statusBannerText,
                    resendStatus.type === 'error' ? styles.errorText : styles.successText,
                  ]}
                >
                  {resendStatus.message}
                </Text>
              </View>
            )}

            <Button
              title={cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Confirmation Email'}
              variant="primary"
              size="lg"
              disabled={cooldown > 0 || isResending}
              loading={isResending}
              onPress={handleResend}
              icon={cooldown === 0 ? <Ionicons name="refresh" size={18} color="#FFFFFF" /> : undefined}
              style={styles.actionBtn}
            />

            <Button
              title="Change Email / Back"
              variant="secondary"
              size="md"
              onPress={() => {
                setStep('form');
                setErrorMessage('');
              }}
              style={styles.secondaryActionBtn}
            />

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.loginLinkRow}
            >
              <Text style={styles.footerText}>Already confirmed?</Text>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Nexora and start sharpening your algorithmic skills.</Text>
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

          <View style={styles.form}>
            <Input
              label="Username *"
              placeholder="riyaziya"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              icon="person-outline"
            />

            <Input
              label="Display Name"
              placeholder="Riyaziya Bano"
              value={displayName}
              onChangeText={setDisplayName}
              icon="card-outline"
            />

            <Input
              label="Email Address *"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />

            <Input
              label="Password *"
              placeholder="•••••••• (min 6 chars)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirm Password *"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              icon="shield-checkmark-outline"
            />

            <Button
              title="Create Nexora Account"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleSignup}
              style={styles.signupButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Log In</Text>
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
  verificationContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  verificationCard: {
    padding: 24,
    alignItems: 'center',
  },
  verificationIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  highlightEmail: {
    color: Colors.dark.text,
    fontWeight: '700',
  },
  smtpNoteBox: {
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
  smtpNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    width: '100%',
  },
  statusBannerText: {
    flex: 1,
    fontSize: 13,
  },
  errorText: {
    color: '#EF4444',
  },
  successText: {
    color: '#10B981',
  },
  actionBtn: {
    width: '100%',
    marginBottom: 10,
  },
  secondaryActionBtn: {
    width: '100%',
    marginBottom: 16,
  },
  loginLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
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
    marginBottom: 14,
    gap: 8,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
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
  form: {
    flex: 1,
  },
  signupButton: {
    marginTop: 10,
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
