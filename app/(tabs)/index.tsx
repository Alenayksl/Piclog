import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { LogCard } from "@/src/components/LogCard";
import { reverseGeocode } from "@/src/services/location";
import { supabase } from "@/src/services/supabase";

type LogItem = {
  id: string;
  image_url: string | null;
  note: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  temp: number | null;
  weather_condition: string | null;
  created_at: string | null;
};

function extractPhotoPath(imageUrl: string): string | null {
  if (!imageUrl) return null;

  if (!imageUrl.startsWith("http")) {
    return imageUrl;
  }

  const markers = [
    "/storage/v1/object/public/photos/",
    "/storage/v1/object/sign/photos/",
    "/storage/v1/object/authenticated/photos/",
  ];

  for (const marker of markers) {
    const idx = imageUrl.indexOf(marker);
    if (idx !== -1) {
      const pathWithQuery = imageUrl.slice(idx + marker.length);
      const [path] = pathWithQuery.split("?");
      return decodeURIComponent(path);
    }
  }

  return null;
}

export default function FeedScreen() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const backgroundGif = require("../../assets/images/backgrounds/backgorund.gif");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("logs")
      .select(
        "id, image_url, note, location_name, latitude, longitude, temp, weather_condition, created_at",
      )
      .not("image_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Feed fetch error:", error.message);
      setLoading(false);
      return;
    }

    const resolvedLogs = await Promise.all(
      ((data ?? []) as LogItem[]).map(async (item) => {
        let resolvedLocation = item.location_name;

        if (
          !resolvedLocation &&
          item.latitude != null &&
          item.longitude != null
        ) {
          const addressData = await reverseGeocode(
            item.latitude,
            item.longitude,
          );
          if (addressData?.city) {
            resolvedLocation = [addressData.city, addressData.country]
              .filter(Boolean)
              .join(", ");
          }
        }

        if (!item.image_url) {
          return {
            ...item,
            location_name: resolvedLocation,
          };
        }

        const photoPath = extractPhotoPath(item.image_url);
        if (!photoPath) {
          return item;
        }

        const { data: signedData, error: signedError } = await supabase.storage
          .from("photos")
          .createSignedUrl(photoPath, 60 * 60);

        if (signedError || !signedData?.signedUrl) {
          return {
            ...item,
            image_url: null,
            location_name: resolvedLocation,
          };
        }

        return {
          ...item,
          image_url: signedData.signedUrl,
          location_name: resolvedLocation,
        };
      }),
    );

    setLogs(resolvedLogs.filter((item) => !!item.image_url));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs]),
  );

  return (
    <ThemedView style={styles.container}>
      <Image
        source={backgroundGif}
        style={styles.backgroundGif}
        contentFit="cover"
      />
      <View style={styles.backgroundTint} />

      <ThemedText type="title" style={styles.pageTitle}>
        Akış
      </ThemedText>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={logs}
        keyExtractor={(item) => item.id}
        onRefresh={fetchLogs}
        refreshing={loading}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>Henüz paylaşım yok.</ThemedText>
        }
        renderItem={({ item }) => (
          <LogCard
            id={item.id}
            imageUri={item.image_url ?? undefined}
            title={item.note ?? undefined}
            location={item.location_name ?? undefined}
            temp={item.temp ?? undefined}
            weatherDescription={item.weather_condition ?? undefined}
            createdAt={item.created_at ?? undefined}
            onPress={() => router.push(`/detail/${item.id}`)}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    position: "relative",
  },
  backgroundGif: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 245, 250, 0.3)",
  },
  pageTitle: {
    zIndex: 1,
    color: "#7f1d49",
    marginBottom: 4,
  },
  list: {
    zIndex: 1,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyText: {
    marginTop: 16,
    opacity: 0.7,
  },
});
