import { StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WeatherBadge } from './WeatherBadge';

export interface LogCardProps {
  id: string;
  imageUri?: string;
  title?: string;
  location?: string;
  temp?: number;
  weatherDescription?: string;
  onPress?: () => void;
}

export function LogCard({
  id,
  title,
  location,
  temp,
  weatherDescription,
  onPress,
}: LogCardProps) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">{title ?? `Anı #${id}`}</ThemedText>
        {location && (
          <ThemedText style={styles.location}>{location}</ThemedText>
        )}
        {(temp != null || weatherDescription) && (
          <WeatherBadge temp={temp} description={weatherDescription} />
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  location: {
    marginTop: 4,
    opacity: 0.8,
  },
});
