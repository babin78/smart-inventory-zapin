import { Image } from 'expo-image';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { viewportToImageCrop, type ImageCropRect } from '@/lib/crop-math';

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 1.25;
const FRAME_INSET = Spacing.three;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export type ZoomCropHandle = {
  readCrop: () => ImageCropRect | null;
};

type ZoomCropProps = {
  uri: string;
  imageWidth: number;
  imageHeight: number;
};

export const ZoomCrop = forwardRef<ZoomCropHandle, ZoomCropProps>(function ZoomCrop(
  { uri, imageWidth, imageHeight },
  ref,
) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.get() * event.scale));
          scale.set(next);
        })
        .onEnd(() => {
          savedScale.set(scale.get());
          if (scale.get() <= MIN_SCALE + 0.01) {
            translateX.set(withTiming(0, { duration: 150, easing: EASE_OUT }));
            translateY.set(withTiming(0, { duration: 150, easing: EASE_OUT }));
            savedX.set(0);
            savedY.set(0);
          }
        }),
    [savedScale, savedX, savedY, scale, translateX, translateY],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minPointers(1)
        .onUpdate((event) => {
          if (scale.get() <= 1) {
            return;
          }
          translateX.set(savedX.get() + event.translationX);
          translateY.set(savedY.get() + event.translationY);
        })
        .onEnd(() => {
          savedX.set(translateX.get());
          savedY.set(translateY.get());
        }),
    [savedX, savedY, scale, translateX, translateY],
  );

  const composed = useMemo(() => Gesture.Simultaneous(pinch, pan), [pan, pinch]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
      { scale: scale.get() },
    ],
  }));

  useImperativeHandle(ref, () => ({
    readCrop() {
      if (viewport.width < 8 || viewport.height < 8) {
        return null;
      }
      return viewportToImageCrop(
        viewport,
        { width: imageWidth, height: imageHeight },
        {
          scale: scale.get(),
          translateX: translateX.get(),
          translateY: translateY.get(),
        },
        FRAME_INSET,
      );
    },
  }));

  function zoomTo(nextScale: number) {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    scale.set(withTiming(next, { duration: 150, easing: EASE_OUT }));
    savedScale.set(next);
    if (next <= MIN_SCALE) {
      translateX.set(withTiming(0, { duration: 150, easing: EASE_OUT }));
      translateY.set(withTiming(0, { duration: 150, easing: EASE_OUT }));
      savedX.set(0);
      savedY.set(0);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={composed}>
        <View
          style={{ flex: 1, overflow: 'hidden', backgroundColor: '#111111' }}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setViewport({ width, height });
          }}>
          <Animated.View style={[{ width: '100%', height: '100%' }, imageStyle]}>
            <Image source={{ uri }} contentFit="contain" style={{ width: '100%', height: '100%' }} />
          </Animated.View>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: FRAME_INSET,
              right: FRAME_INSET,
              top: FRAME_INSET,
              bottom: FRAME_INSET,
              borderWidth: 2,
              borderColor: '#2E7D32',
            }}
          />
        </View>
      </GestureDetector>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: Spacing.two,
          paddingVertical: Spacing.two,
        }}>
        <ZoomButton label="−" onPress={() => zoomTo(savedScale.get() / ZOOM_STEP)} />
        <ZoomButton label="Reset" onPress={() => zoomTo(MIN_SCALE)} />
        <ZoomButton label="+" onPress={() => zoomTo(savedScale.get() * ZOOM_STEP)} />
      </View>
    </View>
  );
});

function ZoomButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        minWidth: 56,
        minHeight: 44,
        paddingHorizontal: Spacing.three,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Spacing.two,
        borderCurve: 'continuous',
        backgroundColor: '#1B6B2A',
      }}>
      <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
