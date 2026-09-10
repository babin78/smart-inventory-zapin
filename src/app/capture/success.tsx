import { useRouter } from 'expo-router';
import { Host, Button, Column, Text } from '@expo/ui';
import { ScrollView } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function CaptureSuccessScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: Spacing.four }}>
        <Host matchContents>
          <Column>
            <Text>Saved. The checkmark animation and camera reset come after ingest.</Text>
            <Button onPress={() => router.replace('/capture')}>Next item</Button>
          </Column>
        </Host>
      </ScrollView>
    </ThemedView>
  );
}
