import { requireOptionalNativeModule } from 'expo-modules-core';

const USERNAME_KEY = 'shop.username';
const PIN_KEY = 'shop.pin';

export type Session = {
  username: string;
  pin: string;
};

type SecureStoreApi = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
};

let memorySession: Session = { username: '', pin: '' };

export function isSessionComplete(session: Session): boolean {
  return session.username.trim().length > 0 && session.pin.trim().length > 0;
}

export function canPersistSession(): boolean {
  return requireOptionalNativeModule('ExpoSecureStore') != null;
}

function getSecureStore(): SecureStoreApi | null {
  if (!canPersistSession()) {
    return null;
  }

  try {
    return require('expo-secure-store') as SecureStoreApi;
  } catch {
    return null;
  }
}

export async function loadSession(): Promise<Session> {
  const store = getSecureStore();
  if (!store) {
    return memorySession;
  }

  const [username, pin] = await Promise.all([
    store.getItemAsync(USERNAME_KEY),
    store.getItemAsync(PIN_KEY),
  ]);

  memorySession = {
    username: username ?? '',
    pin: pin ?? '',
  };
  return memorySession;
}

export async function saveSession(session: Session): Promise<Session> {
  const next: Session = {
    username: session.username.trim(),
    pin: session.pin.trim(),
  };

  memorySession = next;

  const store = getSecureStore();
  if (store) {
    await Promise.all([
      store.setItemAsync(USERNAME_KEY, next.username),
      store.setItemAsync(PIN_KEY, next.pin),
    ]);
  }

  return next;
}
