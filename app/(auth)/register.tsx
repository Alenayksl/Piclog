import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';

import { CustomButton } from '@/src/components/CustomButton';
import { signUp, resendConfirmationEmail } from '@/src/services/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) router.replace('/(tabs)');
  }, [authLoading, isAuthenticated]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputBg = isDark ? '#25282a' : '#f0f0f0';
  const inputText = Colors[colorScheme ?? 'light'].text;
  const placeholderColor = isDark ? '#9BA1A6' : '#687076';

  async function handleRegister() {
    setError(null);
    setSuccessMessage(null);
    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim().replace(/\s+/g, '');
    const trimmedEmail = email.trim();
    if (!trimmedFullName) {
      setError('Ad soyad gerekli.');
      return;
    }
    if (!trimmedUsername) {
      setError('Kullanıcı adı gerekli.');
      return;
    }
    if (!trimmedEmail || !password) {
      setError('E-posta ve şifre gerekli.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await signUp(trimmedEmail, password, {
      full_name: trimmedFullName,
      username: trimmedUsername,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? 'Kayıt oluşturulamadı.');
      return;
    }

    if (data?.session) {
      router.replace('/(tabs)');
      return;
    }

    setSuccessMessage(
      'Hesabın oluşturuldu. E-posta onayı açıksa gelen kutunu kontrol et, ardından giriş yap.'
    );
  }

  async function handleResendConfirmation() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    setError(null);
    setResendLoading(true);
    const { error: resendError } = await resendConfirmationEmail(trimmedEmail);
    setResendLoading(false);
    if (resendError) {
      setError(resendError.message ?? 'Onay e-postası tekrar gönderilemedi.');
      return;
    }
    setSuccessMessage('Onay e-postası tekrar gönderildi. Gelen kutunu kontrol et.');
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}>
        <ThemedText type="title" style={styles.title}>
          Kayıt Ol
        </ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
          placeholder="Ad Soyad"
          placeholderTextColor={placeholderColor}
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            setError(null);
          }}
          autoCapitalize="words"
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
          placeholder="Kullanıcı adı"
          placeholderTextColor={placeholderColor}
          value={username}
          onChangeText={(text) => {
            setUsername(text.replace(/\s/g, ''));
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
          placeholder="E-posta"
          placeholderTextColor={placeholderColor}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
          placeholder="Şifre (en az 6 karakter)"
          placeholderTextColor={placeholderColor}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          secureTextEntry
          editable={!loading}
        />

        {error ? (
          <ThemedText style={styles.error} lightColor="#c00" darkColor="#f66">
            {error}
          </ThemedText>
        ) : null}

        {successMessage ? (
          <>
            <ThemedText style={styles.success} lightColor="#0a7ea4" darkColor="#6eb8e0">
              {successMessage}
            </ThemedText>
            <CustomButton
              title={resendLoading ? 'Gönderiliyor...' : 'Onay e-postasını tekrar gönder'}
              onPress={handleResendConfirmation}
              disabled={resendLoading}
              variant="outline"
              style={styles.resendButton}
            />
          </>
        ) : null}

        <CustomButton
          title={loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          onPress={handleRegister}
          disabled={loading}
          style={styles.button}
        />

        {loading && <ActivityIndicator style={styles.loader} color="#0a7ea4" />}

        <Link href="/(auth)/login" asChild>
          <ThemedText type="link" style={styles.link}>
            Zaten hesabın var mı? Giriş yap
          </ThemedText>
        </Link>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  keyboard: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  error: {
    fontSize: 14,
    marginBottom: 12,
  },
  success: {
    fontSize: 14,
    marginBottom: 12,
  },
  resendButton: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  loader: {
    marginTop: 12,
  },
  link: {
    marginTop: 24,
    textAlign: 'center',
  },
});
