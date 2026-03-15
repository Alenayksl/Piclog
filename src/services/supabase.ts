import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth metodları
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export type SignUpOptions = {
  full_name?: string;
  username?: string;
};

export async function signUp(
  email: string,
  password: string,
  options?: SignUpOptions
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: options?.full_name?.trim() || undefined,
        username: options?.username?.trim() || undefined,
      },
    },
  });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function getSession() {
  return supabase.auth.getSession();
}

/** Şifre sıfırlama linki e-postaya gönderilir (Supabase Dashboard'da "Confirm email" ve e-posta ayarları gerekir). */
export async function sendPasswordResetEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: undefined, // İstersen: 'piclog://reset-password' gibi deep link
  });
  return { data, error };
}

/** Kayıt onay e-postasını tekrar gönderir (Confirm email açıksa). */
export async function resendConfirmationEmail(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
  });
  return { data, error };
}
