import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/src/hooks/useAuth";
import { useI18n } from "@/src/i18n/app-i18n";
import { usePixelTheme, type PixelTheme } from "@/src/theme/pixel-theme";

function PixelTabIcon({
  name,
  color,
  focused,
  theme,
}: {
  name: string;
  color: string;
  focused: boolean;
  theme: PixelTheme;
}) {
  const styles = getStyles(theme);

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
  const { t } = useI18n();
  const { theme } = usePixelTheme();
  const styles = getStyles(theme);

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
        <View style={{ height: 8 }} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.tabBg,
          borderTopWidth: 3,
          borderTopColor: theme.tabBorder,
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.feedTitle"),
          tabBarIcon: ({ color, focused }) => (
            <PixelTabIcon
              color={color}
              focused={focused}
              name="rectangle.stack.fill"
              theme={theme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t("tabs.createTitle"),
          tabBarIcon: ({ color, focused }) => (
            <PixelTabIcon
              color={color}
              focused={focused}
              name="camera.fill"
              theme={theme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settingsTitle"),
          tabBarIcon: ({ color, focused }) => (
            <PixelTabIcon
              color={color}
              focused={focused}
              name="gearshape.fill"
              theme={theme}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function getStyles(theme: PixelTheme) {
  return StyleSheet.create({
    iconFrame: {
      borderWidth: 2,
      borderColor: theme.tabBorder,
      backgroundColor: theme.iconFrame,
      padding: 2,
      shadowColor: theme.panelShadow,
      shadowOpacity: 0.8,
      shadowRadius: 0,
      shadowOffset: { width: 2, height: 2 },
      elevation: 5,
    },
    iconFrameFocused: {
      borderColor: theme.pixelDot,
      backgroundColor: theme.iconFrameFocused,
    },
    iconInner: {
      minWidth: 30,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.iconInner,
      borderWidth: 1,
      borderColor: theme.tabBorder,
    },
    iconInnerFocused: {
      backgroundColor: theme.iconInnerFocused,
      borderColor: theme.pixelDot,
    },
  });
}
