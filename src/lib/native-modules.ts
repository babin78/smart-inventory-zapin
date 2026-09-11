import { requireOptionalNativeModule } from 'expo-modules-core';

export function hasCameraNative(): boolean {
  return requireOptionalNativeModule('ExpoCamera') != null;
}

export function hasFileSystemNative(): boolean {
  return requireOptionalNativeModule('FileSystem') != null;
}

export function hasImageManipulatorNative(): boolean {
  return requireOptionalNativeModule('ExpoImageManipulator') != null;
}

export function hasHapticsNative(): boolean {
  return requireOptionalNativeModule('ExpoHaptics') != null;
}

export function captureNeedsDevClient(): boolean {
  return !hasCameraNative() || !hasFileSystemNative() || !hasImageManipulatorNative();
}
