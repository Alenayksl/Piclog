import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { usePixelTheme, type PixelTheme } from "@/src/theme/pixel-theme";

export interface WeatherBadgeProps {
  temp?: number;
  description?: string;
}

export function WeatherBadge({ temp, description }: WeatherBadgeProps) {
  const { theme } = usePixelTheme();
  const styles = getStyles(theme);

  return (
    <ThemedView style={styles.badge}>
      {temp != null && <ThemedText style={styles.temp}>{temp}°C</ThemedText>}
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
    </ThemedView>
  );
}

function getStyles(theme: PixelTheme) {
  return StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      alignSelf: "flex-start",
      borderWidth: 2,
      borderColor: theme.chipBorder,
      backgroundColor: theme.chipBg,
      borderRadius: 0,
    },
    temp: {
      fontFamily: Fonts?.mono,
      fontSize: 12,
      color: theme.chipText,
    },
    description: {
      fontFamily: Fonts?.mono,
      fontSize: 12,
      color: theme.chipText,
      opacity: 0.95,
    },
  });
}
