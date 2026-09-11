import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { PhotoCheck } from '@/components/capture/photo-check';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useDraft } from '@/lib/draft-context';
import { useMemo } from 'react';

export default function CapturePreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photoId?: string | string[] }>();
  const photoId = Array.isArray(params.photoId) ? params.photoId[0] : params.photoId;
  const { draft } = useDraft();

  const photo = useMemo(() => {
    if (photoId) {
      return draft.photos.find((item) => item.id === photoId) ?? draft.photos.at(-1);
    }
    return draft.photos.at(-1);
  }, [draft.photos, photoId]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/capture');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Check photo' }} />
      {photo ? (
        <PhotoCheck
          photo={photo}
          onUse={goBack}
          onBack={goBack}
          onCrop={() => router.push(`/capture/crop?photoId=${encodeURIComponent(photo.id)}`)}
        />
      ) : (
        <ThemedView style={{ flex: 1, padding: Spacing.four, gap: Spacing.three }}>
          <ThemedText>No photo to check yet.</ThemedText>
          <UiButton label="Back" onPress={goBack} />
        </ThemedView>
      )}
    </>
  );
}
