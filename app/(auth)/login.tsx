import { StyleSheet, View } from 'react-native';

import { CustomButton } from '@/src/components/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Giriş Yap</ThemedText>
      {/* TODO: Login form */}
      <CustomButton title="Giriş Yap" onPress={() => {}} />
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
});
