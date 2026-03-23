import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { CustomButton } from "@/src/components/CustomButton";
import { useI18n } from "@/src/i18n/app-i18n";
import { deleteAccount, signOut } from "@/src/services/supabase";
import { usePixelTheme, type PixelTheme } from "@/src/theme/pixel-theme";

export default function SettingsScreen() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { mode, theme, toggleTheme } = usePixelTheme();
  const { language, setLanguage, t } = useI18n();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  async function handleLogout() {
    setLoggingOut(true);
    const { error } = await signOut();
    setLoggingOut(false);

    if (error) {
      Alert.alert(t("common.error"), t("settings.logoutFailed"));
      return;
    }

    router.replace("/(auth)/login");
  }

  function handleDeleteAccount() {
    Alert.alert(
      t("settings.deleteAccountTitle"),
      t("settings.deleteAccountConfirm"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            void confirmDeleteAccount();
          },
        },
      ],
    );
  }

  async function confirmDeleteAccount() {
    setDeletingAccount(true);
    const { error } = await deleteAccount();
    setDeletingAccount(false);

    if (error) {
      Alert.alert(
        t("common.error"),
        `${t("settings.deleteAccountFailed")}\n\n${error.message ?? ""}`,
      );
      return;
    }

    Alert.alert(t("tabs.settingsTitle"), t("settings.deleteAccountSuccess"));
    router.replace("/(auth)/login");
  }

  return (
    <ThemedView style={styles.container}>
      <Image
        source={theme.backgroundAsset}
        style={styles.backgroundGif}
        contentFit="cover"
      />
      <View style={styles.backgroundTint} />

      <View style={[styles.languageSwitch, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => setLanguage("tr")}
          style={[
            styles.langButton,
            language === "tr" && styles.langButtonActive,
          ]}
        >
          <ThemedText style={styles.langFlag}>▦TR</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setLanguage("en")}
          style={[
            styles.langButton,
            language === "en" && styles.langButtonActive,
          ]}
        >
          <ThemedText style={styles.langFlag}>▦EN</ThemedText>
        </Pressable>
      </View>

      <ThemedView style={styles.panel}>
        <View style={styles.pixelDotTopLeft} />
        <View style={styles.pixelDotTopRight} />

        <ThemedText type="title" style={styles.title}>
          {t("tabs.settingsTitle")}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {t("settings.theme")}:{" "}
          {mode === "purple"
            ? t("settings.theme.darkPurple")
            : t("settings.theme.kawaiiPink")}
        </ThemedText>

        <CustomButton
          title={t("settings.switchTheme")}
          onPress={toggleTheme}
          style={styles.themeButton}
          textStyle={styles.buttonText}
        />

        <CustomButton
          title={loggingOut ? t("settings.loggingOut") : t("settings.logout")}
          onPress={handleLogout}
          disabled={loggingOut || deletingAccount}
          style={styles.logoutButton}
          textStyle={styles.buttonText}
        />

        <CustomButton
          title={
            deletingAccount
              ? t("settings.deletingAccount")
              : t("settings.deleteAccount")
          }
          onPress={handleDeleteAccount}
          disabled={deletingAccount || loggingOut}
          style={styles.deleteAccountButton}
          textStyle={styles.buttonText}
        />
      </ThemedView>
    </ThemedView>
  );
}

function getStyles(theme: PixelTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    backgroundGif: {
      ...StyleSheet.absoluteFillObject,
    },
    backgroundTint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.backgroundTint,
    },
    languageSwitch: {
      position: "absolute",
      right: 14,
      flexDirection: "row",
      gap: 6,
      zIndex: 3,
    },
    langButton: {
      minWidth: 44,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderWidth: 2,
      borderColor: theme.panelBorder,
      backgroundColor: theme.iconFrame,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.8,
      shadowRadius: 0,
      shadowOffset: { width: 2, height: 2 },
      elevation: 4,
    },
    langButtonActive: {
      backgroundColor: theme.iconFrameFocused,
      borderColor: theme.pixelDot,
    },
    langFlag: {
      fontFamily: Fonts?.mono,
      fontSize: 11,
      color: theme.title,
      letterSpacing: 0.6,
    },
    panel: {
      width: "100%",
      maxWidth: 440,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.panelBg,
      padding: 14,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.9,
      shadowRadius: 0,
      shadowOffset: { width: 5, height: 5 },
      elevation: 8,
      position: "relative",
      gap: 10,
      justifyContent: "center",
      zIndex: 1,
    },
    title: {
      fontFamily: Fonts?.mono,
      color: theme.title,
      lineHeight: 38,
    },
    subtitle: {
      fontFamily: Fonts?.mono,
      color: theme.subtitle,
      fontSize: 12,
      marginBottom: 6,
      letterSpacing: 0.6,
    },
    themeButton: {
      width: "100%",
      borderRadius: 0,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.buttonSecondary,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.9,
      shadowRadius: 0,
      shadowOffset: { width: 3, height: 3 },
      elevation: 6,
    },
    logoutButton: {
      width: "100%",
      borderRadius: 0,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.buttonDanger,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.9,
      shadowRadius: 0,
      shadowOffset: { width: 3, height: 3 },
      elevation: 6,
    },
    deleteAccountButton: {
      width: "100%",
      borderRadius: 0,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.panelShadow,
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
  });
}
