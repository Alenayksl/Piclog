import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/src/hooks/useAuth";

function PixelTabIcon({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconFrame, focused && styles.iconFrameFocused]}>
      <View style={[styles.iconInner, focused && styles.iconInnerFocused]}>
        <IconSymbol size={20} name={name} color={color} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8f2b57",
        tabBarInactiveTintColor: "#b85a89",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#ffe4f1",
          borderTopWidth: 3,
          borderTopColor: "#ff9ac5",
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Akış",
          tabBarIcon: ({ color, focused }) => (
            <PixelTabIcon
              color={color}
              focused={focused}
              name="rectangle.stack.fill"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Fotoğraf Ekle",
          tabBarIcon: ({ color, focused }) => (
            <PixelTabIcon color={color} focused={focused} name="camera.fill" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconFrame: {
    borderWidth: 2,
    borderColor: "#ff9ac5",
    backgroundColor: "#ffd4e9",
    padding: 2,
    shadowColor: "#c14d82",
    shadowOpacity: 0.8,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
    elevation: 5,
  },
  iconFrameFocused: {
    borderColor: "#ff6ea9",
    backgroundColor: "#ffbedd",
  },
  iconInner: {
    minWidth: 30,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f8",
    borderWidth: 1,
    borderColor: "#ff9ac5",
  },
  iconInnerFocused: {
    backgroundColor: "#ffffff",
    borderColor: "#ff6ea9",
  },
});
