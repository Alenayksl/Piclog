import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { CustomButton } from "@/src/components/CustomButton";
import { useAuth } from "@/src/hooks/useAuth";
import { useI18n } from "@/src/i18n/app-i18n";
import { signIn } from "@/src/services/supabase";
import { type PixelTheme, usePixelTheme } from "@/src/theme/pixel-theme";
import { Image } from "expo-image";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { theme, mode, toggleTheme } = usePixelTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) router.replace("/(tabs)");
  }, [authLoading, isAuthenticated]);

  const renderThemePixel = () => {
    if (mode === "pink") {
      return (
        <View style={styles.themeGlyph}>
          <View style={[styles.themeCore, styles.themeSunCore]} />
          <View style={[styles.themeRay, styles.themeRayTop]} />
          <View style={[styles.themeRay, styles.themeRayBottom]} />
          <View style={[styles.themeRay, styles.themeRayLeft]} />
          <View style={[styles.themeRay, styles.themeRayRight]} />
        </View>
      );
    }

    return (
      <View style={styles.themeGlyph}>
        <View style={[styles.themeCore, styles.themeMoonCore]} />
        <View style={[styles.themeCrater, styles.themeCraterA]} />
        <View style={[styles.themeCrater, styles.themeCraterB]} />
      </View>
    );
  };

  const renderLangPixel = (langCode: "tr" | "en") => {
    if (langCode === "tr") {
      return (
        <View style={[styles.pixelFlag, styles.flagRed]}>
          <View style={styles.flagDot} />
          <View style={styles.flagDotInner} />
        </View>
      );
    }

    return (
      <View style={styles.pixelFlag}>
        <View style={[styles.flagRow, styles.flagRed]} />
        <View style={[styles.flagRow, styles.flagWhite]} />
        <View style={[styles.flagRow, styles.flagRed]} />
        <View style={[styles.flagRow, styles.flagWhite]} />
        <View style={[styles.flagRow, styles.flagRed]} />
        <View style={styles.flagBlueCorner} />
      </View>
    );
  };

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
      <Image
        source={theme.backgroundAsset}
        style={styles.backgroundGif}
        contentFit="cover"
      />
      <View style={styles.backgroundTint} />

      <Pressable
        onPress={toggleTheme}
        style={[styles.themeToggle, { top: insets.top + 12 }]}
      >
        {renderThemePixel()}
      </Pressable>

      <View style={[styles.languageSwitch, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => setLanguage("tr")}
          style={[
            styles.langButton,
            language === "tr" && styles.langButtonActive,
          ]}
        >
          {renderLangPixel("tr")}
        </Pressable>
        <Pressable
          onPress={() => setLanguage("en")}
          style={[
            styles.langButton,
            language === "en" && styles.langButtonActive,
          ]}
        >
          {renderLangPixel("en")}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ThemedView style={styles.panel}>
          <View style={styles.pixelDotTopLeft} />
          <View style={styles.pixelDotTopRight} />

          <ThemedText type="title" style={styles.title}>
            {t("auth.login.title")}
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder={t("auth.login.email")}
            placeholderTextColor={theme.subtitle}
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
            style={styles.input}
            placeholder={t("auth.login.password")}
            placeholderTextColor={theme.subtitle}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            secureTextEntry
            editable={!loading}
          />

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

          <CustomButton
            title={
              loading ? t("auth.login.submitting") : t("auth.login.submit")
            }
            onPress={handleLogin}
            disabled={loading}
            style={styles.button}
            textStyle={styles.buttonText}
          />

          {loading && (
            <ActivityIndicator
              style={styles.loader}
              color={theme.buttonPrimary}
            />
          )}

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
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function getStyles(theme: PixelTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      position: "relative",
    },
    backgroundGif: {
      ...StyleSheet.absoluteFillObject,
    },
    backgroundTint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.backgroundTint,
    },
    themeToggle: {
      position: "absolute",
      left: 14,
      minWidth: 44,
      height: 44,
      borderWidth: 2,
      borderColor: theme.panelBorder,
      backgroundColor: theme.iconFrame,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 5,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.85,
      shadowRadius: 0,
      shadowOffset: { width: 2, height: 2 },
      elevation: 4,
    },
    languageSwitch: {
      position: "absolute",
      right: 14,
      flexDirection: "row",
      gap: 6,
      zIndex: 5,
    },
    langButton: {
      minWidth: 44,
      height: 44,
      borderWidth: 2,
      borderColor: theme.panelBorder,
      backgroundColor: theme.iconFrame,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.85,
      shadowRadius: 0,
      shadowOffset: { width: 2, height: 2 },
      elevation: 4,
    },
    langButtonActive: {
      backgroundColor: theme.iconFrameFocused,
      borderColor: theme.pixelDot,
    },
    pixelFlag: {
      width: 22,
      height: 14,
      borderWidth: 1,
      borderColor: theme.panelBorder,
      backgroundColor: theme.iconInner,
      overflow: "hidden",
      position: "relative",
    },
    flagRow: {
      height: 2.8,
      width: "100%",
    },
    flagRed: {
      backgroundColor: "#d64663",
    },
    flagWhite: {
      backgroundColor: "#fff6f8",
    },
    flagBlueCorner: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 9,
      height: 7,
      backgroundColor: "#344e9a",
    },
    flagDot: {
      position: "absolute",
      top: 4,
      left: 7,
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: "#fff6f8",
    },
    flagDotInner: {
      position: "absolute",
      top: 4,
      left: 9,
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: "#d64663",
    },
    themeGlyph: {
      width: 20,
      height: 20,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    themeCore: {
      width: 10,
      height: 10,
      position: "absolute",
      top: 5,
      left: 5,
    },
    themeSunCore: {
      backgroundColor: "#ffd25c",
      borderWidth: 1,
      borderColor: "#ffb42b",
    },
    themeMoonCore: {
      backgroundColor: "#d6d8ff",
      borderWidth: 1,
      borderColor: "#9ea3ff",
      borderRadius: 6,
    },
    themeCrater: {
      position: "absolute",
      backgroundColor: "#b6bbff",
      width: 2,
      height: 2,
    },
    themeCraterA: {
      top: 8,
      left: 7,
    },
    themeCraterB: {
      top: 11,
      left: 10,
    },
    themeRay: {
      position: "absolute",
      backgroundColor: "#ffb42b",
    },
    themeRayTop: {
      width: 2,
      height: 3,
      top: 1,
      left: 9,
    },
    themeRayBottom: {
      width: 2,
      height: 3,
      bottom: 1,
      left: 9,
    },
    themeRayLeft: {
      width: 3,
      height: 2,
      left: 1,
      top: 9,
    },
    themeRayRight: {
      width: 3,
      height: 2,
      right: 1,
      top: 9,
    },
    keyboard: {
      width: "100%",
      maxWidth: 380,
      alignSelf: "center",
      zIndex: 1,
    },
    panel: {
      width: "100%",
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.panelBg,
      padding: 14,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.9,
      shadowRadius: 0,
      shadowOffset: { width: 5, height: 5 },
      elevation: 8,
      gap: 10,
      position: "relative",
    },
    pixelDotTopLeft: {
      position: "absolute",
      width: 8,
      height: 8,
      top: -3,
      left: -3,
      backgroundColor: theme.pixelDot,
    },
    pixelDotTopRight: {
      position: "absolute",
      width: 8,
      height: 8,
      top: -3,
      right: -3,
      backgroundColor: theme.pixelDot,
    },
    title: {
      marginBottom: 4,
      textAlign: "center",
      fontFamily: Fonts?.mono,
      color: theme.title,
    },
    input: {
      borderWidth: 3,
      borderColor: theme.inputBorder,
      backgroundColor: theme.inputBg,
      color: theme.title,
      borderRadius: 0,
      paddingVertical: 12,
      paddingHorizontal: 12,
      fontSize: 14,
      fontFamily: Fonts?.mono,
    },
    error: {
      fontSize: 12,
      color: "#ff4f8e",
      fontFamily: Fonts?.mono,
      marginTop: 2,
    },
    button: {
      marginTop: 4,
      borderRadius: 0,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.buttonPrimary,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.9,
      shadowRadius: 0,
      shadowOffset: { width: 3, height: 3 },
      elevation: 6,
    },
    buttonText: {
      fontFamily: Fonts?.mono,
      fontSize: 13,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: theme.buttonText,
    },
    loader: {
      marginTop: 8,
    },
    forgotLink: {
      marginTop: 8,
      textAlign: "center",
      color: theme.subtitle,
      fontFamily: Fonts?.mono,
    },
    link: {
      marginTop: 10,
      textAlign: "center",
      color: theme.title,
      fontFamily: Fonts?.mono,
    },
  });
}
