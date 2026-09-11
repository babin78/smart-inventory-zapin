import { File, UploadType } from 'expo-file-system';

import { postFunction } from '@/lib/api';
import { getFunctionsBaseUrl } from '@/lib/config';
import { clipBody, logApi, signedUrlDebug } from '@/lib/debug-log';
import { type CaptureDraft, type PhotoPurpose, visiblePhotos } from '@/lib/draft';
import { storageUri } from '@/lib/draft-store';
import { hasFileSystemNative } from '@/lib/native-modules';

type UploadResponse = { uploadUrl: string; storagePath: string };

type ExtractResponse = {
  extracted: Record<string, unknown>;
  mergedDraft: {
    product_item_id: string;
    product_name: string;
    product_category: string;
    product_sub_category: string;
    standard_size: string;
    mrp: string;
    mfd: string;
    expiry_date: string;
  };
  warnings: string[];
};

function uploadJobs(draft: CaptureDraft): { purpose: PhotoPurpose; uri: string }[] {
  const jobs: { purpose: PhotoPurpose; uri: string }[] = [];
  for (const photo of visiblePhotos(draft)) {
    if (photo.originalUri) {
      jobs.push({ purpose: 'crop', uri: photo.uri });
      jobs.push({
        purpose: photo.purpose === 'front' ? 'front' : 'extra',
        uri: photo.originalUri,
      });
    } else {
      jobs.push({
        purpose: photo.purpose === 'front' ? 'front' : 'extra',
        uri: photo.uri,
      });
    }
  }
  jobs.sort((left, right) => Number(right.purpose === 'crop') - Number(left.purpose === 'crop'));
  return jobs;
}

async function putJpeg(uploadUrl: string, localUri: string): Promise<void> {
  const file = new File(storageUri(localUri));
  if (!file.exists) {
    throw new Error('A captured photo is missing from the device. Take it again.');
  }
  const info = file.info();
  const target = signedUrlDebug(uploadUrl);
  logApi('PUT storage req', {
    ...target,
    bytes: info.size,
    contentType: 'image/jpeg',
  });
  const result = await file.upload(uploadUrl, {
    httpMethod: 'PUT',
    uploadType: UploadType.BINARY_CONTENT,
    mimeType: 'image/jpeg',
    headers: { 'Content-Type': 'image/jpeg' },
  });
  if (result.status < 200 || result.status >= 300) {
    const code = result.body.match(/<Code>([^<]+)<\/Code>/)?.[1];
    logApi('PUT storage res', {
      ...target,
      httpStatus: result.status,
      status: 'error',
      ok: false,
      code: code ?? null,
      body: clipBody(result.body),
    });
    throw new Error(`Photo upload failed (${result.status}${code ? `: ${code}` : ''}).`);
  }
  logApi('PUT storage res', {
    ...target,
    httpStatus: result.status,
    status: 'success',
    ok: true,
  });
}

export async function runProductCheck(draft: CaptureDraft): Promise<{
  merged: CaptureDraft;
  warnings: string[];
}> {
  logApi('Check start', { draftId: draft.draftId, photos: visiblePhotos(draft).length });
  try {
    if (!getFunctionsBaseUrl()) {
      throw new Error('Functions URL is not set in app.json extra.functionsBaseUrl.');
    }
    if (!hasFileSystemNative()) {
      throw new Error('Check needs a development build with file system access.');
    }

    const jobs = uploadJobs(draft);
    if (jobs.length === 0) {
      throw new Error('Take a front photo before Check.');
    }

    const storagePaths: string[] = [];
    for (const job of jobs) {
      const { uploadUrl, storagePath } = await postFunction<UploadResponse>('createUploadUrl', {
        draftId: draft.draftId,
        contentType: 'image/jpeg',
        purpose: job.purpose,
      });
      await putJpeg(uploadUrl, job.uri);
      storagePaths.push(storagePath);
    }

    const extracted = await postFunction<ExtractResponse>('extractProduct', {
      draftId: draft.draftId,
      storagePaths,
      userEditedFields: draft.userEditedFields,
      currentDraft: {
        product_item_id: draft.product_item_id,
        product_name: draft.product_name,
        product_category: draft.product_category,
        product_sub_category: draft.product_sub_category,
        standard_size: draft.standard_size,
        mrp: draft.mrp,
        mfd: draft.mfd,
        expiry_date: draft.expiry_date,
      },
    });

    logApi('Check done', { status: 'success', ok: true, storageCount: storagePaths.length });
    return {
      merged: {
        ...draft,
        ...extracted.mergedDraft,
        photos: draft.photos,
        userEditedFields: draft.userEditedFields,
        source_photo_paths: storagePaths,
      },
      warnings: extracted.warnings ?? [],
    };
  } catch (caught) {
    logApi('Check done', {
      status: 'error',
      ok: false,
      error: caught instanceof Error ? caught.message : String(caught),
    });
    throw caught;
  }
}
