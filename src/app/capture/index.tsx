import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { CaptureProgressBar } from '@/components/capture/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function CaptureCameraScreen() {
  const router = useRouter();
  const hasFrontPhoto = false;

  return (
    <ThemedView style={{ flex: 1 }}>
      <CaptureProgressBar percent={0} />
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
        <View style={{ gap: Spacing.two }}>
          <UiButton label="Shutter" disabled />
          <UiButton label="Add another photo" disabled />
          <UiButton label="Check" disabled={!hasFrontPhoto} />
          <UiButton
            label="Review"
            disabled={!hasFrontPhoto}
            onPress={() => router.push('/capture/review')}
          />
          <UiButton label="Close" variant="outlined" onPress={() => router.back()} />
          <ThemedText type="small" themeColor="textSecondary">
            Check and Review stay off until a front photo exists.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
