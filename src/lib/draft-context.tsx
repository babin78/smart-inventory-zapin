import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { type CaptureDraft, createEmptyDraft, draftProgressPercent, hasFrontPhoto } from '@/lib/draft';
import { loadActiveDraft, saveDraft, startNewDraft } from '@/lib/draft-store';

type DraftContextValue = {
  ready: boolean;
  draft: CaptureDraft;
  percent: number;
  canLeaveCamera: boolean;
  persist: (next: CaptureDraft) => Promise<void>;
  resetDraft: () => Promise<void>;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<CaptureDraft>(createEmptyDraft);

  useEffect(() => {
    let cancelled = false;
    loadActiveDraft()
      .catch(() => createEmptyDraft())
      .then((loaded) => {
        if (!cancelled) {
          setDraft(loaded);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: CaptureDraft) => {
    const stored = await saveDraft(next);
    setDraft(stored);
  }, []);

  const resetDraft = useCallback(async () => {
    const next = await startNewDraft();
    setDraft(next);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      draft,
      percent: draftProgressPercent(draft),
      canLeaveCamera: hasFrontPhoto(draft),
      persist,
      resetDraft,
    }),
    [ready, draft, persist, resetDraft],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const value = useContext(DraftContext);
  if (!value) {
    throw new Error('useDraft must be used within DraftProvider');
  }
  return value;
}
