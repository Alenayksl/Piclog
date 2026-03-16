import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CustomButton } from "@/src/components/CustomButton";
import { useLocation } from "@/src/hooks/useLocation";
import { supabase } from "@/src/services/supabase";
import { getWeather } from "@/src/services/weather";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";

export default function CreateScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setnote] = useState("");

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
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
      if (!weatherData) {
        alert("Hava durum bilgisi alınamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      const response = await fetch(image);
      const blob = await response.blob();
      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, blob, {
          cacheControl: "3600",
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
        location_name: null,
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
      <ThemedText type="title">Fotoğraf Ekle</ThemedText>
      <CustomButton
        title="Galeriden Seç"
        onPress={pickImageFromLibrary}
        disabled={loading}
      />
      <CustomButton
        title="Fotoğraf Çek"
        onPress={takePhoto}
        disabled={loading}
      />

      {image && (
        <>
          <TextInput
            placeholder="Not ekle..."
            value={note}
            onChangeText={setnote}
            style={{
              width: "100%",
              padding: 10,
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 5,
              marginTop: 10,
            }}
          />
          <CustomButton
            title={loading ? "Kaydediliyor..." : "Kaydet"}
            onPress={handleSavePost}
            disabled={loading}
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
