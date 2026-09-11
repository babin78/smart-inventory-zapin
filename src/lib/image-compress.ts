import { hasImageManipulatorNative } from '@/lib/native-modules';
import { storageUri } from '@/lib/draft-store';

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.8;

export async function compressCaptureUri(uri: string, width: number, height: number): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  if (!hasImageManipulatorNative()) {
    return { uri, width, height };
  }

  const { ImageManipulator, SaveFormat } = require('expo-image-manipulator') as typeof import('expo-image-manipulator');
  const context = ImageManipulator.manipulate(storageUri(uri));
  const longest = Math.max(width, height);

  if (longest > MAX_EDGE) {
    if (width >= height) {
      context.resize({ width: MAX_EDGE });
    } else {
      context.resize({ height: MAX_EDGE });
    }
  }

  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  return { uri: saved.uri, width: saved.width, height: saved.height };
}

export async function cropCaptureUri(
  uri: string,
  crop: { originX: number; originY: number; width: number; height: number },
): Promise<{ uri: string; width: number; height: number }> {
  if (!hasImageManipulatorNative()) {
    return { uri, width: crop.width, height: crop.height };
  }

  const { ImageManipulator, SaveFormat } = require('expo-image-manipulator') as typeof import('expo-image-manipulator');
  const context = ImageManipulator.manipulate(storageUri(uri));
  context.crop({
    originX: Math.max(0, Math.floor(crop.originX)),
    originY: Math.max(0, Math.floor(crop.originY)),
    width: Math.max(1, Math.floor(crop.width)),
    height: Math.max(1, Math.floor(crop.height)),
  });

  const longest = Math.max(crop.width, crop.height);
  if (longest > MAX_EDGE) {
    if (crop.width >= crop.height) {
      context.resize({ width: MAX_EDGE });
    } else {
      context.resize({ height: MAX_EDGE });
    }
  }

  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  return { uri: saved.uri, width: saved.width, height: saved.height };
}
