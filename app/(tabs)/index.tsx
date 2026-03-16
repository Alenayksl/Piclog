import { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";

import { LogCard } from "@/src/components/LogCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/src/services/supabase";



export default function FeedScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Akış</ThemedText>
      {/* TODO: Log listesi buraya gelecek */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
