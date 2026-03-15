import { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/hooks/useAuth';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Anı #{id}</ThemedText>
      {/* TODO: Anı detayı buraya gelecek */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
