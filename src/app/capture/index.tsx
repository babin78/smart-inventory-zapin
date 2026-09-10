import { useRouter } from 'expo-router';
import { Host, Button, Column, Text } from '@expo/ui';
import { ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function CaptureCameraScreen() {
  const router = useRouter();
  const hasFrontPhoto = false;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: Spacing.four,
          gap: Spacing.three,
          flexGrow: 1,
        }}>
        <View
          style={{
            flex: 1,
            minHeight: 280,
            borderRadius: Spacing.four,
            borderCurve: 'continuous',
            backgroundColor: '#111111',
            alignItems: 'center',
            justifyContent: 'center',
            padding: Spacing.four,
          }}>
          <ThemedText style={{ color: '#ffffff', textAlign: 'center' }}>
            Camera preview will appear here. A front photo is required before Check or Review.
          </ThemedText>
        </View>
        <Host matchContents>
          <Column>
            <Button disabled>Shutter</Button>
            <Button disabled>Add another photo</Button>
            <Button disabled={!hasFrontPhoto}>Check</Button>
            <Button disabled={!hasFrontPhoto} onPress={() => router.push('/capture/review')}>
              Review
            </Button>
            <Button variant="outlined" onPress={() => router.back()}>
              Close
            </Button>
            <Text>Check and Review stay off until a front photo exists.</Text>
          </Column>
        </Host>
      </ScrollView>
    </ThemedView>
  );
}
