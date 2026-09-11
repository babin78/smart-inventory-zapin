import { Image } from 'expo-image';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import type { DraftPhoto } from '@/lib/draft';

type PhotoCheckProps = {
  photo: DraftPhoto;
  busy?: boolean;
  onBack: () => void;
  onUse: () => void;
  onCrop?: () => void;
};

export function PhotoCheck({ photo, busy = false, onBack, onUse, onCrop }: PhotoCheckProps) {
  const purposeLabel =
    photo.purpose === 'front' ? 'Front of pack' : photo.purpose === 'extra' ? 'Extra photo' : 'Crop';

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <Image
          source={{ uri: photo.uri }}
          recyclingKey={`${photo.id}-${photo.uri}`}
          cachePolicy="none"
          contentFit="contain"
          style={{ width: '100%', height: '100%' }}
        />
      </View>
      <View style={{ padding: Spacing.three, gap: Spacing.two }}>
        <ThemedText type="small" themeColor="textSecondary">
          {purposeLabel}. If it looks good, continue to the next photo. Delete a shot from its
          thumbnail on the camera screen.
        </ThemedText>
        <UiButton label="Use photo, take next" disabled={busy} onPress={onUse} />
        {onCrop ? (
          <UiButton label="Crop / zoom this photo" variant="outlined" disabled={busy} onPress={onCrop} />
        ) : null}
        <UiButton label="Back" variant="outlined" disabled={busy} onPress={onBack} />
      </View>
    </ThemedView>
  );
}
