import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { captureNeedsDevClient } from '@/lib/native-modules';

export default function CaptureCameraScreen() {
  const router = useRouter();

  if (captureNeedsDevClient()) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.four, gap: Spacing.three }}>
        <ThemedText type="subtitle">Camera needs a new development build</ThemedText>
        <ThemedText>
          This phase uses expo-camera, file storage, and image compression. Rebuild the EAS
          development APK, install it, then open the project with the dev client.
        </ThemedText>
        <UiButton label="Close" variant="outlined" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return <LoadedCameraCapture />;
}

function LoadedCameraCapture() {
  const [CameraCapture] = useState(
    () =>
      (require('@/components/capture/camera-capture') as typeof import('@/components/capture/camera-capture'))
        .CameraCapture,
  );
  return <CameraCapture />;
}
