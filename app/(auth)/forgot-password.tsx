import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';

import { CustomButton } from '@/src/components/CustomButton';
import { sendPasswordResetEmail } from '@/src/services/supabase';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputBg = isDark ? '#25282a' : '#f0f0f0';
  const inputText = Colors[colorScheme ?? 'light'].text;
  const placeholderColor = isDark ? '#9BA1A6' : '#687076';

  async function handleSendReset() {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('E-posta adresi gerekli.');
      return;
    }
    setLoading(true);
    const { error: resetError } = await sendPasswordResetEmail(trimmedEmail);
    setLoading(false);

    if (resetError) {
      setError(resetError.message ?? 'Şifre sıfırlama e-postası gönderilemedi.');
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          E-posta gönderildi
        </ThemedText>
        <ThemedText style={styles.successText} lightColor="#0a7ea4" darkColor="#6eb8e0">
          Şifre sıfırlama linki {email.trim()} adresine gönderildi. Gelen kutunuzu (ve spam
          klasörünü) kontrol edin. Linke tıklayıp yeni şifrenizi belirleyebilirsiniz.
        </ThemedText>
        <Link href="/(auth)/login" asChild>
          <ThemedText type="link" style={styles.link}>
            Giriş sayfasına dön
          </ThemedText>
        </Link>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}>
        <ThemedText type="title" style={styles.title}>
          Şifremi unuttum
        </ThemedText>
        <ThemedText style={styles.hint}>
          Kayıtlı e-posta adresinizi girin. Size şifre sıfırlama linki göndereceğiz.
        </ThemedText>

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

        {error ? (
          <ThemedText style={styles.error} lightColor="#c00" darkColor="#f66">
            {error}
          </ThemedText>
        ) : null}

        <CustomButton
          title={loading ? 'Gönderiliyor...' : 'Sıfırlama linki gönder'}
          onPress={handleSendReset}
          disabled={loading}
          style={styles.button}
        />

        {loading && <ActivityIndicator style={styles.loader} color="#0a7ea4" />}

        <Link href="/(auth)/login" asChild>
          <ThemedText type="link" style={styles.link}>
            Giriş sayfasına dön
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
    marginBottom: 12,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 20,
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
  successText: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
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
