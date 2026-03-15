import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export interface WeatherBadgeProps {
  temp?: number;
  description?: string;
}

export function WeatherBadge({ temp, description }: WeatherBadgeProps) {
  return (
    <ThemedView style={styles.badge}>
      {temp != null && (
        <ThemedText style={styles.temp}>{temp}°C</ThemedText>
      )}
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  temp: {
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    opacity: 0.9,
  },
});
