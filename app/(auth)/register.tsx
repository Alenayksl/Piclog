import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { CustomButton } from '@/src/components/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RegisterScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Kayıt Ol</ThemedText>
      {/* TODO: Register form */}
      <CustomButton title="Kayıt Ol" onPress={() => {}} />
      <Link href="/(auth)/login" asChild>
        <ThemedText type="link" style={styles.link}>
          Zaten hesabın var mı? Giriş yap
        </ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 16,
  },
});
