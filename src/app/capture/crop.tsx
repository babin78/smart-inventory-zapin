import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ZoomCrop, type ZoomCropHandle } from '@/components/capture/zoom-crop';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { draftWithCroppedPhoto } from '@/lib/draft';
import { useDraft } from '@/lib/draft-context';
import { persistPhotoFile } from '@/lib/draft-store';
import { cropCaptureUri } from '@/lib/image-compress';

export default function CaptureCropScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photoId?: string | string[] }>();
  const photoId = Array.isArray(params.photoId) ? params.photoId[0] : params.photoId;
  const { draft, persist } = useDraft();
  const cropRef = useRef<ZoomCropHandle>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photo = useMemo(() => {
    if (photoId) {
      return draft.photos.find((item) => item.id === photoId) ?? draft.photos.at(-1);
    }
    return draft.photos.at(-1);
  }, [draft.photos, photoId]);

  async function applyCrop() {
    const imageRect = cropRef.current?.readCrop();
    if (!photo || !imageRect) {
      setError('Zoom in on the label or barcode, then save crop.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const cropped = await cropCaptureUri(photo.uri, imageRect);
      const uri = await persistPhotoFile({
        draftId: draft.draftId,
        sourceUri: cropped.uri,
        fileName: `${photo.id}-${Date.now()}.jpg`,
      });
      await persist(
        draftWithCroppedPhoto(draft, photo.id, {
          uri,
          width: cropped.width,
          height: cropped.height,
        }),
      );
      router.replace(`/capture?check=${encodeURIComponent(photo.id)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not crop the photo.');
    } finally {
      setBusy(false);
    }
  }

  if (!photo) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.four, gap: Spacing.three }}>
        <ThemedText>Take a photo first, then crop.</ThemedText>
        <UiButton label="Back" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ZoomCrop
            ref={cropRef}
            uri={photo.uri}
            imageWidth={photo.width}
            imageHeight={photo.height}
          />
        </View>
        <View style={{ padding: Spacing.three, gap: Spacing.two }}>
          <ThemedText type="small" themeColor="textSecondary">
            Pinch or use + / − to zoom, then drag to pan. Save crop replaces this photo with the
            area inside the green frame.
          </ThemedText>
          {error ? <ThemedText type="small">{error}</ThemedText> : null}
          <UiButton label={busy ? 'Saving…' : 'Save crop'} disabled={busy} onPress={() => void applyCrop()} />
          <UiButton label="Cancel" variant="outlined" onPress={() => router.back()} />
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}
