import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
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

function formatDate(dateString?: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("tr-TR", {
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
  const formattedDate = formatDate(createdAt);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <ThemedView style={styles.card}>
        <View style={styles.pixelDotTopLeft} />
        <View style={styles.pixelDotTopRight} />
        <View style={styles.pixelDotBottomLeft} />

        <ThemedText style={styles.pixelLabel}>PIXEL MEMORY</ThemedText>

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>Gorsel yok</ThemedText>
          </View>
        )}

        <ThemedText type="subtitle" style={styles.title}>
          {title ?? `Ani #${id}`}
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

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 3,
    borderColor: "#ff7fb3",
    borderRadius: 0,
    backgroundColor: "#ffe4f1",
    shadowColor: "#c14d82",
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
    borderColor: "#ff7fb3",
    backgroundColor: "#ffd0e7",
    fontFamily: Fonts?.mono,
    fontSize: 10,
    letterSpacing: 1,
    lineHeight: 12,
    color: "#8f2b57",
  },
  image: {
    width: "100%",
    height: 190,
    marginBottom: 10,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#ff9ac5",
    backgroundColor: "#fff5fa",
  },
  placeholder: {
    width: "100%",
    height: 190,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffeef6",
    borderWidth: 3,
    borderColor: "#ff9ac5",
  },
  placeholderText: {
    fontFamily: Fonts?.mono,
    color: "#8f2b57",
    opacity: 0.9,
  },
  title: {
    fontFamily: Fonts?.mono,
    color: "#7f1d49",
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
    color: "#8f2b57",
    backgroundColor: "#ffd0e7",
    borderWidth: 2,
    borderColor: "#ff9ac5",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pixelDotTopLeft: {
    position: "absolute",
    width: 8,
    height: 8,
    top: -3,
    left: -3,
    backgroundColor: "#ff7fb3",
  },
  pixelDotTopRight: {
    position: "absolute",
    width: 8,
    height: 8,
    top: -3,
    right: -3,
    backgroundColor: "#ff7fb3",
  },
  pixelDotBottomLeft: {
    position: "absolute",
    width: 8,
    height: 8,
    bottom: -3,
    left: -3,
    backgroundColor: "#ff7fb3",
  },
});
