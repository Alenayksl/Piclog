import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { CustomButton } from "@/src/components/CustomButton";
import { useLocation } from "@/src/hooks/useLocation";
import { reverseGeocode } from "@/src/services/location";
import { supabase } from "@/src/services/supabase";
import { getWeather } from "@/src/services/weather";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function inferExtension(mimeType?: string | null) {
  if (!mimeType) return "jpg";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("heic")) return "heic";
  return "jpg";
}

export default function CreateScreen() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setnote] = useState("");
  const backgroundGif = require("../../assets/images/backgrounds/backgorund.gif");

  const { location } = useLocation();

  async function pickImageFromLibrary() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  async function takePhoto() {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  const handleSavePost = async function saveLog() {
    if (!image) {
      alert("Lütfen bir fotoğraf seçin veya çekin.");
      return;
    }

    if (!note.trim()) {
      alert("Lütfen bir not ekleyin.");
      return;
    }

    if (!location) {
      alert("Konum bilgisi alınamadı. Lütfen konum izinlerini kontrol edin.");
      return;
    }
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        alert("Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
        return;
      }

      const weatherData = await getWeather(
        location.latitude,
        location.longitude,
      );

      const addressData = await reverseGeocode(
        location.latitude,
        location.longitude,
      );

      const locationName = addressData?.city
        ? [addressData.city, addressData.country].filter(Boolean).join(", ")
        : (addressData?.formatted ?? null);

      if (!weatherData) {
        alert("Hava durum bilgisi alınamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      if (!image.base64) {
        alert("Fotoğraf verisi alınamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      const imageBuffer = base64ToArrayBuffer(image.base64);
      const extension = inferExtension(image.mimeType);
      const fileName = `${user.id}/${Date.now()}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, imageBuffer, {
          cacheControl: "3600",
          contentType: image.mimeType ?? "image/jpeg",
          upsert: false,
        });
      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        alert("Fotoğraf yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      if (!uploadData?.path) {
        console.error("Upload completed but path is missing", uploadData);
        alert("Yüklenen fotoğraf yolu alınamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("photos")
        .getPublicUrl(uploadData.path);

      const { error: postError } = await supabase.from("logs").insert({
        user_id: user.id,
        image_url: publicUrlData.publicUrl,
        note,
        location_name: locationName,
        latitude: location.latitude,
        longitude: location.longitude,
        weather_condition: weatherData.description,
        temp: weatherData.temp,
      });
      if (postError) {
        console.error("Error saving post:", postError);
        alert(`Gönderi kaydedilirken hata: ${postError.message}`);
        setLoading(false);
        return;
      }
      alert("Gönderi başarıyla kaydedildi!");
      setImage(null);
      setnote("");
    } catch (error) {
      console.error("Error:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={backgroundGif}
        style={styles.backgroundGif}
        contentFit="cover"
      />
      <View style={styles.backgroundTint} />

      <ThemedView style={styles.panel}>
        <View style={styles.pixelDotTopLeft} />
        <View style={styles.pixelDotTopRight} />

        <ThemedText type="title" style={styles.title}>
          Fotoğraf Ekle
        </ThemedText>

        <CustomButton
          title="Galeriden Sec"
          onPress={pickImageFromLibrary}
          disabled={loading}
          style={styles.actionButton}
          textStyle={styles.buttonText}
        />
        <CustomButton
          title="Fotograf Cek"
          onPress={takePhoto}
          disabled={loading}
          style={styles.actionButtonAlt}
          textStyle={styles.buttonText}
        />

        {image ? (
          <>
            <ThemedView style={styles.previewFrame}>
              <Image
                source={{ uri: image.uri }}
                style={styles.previewImage}
                contentFit="cover"
              />
            </ThemedView>

            <TextInput
              placeholder="Not ekle..."
              placeholderTextColor="#b85a89"
              value={note}
              onChangeText={setnote}
              style={styles.noteInput}
            />
            <CustomButton
              title={loading ? "Kaydediliyor..." : "Kaydet"}
              onPress={handleSavePost}
              disabled={loading}
              style={styles.saveButton}
              textStyle={styles.buttonText}
            />
          </>
        ) : (
          <ThemedText style={styles.hintText}>
            Bir fotograf sec ve pixel gunlugune ekle.
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(255, 245, 250, 0.35)",
  },
  panel: {
    width: "100%",
    maxWidth: 440,
    borderWidth: 3,
    borderColor: "#ff9ac5",
    backgroundColor: "#ffe4f1",
    padding: 14,
    shadowColor: "#c14d82",
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
    color: "#7f1d49",
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: Fonts?.mono,
    color: "#8f2b57",
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  actionButton: {
    width: "100%",
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#ff7fb3",
    backgroundColor: "#ff7fb3",
    shadowColor: "#c14d82",
    shadowOpacity: 0.9,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 6,
  },
  actionButtonAlt: {
    width: "100%",
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#ff9ac5",
    backgroundColor: "#ff9ac5",
    shadowColor: "#c14d82",
    shadowOpacity: 0.9,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 6,
  },
  previewFrame: {
    width: "100%",
    height: 250,
    borderWidth: 3,
    borderColor: "#ff9ac5",
    backgroundColor: "#fff1f8",
    padding: 4,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  noteInput: {
    width: "100%",
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: "#ff9ac5",
    borderWidth: 3,
    borderRadius: 0,
    backgroundColor: "#fff7fb",
    color: "#7f1d49",
    fontFamily: Fonts?.mono,
    fontSize: 14,
  },
  saveButton: {
    width: "100%",
    borderRadius: 0,
    borderWidth: 3,
    borderColor: "#ff6ea9",
    backgroundColor: "#ff6ea9",
    marginTop: 2,
    shadowColor: "#c14d82",
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
    color: "#fff7fb",
  },
  hintText: {
    marginTop: 8,
    fontFamily: Fonts?.mono,
    color: "#8f2b57",
    opacity: 0.9,
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
