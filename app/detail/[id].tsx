import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { CustomButton } from "@/src/components/CustomButton";
import { useAuth } from "@/src/hooks/useAuth";
import { supabase } from "@/src/services/supabase";

type LogDetail = {
  id: string;
  image_url: string | null;
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

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, loading } = useAuth();
  const backgroundGif = require("../../assets/images/backgrounds/backgorund.gif");
  const [log, setLog] = useState<LogDetail | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (!id || loading || !isAuthenticated) return;

    let active = true;

    const fetchLog = async () => {
      setFetching(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("logs")
        .select("id, image_url")
        .eq("id", id)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setFetching(false);
        return;
      }

      if (!data) {
        setError("Kayit bulunamadi.");
        setFetching(false);
        return;
      }

      setLog(data as LogDetail);

      if (!data.image_url) {
        setImageUri(null);
        setFetching(false);
        return;
      }

      const path = extractPhotoPath(data.image_url);
      if (!path) {
        setImageUri(data.image_url);
        setFetching(false);
        return;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("photos")
        .createSignedUrl(path, 60 * 60);

      if (!active) return;

      if (signedError || !signedData?.signedUrl) {
        setImageUri(null);
      } else {
        setImageUri(signedData.signedUrl);
      }

      setFetching(false);
    };

    fetchLog();

    return () => {
      active = false;
    };
  }, [id, isAuthenticated, loading]);

  if (loading || !isAuthenticated) {
    return null;
  }

  function confirmDeleteImage() {
    Alert.alert("Aniyi sil", "Bu aniyi tamamen silmek istiyor musun?", [
      {
        text: "Vazgec",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => {
          void handleDeleteImage();
        },
      },
    ]);
  }

  async function handleDeleteImage() {
    if (!log?.id) {
      Alert.alert("Uyari", "Silinecek kayit bulunamadi.");
      return;
    }

    setDeleting(true);

    if (log.image_url) {
      const path = extractPhotoPath(log.image_url);
      if (path) {
        const { error: removeError } = await supabase.storage
          .from("photos")
          .remove([path]);

        if (removeError) {
          console.warn("Storage remove warning:", removeError.message);
        }
      }
    }

    const { error: deleteError } = await supabase
      .from("logs")
      .delete()
      .eq("id", log.id);

    setDeleting(false);

    if (deleteError) {
      Alert.alert("Hata", "Ani kaydi silinemedi.");
      return;
    }

    setImageUri(null);
    setLog(null);
    Alert.alert("Basarili", "Ani silindi.");
    router.replace("/(tabs)");
  }

  if (fetching) {
    return (
      <ThemedView style={styles.container}>
        <Image
          source={backgroundGif}
          style={styles.backgroundGif}
          contentFit="cover"
        />
        <View style={styles.backgroundTint} />
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" color="#ff6ea9" />
        </ThemedView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Image
          source={backgroundGif}
          style={styles.backgroundGif}
          contentFit="cover"
        />
        <View style={styles.backgroundTint} />
        <ThemedView style={styles.errorPanel}>
          <ThemedText style={styles.error}>{error}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Image
        source={backgroundGif}
        style={styles.backgroundGif}
        contentFit="cover"
      />
      <View style={styles.backgroundTint} />

      {imageUri ? (
        <ThemedView style={styles.panel}>
          <View style={styles.pixelDotTopLeft} />
          <View style={styles.pixelDotTopRight} />

          <ThemedView style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="contain"
            />
          </ThemedView>
          <ThemedView style={styles.actions}>
            <CustomButton
              title={deleting ? "Siliniyor..." : "Aniyi Sil"}
              onPress={confirmDeleteImage}
              disabled={deleting}
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            />
          </ThemedView>
        </ThemedView>
      ) : (
        <ThemedView style={styles.errorPanel}>
          <ThemedText style={styles.muted}>Gorsel bulunamadi.</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    position: "relative",
  },
  backgroundGif: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 245, 250, 0.35)",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  panel: {
    flex: 1,
    margin: 12,
    padding: 8,
    borderWidth: 3,
    borderColor: "#ff9ac5",
    backgroundColor: "#ffe4f1",
    shadowColor: "#c14d82",
    shadowOpacity: 0.9,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 5 },
    elevation: 8,
    position: "relative",
    zIndex: 1,
  },
  imageWrapper: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#ff9ac5",
    backgroundColor: "#fff1f8",
    padding: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 10,
    paddingTop: 12,
  },
  deleteButton: {
    width: "100%",
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#ff6ea9",
    backgroundColor: "#ff6ea9",
    shadowColor: "#c14d82",
    shadowOpacity: 0.9,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 6,
  },
  deleteButtonText: {
    fontFamily: Fonts?.mono,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#fff7fb",
  },
  muted: {
    textAlign: "center",
    opacity: 0.9,
    fontFamily: Fonts?.mono,
    color: "#8f2b57",
  },
  errorPanel: {
    margin: 16,
    padding: 14,
    borderWidth: 3,
    borderColor: "#ff9ac5",
    backgroundColor: "#ffe4f1",
    zIndex: 1,
  },
  error: {
    opacity: 0.9,
    fontFamily: Fonts?.mono,
    color: "#8f2b57",
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
});
