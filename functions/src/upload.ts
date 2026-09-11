import { getStorage } from 'firebase-admin/storage';
import { randomBytes } from 'node:crypto';

const PURPOSES = new Set(['front', 'extra', 'crop']);

export async function handleCreateUploadUrl(body: unknown): Promise<{ uploadUrl: string; storagePath: string }> {
  if (!body || typeof body !== 'object') {
    throw Object.assign(new Error('Invalid JSON body.'), { status: 400 });
  }
  const { draftId, contentType, purpose } = body as Record<string, unknown>;
  if (typeof draftId !== 'string' || !/^draft-[a-zA-Z0-9-]+$/.test(draftId)) {
    throw Object.assign(new Error('Invalid draftId.'), { status: 400 });
  }
  if (contentType !== 'image/jpeg') {
    throw Object.assign(new Error('contentType must be image/jpeg.'), { status: 400 });
  }
  if (typeof purpose !== 'string' || !PURPOSES.has(purpose)) {
    throw Object.assign(new Error('purpose must be front, extra, or crop.'), { status: 400 });
  }

  const storagePath = `captures/${draftId}/${purpose}-${Date.now()}-${randomBytes(4).toString('hex')}.jpg`;
  const file = getStorage().bucket().file(storagePath);
  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 10 * 60 * 1000,
    contentType: 'image/jpeg',
  });
  return { uploadUrl, storagePath };
}
