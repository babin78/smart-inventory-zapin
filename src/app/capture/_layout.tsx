import { Stack } from 'expo-router/stack';

export default function CaptureLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" options={{ title: 'Capture' }} />
      <Stack.Screen name="crop" options={{ title: 'Crop' }} />
      <Stack.Screen name="review" options={{ title: 'Review' }} />
      <Stack.Screen name="success" options={{ title: 'Saved' }} />
    </Stack>
  );
}
