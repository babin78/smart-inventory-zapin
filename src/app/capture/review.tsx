import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function CaptureReviewScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: Spacing.four }}>
        <View style={{ gap: Spacing.three }}>
          <ThemedText>
            The full product form appears here after photos and Check. Submit stays blocked without
            a username and PIN.
          </ThemedText>
          <UiButton label="Submit" disabled />
          <UiButton label="Back" variant="outlined" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}
