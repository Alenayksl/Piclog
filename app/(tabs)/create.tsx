import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { CustomButton } from "@/src/components/CustomButton";
import { useLocation } from "@/src/hooks/useLocation";
import { useI18n } from "@/src/i18n/app-i18n";
import { reverseGeocode } from "@/src/services/location";
import { supabase } from "@/src/services/supabase";
import { getWeather } from "@/src/services/weather";
import { usePixelTheme, type PixelTheme } from "@/src/theme/pixel-theme";
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
  const { t, language } = useI18n();
  const { theme } = usePixelTheme();
  const styles = getStyles(theme);

  const { location } = useLocation();

  async function pickImageFromLibrary() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert(t("create.err.permissionGallery"));
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
      alert(t("create.err.permissionCamera"));
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
      alert(t("create.err.selectPhoto"));
      return;
    }

    if (!note.trim()) {
      alert(t("create.err.addNote"));
      return;
    }

    if (!location) {
      alert(t("create.err.locationMissing"));
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
        alert(t("create.err.userMissing"));
        setLoading(false);
        return;
      }

      const weatherData = await getWeather(
        location.latitude,
        location.longitude,
        language,
      );

      const addressData = await reverseGeocode(
        location.latitude,
        location.longitude,
        language,
      );

      const locationName = addressData?.city
        ? [addressData.city, addressData.country].filter(Boolean).join(", ")
        : (addressData?.formatted ?? null);

      if (!weatherData) {
        alert(t("create.err.weatherMissing"));
        setLoading(false);
        return;
      }
      if (!image.base64) {
        alert(t("create.err.photoDataMissing"));
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
        alert(t("create.err.uploadFailed"));
        setLoading(false);
        return;
      }

      if (!uploadData?.path) {
        console.error("Upload completed but path is missing", uploadData);
        alert(t("create.err.pathMissing"));
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
        alert(t("create.err.saveFailed", { message: postError.message }));
        setLoading(false);
        return;
      }
      alert(t("create.success"));
      setImage(null);
      setnote("");
    } catch (error) {
      console.error("Error:", error);
      alert(t("create.err.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={theme.backgroundAsset}
        style={styles.backgroundGif}
        contentFit="cover"
      />
      <View style={styles.backgroundTint} />

      <ThemedView style={styles.panel}>
        <View style={styles.pixelDotTopLeft} />
        <View style={styles.pixelDotTopRight} />

        <ThemedText type="title" style={styles.title}>
          {t("tabs.createTitle")}
        </ThemedText>

        <CustomButton
          title={t("create.pickFromGallery")}
          onPress={pickImageFromLibrary}
          disabled={loading}
          style={styles.actionButton}
          textStyle={styles.buttonText}
        />
        <CustomButton
          title={t("create.takePhoto")}
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
              placeholder={t("create.notePlaceholder")}
              placeholderTextColor={theme.subtitle}
              value={note}
              onChangeText={setnote}
              style={styles.noteInput}
            />
            <CustomButton
              title={loading ? t("create.saving") : t("create.save")}
              onPress={handleSavePost}
              disabled={loading}
              style={styles.saveButton}
              textStyle={styles.buttonText}
            />
          </>
        ) : (
          <ThemedText style={styles.hintText}>{t("create.hint")}</ThemedText>
        )}
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
      color: "#8f2b57",
      fontSize: 12,
      marginBottom: 6,
      letterSpacing: 0.6,
    },
    actionButton: {
      width: "100%",
      borderRadius: 0,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.buttonPrimary,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.9,
      shadowRadius: 0,
      shadowOffset: { width: 3, height: 3 },
      elevation: 6,
    },
    actionButtonAlt: {
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
    previewFrame: {
      width: "100%",
      height: 250,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.inputBg,
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
      borderColor: theme.inputBorder,
      borderWidth: 3,
      borderRadius: 0,
      backgroundColor: theme.inputBg,
      color: theme.title,
      fontFamily: Fonts?.mono,
      fontSize: 14,
    },
    saveButton: {
      width: "100%",
      borderRadius: 0,
      borderWidth: 3,
      borderColor: theme.panelBorder,
      backgroundColor: theme.buttonDanger,
      marginTop: 2,
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
    hintText: {
      marginTop: 8,
      fontFamily: Fonts?.mono,
      color: theme.subtitle,
      opacity: 0.9,
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
