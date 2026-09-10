import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function CaptureSuccessScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: Spacing.four }}>
        <View style={{ gap: Spacing.three }}>
          <ThemedText>
            Saved. The checkmark animation and camera reset come after ingest.
          </ThemedText>
          <UiButton label="Next item" onPress={() => router.replace('/capture')} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}
