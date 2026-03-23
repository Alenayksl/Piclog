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
import { resendConfirmationEmail, signUp } from "@/src/services/supabase";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
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

  async function handleRegister() {
    setError(null);
    setSuccessMessage(null);
    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim().replace(/\s+/g, "");
    const trimmedEmail = email.trim();
    if (!trimmedFullName) {
      setError(t("auth.register.err.name"));
      return;
    }
    if (!trimmedUsername) {
      setError(t("auth.register.err.username"));
      return;
    }
    if (!trimmedEmail || !password) {
      setError(t("auth.register.err.required"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.register.err.password"));
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await signUp(trimmedEmail, password, {
      full_name: trimmedFullName,
      username: trimmedUsername,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? t("auth.register.err.failed"));
      return;
    }

    if (data?.session) {
      router.replace("/(tabs)");
      return;
    }

    setSuccessMessage(t("auth.register.success"));
  }

  async function handleResendConfirmation() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    setError(null);
    setResendLoading(true);
    const { error: resendError } = await resendConfirmationEmail(trimmedEmail);
    setResendLoading(false);
    if (resendError) {
      setError(resendError.message ?? t("auth.register.resendFailed"));
      return;
    }
    setSuccessMessage(t("auth.register.resendSuccess"));
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ThemedText type="title" style={styles.title}>
          {t("auth.register.title")}
        </ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
          placeholder={t("auth.register.fullName")}
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
          placeholder={t("auth.register.username")}
          placeholderTextColor={placeholderColor}
          value={username}
          onChangeText={(text) => {
            setUsername(text.replace(/\s/g, ""));
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: inputText }]}
          placeholder={t("auth.register.email")}
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
          placeholder={t("auth.register.password")}
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
            <ThemedText
              style={styles.success}
              lightColor="#0a7ea4"
              darkColor="#6eb8e0"
            >
              {successMessage}
            </ThemedText>
            <CustomButton
              title={
                resendLoading
                  ? t("auth.register.resending")
                  : t("auth.register.resend")
              }
              onPress={handleResendConfirmation}
              disabled={resendLoading}
              variant="outline"
              style={styles.resendButton}
            />
          </>
        ) : null}

        <CustomButton
          title={
            loading ? t("auth.register.submitting") : t("auth.register.submit")
          }
          onPress={handleRegister}
          disabled={loading}
          style={styles.button}
        />

        {loading && <ActivityIndicator style={styles.loader} color="#0a7ea4" />}

        <Link href="/(auth)/login" asChild>
          <ThemedText type="link" style={styles.link}>
            {t("auth.register.hasAccount")}
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
    textAlign: "center",
  },
});
