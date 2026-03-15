import { StyleSheet } from 'react-native';

import { CustomButton } from '@/src/components/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CreateScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Fotoğraf Ekle</ThemedText>
      {/* TODO: Fotoğraf çekme ve kayıt mantığı */}
      <CustomButton title="Fotoğraf Çek" onPress={() => {}} />
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
