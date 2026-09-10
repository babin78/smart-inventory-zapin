import { useRouter } from 'expo-router';
import { Host, Button, Column, Text } from '@expo/ui';
import { ScrollView } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function CaptureReviewScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: Spacing.four }}>
        <Host matchContents>
          <Column>
            <Text>
              The full product form appears here after photos and Check. Submit stays blocked
              without a username and PIN.
            </Text>
            <Button disabled>Submit</Button>
            <Button variant="outlined" onPress={() => router.back()}>
              Back
            </Button>
          </Column>
        </Host>
      </ScrollView>
    </ThemedView>
  );
}
