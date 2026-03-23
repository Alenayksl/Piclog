import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useI18n } from "@/src/i18n/app-i18n";
import { usePixelTheme, type PixelTheme } from "@/src/theme/pixel-theme";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { WeatherBadge } from "./WeatherBadge";
type Props = {
  id: string;
  imageUri?: string;
  title?: string;
  location?: string;
  createdAt?: string;
  temp?: number;
  weatherDescription?: string;
  onPress?: () => void;
};

function formatDate(dateString?: string, language: "tr" | "en" = "tr") {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function LogCard({
  id,
  imageUri,
  title,
  location,
  createdAt,
  temp,
  weatherDescription,
  onPress,
}: Props) {
  const { t, language } = useI18n();
  const { theme } = usePixelTheme();
  const styles = getStyles(theme);
  const formattedDate = formatDate(createdAt, language);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <ThemedView style={styles.card}>
        <View style={styles.pixelDotTopLeft} />
        <View style={styles.pixelDotTopRight} />
        <View style={styles.pixelDotBottomLeft} />

        <ThemedText style={styles.pixelLabel}>{t("logcard.label")}</ThemedText>

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              {t("logcard.noImage")}
            </ThemedText>
          </View>
        )}

        <ThemedText type="subtitle" style={styles.title}>
          {title ?? t("logcard.defaultTitle", { id })}
        </ThemedText>

        <View style={styles.metaRow}>
          {location ? (
            <ThemedText style={styles.metaChip}>{location}</ThemedText>
          ) : null}
          {formattedDate ? (
            <ThemedText style={styles.metaChip}>{formattedDate}</ThemedText>
          ) : null}
        </View>

        {temp != null || weatherDescription ? (
          <WeatherBadge temp={temp} description={weatherDescription} />
        ) : null}
      </ThemedView>
    </Pressable>
  );
}

function getStyles(theme: PixelTheme) {
  return StyleSheet.create({
    card: {
      marginBottom: 16,
      padding: 12,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      borderRadius: 0,
      backgroundColor: theme.panelBg,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.9,
      shadowRadius: 0,
      shadowOffset: { width: 5, height: 5 },
      elevation: 8,
      position: "relative",
    },
    pressed: {
      transform: [{ translateX: 1 }, { translateY: 1 }],
    },
    pixelLabel: {
      alignSelf: "flex-start",
      marginBottom: 8,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderWidth: 2,
      borderColor: theme.panelBorder,
      backgroundColor: theme.chipBg,
      fontFamily: Fonts?.mono,
      fontSize: 10,
      letterSpacing: 1,
      lineHeight: 12,
      color: theme.chipText,
    },
    image: {
      width: "100%",
      height: 190,
      marginBottom: 10,
      borderRadius: 0,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.inputBg,
    },
    placeholder: {
      width: "100%",
      height: 190,
      marginBottom: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.inputBg,
      borderWidth: 3,
      borderColor: theme.panelBorder,
    },
    placeholderText: {
      fontFamily: Fonts?.mono,
      color: theme.chipText,
      opacity: 0.9,
    },
    title: {
      fontFamily: Fonts?.mono,
      color: theme.title,
      fontSize: 18,
      lineHeight: 22,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 6,
    },
    metaChip: {
      fontFamily: Fonts?.mono,
      fontSize: 11,
      lineHeight: 14,
      color: theme.chipText,
      backgroundColor: theme.chipBg,
      borderWidth: 2,
      borderColor: theme.chipBorder,
      paddingHorizontal: 6,
      paddingVertical: 2,
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
    pixelDotBottomLeft: {
      position: "absolute",
      width: 8,
      height: 8,
      bottom: -3,
      left: -3,
      backgroundColor: theme.pixelDot,
    },
  });
}
