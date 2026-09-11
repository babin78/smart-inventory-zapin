import { createEmptyDraft, type CaptureDraft } from '@/lib/draft';
import { hasFileSystemNative } from '@/lib/native-modules';

type FileSystemApi = typeof import('expo-file-system');

const ACTIVE_FILE = 'active.json';
const DRAFT_FILE = 'draft.json';

let memoryDraft: CaptureDraft | null = null;

function getFS(): FileSystemApi | null {
  if (!hasFileSystemNative()) {
    return null;
  }
  try {
    return require('expo-file-system') as FileSystemApi;
  } catch {
    return null;
  }
}

function draftDirectory(fs: FileSystemApi, draftId: string) {
  return new fs.Directory(fs.Paths.cache, 'capture', draftId);
}

function ensureDraftDir(fs: FileSystemApi, draftId: string) {
  const dir = draftDirectory(fs, draftId);
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function activePointerFile(fs: FileSystemApi) {
  const root = new fs.Directory(fs.Paths.cache, 'capture');
  root.create({ intermediates: true, idempotent: true });
  return new fs.File(root, ACTIVE_FILE);
}

export function canPersistDraft(): boolean {
  return hasFileSystemNative();
}

export function storageUri(uri: string): string {
  return uri.split('?')[0];
}

export async function loadActiveDraft(): Promise<CaptureDraft> {
  const fs = getFS();
  if (!fs) {
    memoryDraft ??= createEmptyDraft();
    return memoryDraft;
  }

  try {
    const pointer = activePointerFile(fs);
    if (!pointer.exists) {
      const draft = createEmptyDraft();
      await saveDraft(draft);
      return draft;
    }
    const { draftId } = JSON.parse(pointer.textSync()) as { draftId?: string };
    if (!draftId) {
      const draft = createEmptyDraft();
      await saveDraft(draft);
      return draft;
    }
    const json = new fs.File(draftDirectory(fs, draftId), DRAFT_FILE);
    if (!json.exists) {
      const draft = createEmptyDraft(draftId);
      await saveDraft(draft);
      return draft;
    }
    const parsed = JSON.parse(json.textSync()) as CaptureDraft;
    memoryDraft = {
      ...createEmptyDraft(parsed.draftId),
      ...parsed,
      photos: Array.isArray(parsed.photos) ? parsed.photos : [],
      userEditedFields: Array.isArray(parsed.userEditedFields) ? parsed.userEditedFields : [],
    };
    return memoryDraft;
  } catch {
    const draft = createEmptyDraft();
    memoryDraft = draft;
    return draft;
  }
}

export async function saveDraft(draft: CaptureDraft): Promise<CaptureDraft> {
  memoryDraft = draft;
  const fs = getFS();
  if (!fs) {
    return draft;
  }

  const dir = ensureDraftDir(fs, draft.draftId);
  const json = new fs.File(dir, DRAFT_FILE);
  if (!json.exists) {
    json.create();
  }
  json.write(JSON.stringify(draft));
  const pointer = activePointerFile(fs);
  if (!pointer.exists) {
    pointer.create();
  }
  pointer.write(JSON.stringify({ draftId: draft.draftId }));
  return draft;
}

export async function startNewDraft(): Promise<CaptureDraft> {
  const next = createEmptyDraft();
  return saveDraft(next);
}

export async function persistPhotoFile(params: {
  draftId: string;
  sourceUri: string;
  fileName: string;
}): Promise<string> {
  const fs = getFS();
  if (!fs) {
    return params.sourceUri;
  }

  const dir = ensureDraftDir(fs, params.draftId);
  const destination = new fs.File(dir, params.fileName);
  const source = new fs.File(storageUri(params.sourceUri));
  if (destination.exists) {
    destination.delete();
  }
  await source.copy(destination);
  return `${destination.uri}?v=${Date.now()}`;
}

export async function deleteDraftPhotoFile(uri: string): Promise<void> {
  const fs = getFS();
  if (!fs) {
    return;
  }
  try {
    const file = new fs.File(storageUri(uri));
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Keep going even if the file is already gone.
  }
}
