import Constants from 'expo-constants';

export const PIN_HEADER = 'x-shop-pin';
export const INTEGRITY_HEADER = 'x-integrity-token';
export const HASH_HEADER = 'x-request-hash';

export function getFunctionsBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as { functionsBaseUrl?: string } | undefined;
  return extra?.functionsBaseUrl?.replace(/\/$/, '') ?? '';
}

export function getIntegrityMode(): 'debug' | 'production' {
  const extra = Constants.expoConfig?.extra as { integrityMode?: string } | undefined;
  return extra?.integrityMode === 'production' ? 'production' : 'debug';
}

export function getCloudProjectNumber(): string {
  const extra = Constants.expoConfig?.extra as { cloudProjectNumber?: string } | undefined;
  return extra?.cloudProjectNumber ?? '';
}
