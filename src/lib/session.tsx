import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode, use as useContext } from 'react';

import {
  canPersistSession,
  isSessionComplete,
  loadSession,
  saveSession as persistSession,
  type Session,
} from '@/lib/session-store';

type SessionContextValue = {
  ready: boolean;
  session: Session;
  isComplete: boolean;
  persistsAcrossRestarts: boolean;
  saveSession: (next: Session) => Promise<Session>;
};

const emptySession: Session = { username: '', pin: '' };

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session>(emptySession);

  useEffect(() => {
    let cancelled = false;

    loadSession()
      .catch(() => emptySession)
      .then((loaded) => {
        if (!cancelled) {
          setSession(loaded);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveSession = useCallback(async (next: Session) => {
    const stored = await persistSession(next);
    setSession(stored);
    return stored;
  }, []);

  const value = useMemo(
    () => ({
      ready,
      session,
      isComplete: isSessionComplete(session),
      persistsAcrossRestarts: canPersistSession(),
      saveSession,
    }),
    [ready, session, saveSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return value;
}
