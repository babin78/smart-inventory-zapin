import { useRouter } from 'expo-router';
import { Host, Button, Column, Text } from '@expo/ui';
import { ScrollView } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function CaptureCropScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: Spacing.four }}>
        <Host matchContents>
          <Column>
            <Text>Crop and highlight land in the camera phase. Nothing is saved yet.</Text>
            <Button onPress={() => router.back()}>Back to camera</Button>
          </Column>
        </Host>
      </ScrollView>
    </ThemedView>
  );
}
