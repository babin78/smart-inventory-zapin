import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function CaptureCropScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: Spacing.four }}>
        <View style={{ gap: Spacing.three }}>
          <ThemedText>
            Crop and highlight land in the camera phase. Nothing is saved yet.
          </ThemedText>
          <UiButton label="Back to camera" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}
