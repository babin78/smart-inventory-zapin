import { Stack } from 'expo-router/stack';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CaptureProgressBar } from '@/components/capture/progress-bar';
import { useDraft } from '@/lib/draft-context';

export default function CaptureLayout() {
  const { percent } = useDraft();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <CaptureProgressBar percent={percent} />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
          }}>
          <Stack.Screen name="index" options={{ title: 'Capture', headerShown: false }} />
          <Stack.Screen name="preview" options={{ title: 'Check photo' }} />
          <Stack.Screen name="crop" options={{ title: 'Crop' }} />
          <Stack.Screen name="review" options={{ title: 'Review' }} />
          <Stack.Screen name="success" options={{ title: 'Saved' }} />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
