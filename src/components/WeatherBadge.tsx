import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";

export interface WeatherBadgeProps {
  temp?: number;
  description?: string;
}

export function WeatherBadge({ temp, description }: WeatherBadgeProps) {
  return (
    <ThemedView style={styles.badge}>
      {temp != null && <ThemedText style={styles.temp}>{temp}°C</ThemedText>}
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#ff9ac5",
    backgroundColor: "#ffeef6",
    borderRadius: 0,
  },
  temp: {
    fontFamily: Fonts?.mono,
    fontSize: 12,
    color: "#8f2b57",
  },
  description: {
    fontFamily: Fonts?.mono,
    fontSize: 12,
    color: "#8f2b57",
    opacity: 0.95,
  },
});
