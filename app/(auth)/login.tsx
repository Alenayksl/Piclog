import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CustomButton } from "@/src/components/CustomButton";
import { useAuth } from "@/src/hooks/useAuth";
import { useI18n } from "@/src/i18n/app-i18n";
import { signIn } from "@/src/services/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) router.replace("/(tabs)");
  }, [authLoading, isAuthenticated]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const inputBg = isDark ? "#25282a" : "#f0f0f0";
  const inputText = Colors[colorScheme ?? "light"].text;
  const placeholderColor = isDark ? "#9BA1A6" : "#687076";

  async function handleLogin() {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(t("auth.login.err.required"));
      return;
    }
    setLoading(true);
    const { data, error: signInError } = await signIn(trimmedEmail, password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message ?? t("auth.login.err.failed"));
      return;
    }

    if (data?.session) {
      router.replace("/(tabs)");
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ThemedText type="title" style={styles.title}>
          {t("auth.login.title")}
        </ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
          placeholder={t("auth.login.email")}
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
          placeholder={t("auth.login.password")}
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

        <CustomButton
          title={loading ? t("auth.login.submitting") : t("auth.login.submit")}
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        />

        {loading && <ActivityIndicator style={styles.loader} color="#0a7ea4" />}

        <Link href="/(auth)/forgot-password" asChild>
          <ThemedText type="link" style={styles.forgotLink}>
            {t("auth.login.forgot")}
          </ThemedText>
        </Link>

        <Link href="/(auth)/register" asChild>
          <ThemedText type="link" style={styles.link}>
            {t("auth.login.noAccount")}
          </ThemedText>
        </Link>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  keyboard: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
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
  button: {
    marginTop: 8,
  },
  loader: {
    marginTop: 12,
  },
  forgotLink: {
    marginTop: 16,
    textAlign: "center",
  },
  link: {
    marginTop: 24,
    textAlign: "center",
  },
});
