import { supabase } from './supabase';

export function parseAuthUrl(urlString: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!urlString) return result;

  const questionIdx = urlString.indexOf('?');
  const hashIdx = urlString.indexOf('#');

  if (questionIdx !== -1) {
    const queryPart = hashIdx !== -1 && hashIdx > questionIdx
      ? urlString.substring(questionIdx + 1, hashIdx)
      : urlString.substring(questionIdx + 1);
    const pairs = queryPart.split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (k) {
        result[decodeURIComponent(k)] = decodeURIComponent(v || '');
      }
    }
  }

  if (hashIdx !== -1) {
    const hashPart = urlString.substring(hashIdx + 1);
    const pairs = hashPart.split('&');
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (k) {
        result[decodeURIComponent(k)] = decodeURIComponent(v || '');
      }
    }
  }

  return result;
}

export function isRateLimitError(error: any): boolean {
  if (!error) return false;
  if (error.status === 429) return true;
  const msg = (error.message || error.error_description || String(error)).toLowerCase();
  return (
    msg.includes('rate limit') ||
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('too many requests') ||
    msg.includes('email rate limit exceeded')
  );
}

export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';

  if (isRateLimitError(error)) {
    return 'Supabase email rate limit reached. The default free email provider limits outgoing messages. Please wait a few minutes before trying again, or check your spam/junk folder for previous emails.';
  }

  const msg = (error.message || error.error_description || String(error)).toLowerCase();

  if (msg.includes('otp_expired') || msg.includes('token has expired') || msg.includes('invalid or has expired')) {
    return 'This verification link has expired or has already been used. Please request a new confirmation email or log in if your account is already active.';
  }

  if (msg.includes('email not confirmed')) {
    return 'Your email address has not been confirmed yet. Please verify your inbox or request a new confirmation link below.';
  }

  if (msg.includes('already registered') || msg.includes('user already exists')) {
    return 'An account with this email address already exists. Please log in or use forgot password.';
  }

  if (msg.includes('invalid login credentials')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }

  return error.message || error.error_description || 'Authentication request failed.';
}

export async function resendConfirmationEmail(email: string): Promise<{
  success: boolean;
  message: string;
  isRateLimit?: boolean;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
      options: {
        emailRedirectTo: 'nexora://auth-callback',
      },
    });

    if (error) {
      if (isRateLimitError(error)) {
        return {
          success: false,
          message:
            'Email rate limit reached. Please wait a few minutes before requesting another confirmation email.',
          isRateLimit: true,
        };
      }
      return {
        success: false,
        message: getFriendlyAuthErrorMessage(error),
      };
    }

    return {
      success: true,
      message: 'A fresh confirmation link has been sent to your email inbox.',
    };
  } catch (err: any) {
    if (isRateLimitError(err)) {
      return {
        success: false,
        message:
          'Email rate limit reached. Please wait a few minutes before requesting another confirmation email.',
        isRateLimit: true,
      };
    }
    return {
      success: false,
      message: err.message || 'Failed to resend confirmation email.',
    };
  }
}
