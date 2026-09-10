import { Stack } from 'expo-router/stack';
import { View } from 'react-native';

import { CaptureProgressBar } from '@/components/capture/progress-bar';
import { ThemedView } from '@/components/themed-view';

export default function CaptureLayout() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <CaptureProgressBar percent={0} />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
          }}>
          <Stack.Screen name="index" options={{ title: 'Capture' }} />
          <Stack.Screen name="crop" options={{ title: 'Crop' }} />
          <Stack.Screen name="review" options={{ title: 'Review' }} />
          <Stack.Screen name="success" options={{ title: 'Saved' }} />
        </Stack>
      </View>
    </ThemedView>
  );
}
