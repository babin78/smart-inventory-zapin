import { getStorage } from 'firebase-admin/storage';

import { extractFromImages } from './gemini';
import { mergeExtracted, pickExtractFields } from './merge';

export async function handleExtractProduct(body: unknown, env = process.env) {
  if (!body || typeof body !== 'object') {
    throw Object.assign(new Error('Invalid JSON body.'), { status: 400 });
  }

  const { draftId, storagePaths, userEditedFields, currentDraft } = body as Record<string, unknown>;
  if (typeof draftId !== 'string' || !/^draft-[a-zA-Z0-9-]+$/.test(draftId)) {
    throw Object.assign(new Error('Invalid draftId.'), { status: 400 });
  }
  if (!Array.isArray(storagePaths) || storagePaths.length === 0) {
    throw Object.assign(new Error('storagePaths is required.'), { status: 400 });
  }

  const prefix = `captures/${draftId}/`;
  const paths = storagePaths.filter((path): path is string => typeof path === 'string' && path.startsWith(prefix));
  if (paths.length === 0) {
    throw Object.assign(new Error('storagePaths must belong to this draft.'), { status: 400 });
  }

  const edited = Array.isArray(userEditedFields)
    ? userEditedFields.filter((item): item is string => typeof item === 'string')
    : [];
  const current = pickExtractFields(
    currentDraft && typeof currentDraft === 'object' ? (currentDraft as Record<string, unknown>) : {},
  );

  const apiKey = env.GEMINI_API_KEY ?? '';
  if (!apiKey) {
    throw Object.assign(new Error('GEMINI_API_KEY is not set.'), { status: 500 });
  }

  const warnings: string[] = [];
  const images: { mimeType: string; data: string }[] = [];
  const bucket = getStorage().bucket();

  for (const path of paths) {
    try {
      const [buffer] = await bucket.file(path).download();
      images.push({ mimeType: 'image/jpeg', data: buffer.toString('base64') });
    } catch {
      warnings.push(`Could not read ${path}.`);
    }
  }

  if (images.length === 0) {
    throw Object.assign(new Error('No uploaded photos were found in Storage.'), { status: 400 });
  }

  const extracted = await extractFromImages(images, apiKey);
  const { merged, warnings: mergeWarnings } = mergeExtracted(current, extracted, edited);

  return {
    extracted,
    mergedDraft: merged,
    warnings: [...warnings, ...mergeWarnings],
  };
}
