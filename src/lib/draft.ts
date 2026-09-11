export type PhotoPurpose = 'front' | 'extra' | 'crop';

export type DraftPhoto = {
  id: string;
  purpose: PhotoPurpose;
  uri: string;
  width: number;
  height: number;
  originalUri?: string;
  storagePath?: string;
};

export type CaptureDraft = {
  draftId: string;
  product_name: string;
  product_category: string;
  mrp: string;
  quantity: string;
  photos: DraftPhoto[];
  cropOfPhotoId: string | null;
  userEditedFields: string[];
  source_photo_paths: string[];
  product_item_id: string;
  product_sub_category: string;
  standard_size: string;
  mfd: string;
  expiry_date: string;
};

export type EditableDraftKey =
  | 'product_name'
  | 'product_category'
  | 'product_sub_category'
  | 'standard_size'
  | 'mrp'
  | 'quantity'
  | 'product_item_id'
  | 'mfd'
  | 'expiry_date';

const MANDATORY_KEYS = ['product_name', 'product_category', 'mrp', 'quantity'] as const;

export function createEmptyDraft(draftId = newDraftId()): CaptureDraft {
  return {
    draftId,
    product_name: '',
    product_category: '',
    mrp: '',
    quantity: '',
    photos: [],
    cropOfPhotoId: null,
    userEditedFields: [],
    source_photo_paths: [],
    product_item_id: '',
    product_sub_category: '',
    standard_size: '',
    mfd: '',
    expiry_date: '',
  };
}

export function newDraftId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function hasFrontPhoto(draft: CaptureDraft): boolean {
  return draft.photos.some((photo) => photo.purpose === 'front');
}

export function draftProgressPercent(draft: CaptureDraft): number {
  const filled = [
    hasFrontPhoto(draft),
    ...MANDATORY_KEYS.map((key) => draft[key].trim().length > 0),
  ].filter(Boolean).length;
  return Math.round((filled / (MANDATORY_KEYS.length + 1)) * 100);
}

export function extraPhotoCount(draft: CaptureDraft): number {
  return draft.photos.filter((photo) => photo.purpose === 'extra').length;
}

export function visiblePhotos(draft: CaptureDraft): DraftPhoto[] {
  return draft.photos.filter((photo) => photo.purpose !== 'crop');
}

export function draftWithoutPhoto(draft: CaptureDraft, photoId: string): CaptureDraft {
  const photos = draft.photos.filter((photo) => photo.id !== photoId && !(photo.purpose === 'crop' && draft.cropOfPhotoId === photoId));
  return {
    ...draft,
    photos,
    cropOfPhotoId: draft.cropOfPhotoId === photoId ? null : draft.cropOfPhotoId,
  };
}

export function draftWithCroppedPhoto(
  draft: CaptureDraft,
  photoId: string,
  cropped: { uri: string; width: number; height: number },
): CaptureDraft {
  return {
    ...draft,
    cropOfPhotoId: photoId,
    photos: draft.photos
      .filter((photo) => photo.purpose !== 'crop')
      .map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              originalUri: photo.originalUri ?? photo.uri.split('?')[0],
              uri: cropped.uri,
              width: cropped.width,
              height: cropped.height,
              storagePath: undefined,
            }
          : photo,
      ),
  };
}
