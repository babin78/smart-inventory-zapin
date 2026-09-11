import { Image } from 'expo-image';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoCheck } from '@/components/capture/photo-check';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { draftWithoutPhoto, extraPhotoCount, hasFrontPhoto, visiblePhotos, type DraftPhoto } from '@/lib/draft';
import { useDraft } from '@/lib/draft-context';
import { runProductCheck } from '@/lib/check-flow';
import { deleteDraftPhotoFile, persistPhotoFile } from '@/lib/draft-store';
import { compressCaptureUri } from '@/lib/image-compress';
import { hasHapticsNative } from '@/lib/native-modules';

export function CameraCapture() {
  const router = useRouter();
  const params = useLocalSearchParams<{ check?: string | string[] }>();
  const checkId = Array.isArray(params.check) ? params.check[0] : params.check;
  const insets = useSafeAreaInsets();
  const { draft, persist, canLeaveCamera, resetDraft } = useDraft();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<ComponentRef<typeof CameraView>>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkHint, setCheckHint] = useState<string | null>(null);
  const [checkBusy, setCheckBusy] = useState(false);
  const [checking, setChecking] = useState<DraftPhoto | null>(null);

  useEffect(() => {
    if (!checkId) {
      return;
    }
    const photo = draft.photos.find((item) => item.id === checkId);
    if (photo) {
      setChecking(photo);
    }
  }, [checkId, draft.photos]);

  if (!permission) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', padding: Spacing.four }}>
        <ThemedText>Checking camera permission…</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.three }}>
        <ThemedText type="subtitle">Photograph the pack</ThemedText>
        <ThemedText>
          The camera is used only to capture product photos on this device. Photos stay in a local
          draft until you Submit later.
        </ThemedText>
        <UiButton label="Grant camera access" onPress={() => void requestPermission()} />
        <UiButton label="Close" variant="outlined" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  async function takePhoto() {
    if (!cameraRef.current || busy || !ready || checking) {
      return;
    }
    setBusy(true);
    setError(null);
    setCheckHint(null);
    try {
      if (hasHapticsNative()) {
        const Haptics = require('expo-haptics') as typeof import('expo-haptics');
        await Haptics.selectionAsync();
      }
      const shot = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!shot?.uri) {
        throw new Error('Camera did not return a file.');
      }
      const compressed = await compressCaptureUri(shot.uri, shot.width, shot.height);
      const isFront = !hasFrontPhoto(draft);
      const extraIndex = extraPhotoCount(draft) + 1;
      const fileName = isFront ? 'front.jpg' : `extra-${extraIndex}.jpg`;
      const uri = await persistPhotoFile({
        draftId: draft.draftId,
        sourceUri: compressed.uri,
        fileName,
      });
      const photo: DraftPhoto = {
        id: fileName.replace(/\.jpg$/i, ''),
        purpose: isFront ? 'front' : 'extra',
        uri,
        width: compressed.width,
        height: compressed.height,
      };
      await persist({ ...draft, photos: [...draft.photos, photo] });
      setChecking(photo);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the photo.');
    } finally {
      setBusy(false);
    }
  }

  async function retake(photo: DraftPhoto) {
    setBusy(true);
    try {
      await deleteDraftPhotoFile(photo.uri);
      if (photo.originalUri) {
        await deleteDraftPhotoFile(photo.originalUri);
      }
      await persist(draftWithoutPhoto(draft, photo.id));
      setChecking(null);
    } finally {
      setBusy(false);
    }
  }

  async function onCheck() {
    if (!canLeaveCamera || busy || checkBusy) {
      return;
    }
    setCheckBusy(true);
    setCheckHint(null);
    try {
      const result = await runProductCheck(draft);
      await persist(result.merged);
      const note = result.warnings.filter(Boolean).join(' ');
      setCheckHint(note || 'Label read. Open Review to correct fields, then Check again after another photo.');
    } catch (caught) {
      setCheckHint(caught instanceof Error ? caught.message : 'Check failed.');
    } finally {
      setCheckBusy(false);
    }
  }

  if (checking) {
    return (
      <PhotoCheck
        photo={checking}
        busy={busy}
        onUse={() => {
          setChecking(null);
          if (checkId) {
            router.replace('/capture');
          }
        }}
        onBack={() => {
          setChecking(null);
          if (checkId) {
            router.replace('/capture');
          }
        }}
        onCrop={() => {
          setChecking(null);
          router.push(`/capture/crop?photoId=${encodeURIComponent(checking.id)}`);
        }}
      />
    );
  }

  const front = draft.photos.find((photo) => photo.purpose === 'front');

  return (
    <ThemedView style={{ flex: 1, paddingBottom: insets.bottom }}>
      <View style={{ flex: 1, backgroundColor: '#000000', minHeight: 220 }}>
        <CameraView
          ref={cameraRef}
          facing="back"
          style={{ flex: 1 }}
          onCameraReady={() => setReady(true)}
        />
      </View>
      <View style={{ padding: Spacing.three, gap: Spacing.two }}>
        {draft.photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              {visiblePhotos(draft).map((photo) => (
                <View key={photo.id} style={{ width: 56 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`View ${photo.purpose} photo`}
                    onPress={() => setChecking(photo)}>
                    <Image
                      source={{ uri: photo.uri }}
                      recyclingKey={`${photo.id}-${photo.uri}`}
                      cachePolicy="none"
                      contentFit="cover"
                      style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: '#222' }}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${photo.purpose} photo`}
                    onPress={() => void retake(photo)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: '#8B1E1E',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <ThemedText type="smallBold" style={{ color: '#ffffff', fontSize: 12, lineHeight: 14 }}>
                      ×
                    </ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {busy
            ? 'Saving photo…'
            : front
              ? 'After you accept a photo, shutter takes the next extra shot (dates, barcode, rear).'
              : 'Front of the pack is required before Check or Review.'}
        </ThemedText>
        {error ? <ThemedText type="small">{error}</ThemedText> : null}
        {checkHint ? <ThemedText type="small">{checkHint}</ThemedText> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Shutter"
          disabled={busy || !ready}
          onPress={() => void takePhoto()}
          style={{
            alignSelf: 'center',
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#ffffff',
            borderWidth: 4,
            borderColor: '#2E7D32',
            opacity: busy || !ready ? 0.45 : 1,
          }}
        />
        <UiButton
          label="Add another photo"
          disabled={!canLeaveCamera || busy}
          onPress={() => void takePhoto()}
        />
        <UiButton
          label={checkBusy ? 'Reading label…' : 'Check'}
          disabled={!canLeaveCamera || busy || checkBusy}
          onPress={() => void onCheck()}
        />
          <UiButton
            label="Review"
            disabled={!canLeaveCamera || busy || checkBusy}
            onPress={() => router.push('/capture/review')}
          />
        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          <View style={{ flex: 1 }}>
            <UiButton label="Start over" variant="outlined" onPress={() => void resetDraft()} />
          </View>
          <View style={{ flex: 1 }}>
            <UiButton label="Close" variant="outlined" onPress={() => router.back()} />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}
