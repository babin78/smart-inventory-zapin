type Size = { width: number; height: number };

type Transform = {
  scale: number;
  translateX: number;
  translateY: number;
};

export type ImageCropRect = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

function containLayout(view: Size, image: Size) {
  const fit = Math.min(view.width / image.width, view.height / image.height);
  const drawnWidth = image.width * fit;
  const drawnHeight = image.height * fit;
  return {
    fit,
    offsetX: (view.width - drawnWidth) / 2,
    offsetY: (view.height - drawnHeight) / 2,
  };
}

function screenToLocal(
  x: number,
  y: number,
  view: Size,
  transform: Transform,
): { x: number; y: number } {
  const cx = view.width / 2;
  const cy = view.height / 2;
  const scale = transform.scale || 1;
  return {
    x: (x - cx - transform.translateX) / scale + cx,
    y: (y - cy - transform.translateY) / scale + cy,
  };
}

function localToImage(x: number, y: number, view: Size, image: Size): { x: number; y: number } {
  const { fit, offsetX, offsetY } = containLayout(view, image);
  return {
    x: (x - offsetX) / fit,
    y: (y - offsetY) / fit,
  };
}

/** Map the visible viewport (after pinch/pan) onto image pixels. */
export function viewportToImageCrop(
  view: Size,
  image: Size,
  transform: Transform,
  inset = 0,
): ImageCropRect | null {
  if (view.width < 8 || view.height < 8 || image.width < 1 || image.height < 1) {
    return null;
  }

  const left = inset;
  const top = inset;
  const right = view.width - inset;
  const bottom = view.height - inset;
  if (right - left < 8 || bottom - top < 8) {
    return null;
  }

  const corners = [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
  ].map(([sx, sy]) => {
    const local = screenToLocal(sx, sy, view, transform);
    return localToImage(local.x, local.y, view, image);
  });

  const minX = Math.max(0, Math.min(...corners.map((c) => c.x)));
  const minY = Math.max(0, Math.min(...corners.map((c) => c.y)));
  const maxX = Math.min(image.width, Math.max(...corners.map((c) => c.x)));
  const maxY = Math.min(image.height, Math.max(...corners.map((c) => c.y)));

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 8 || height < 8) {
    return null;
  }

  return { originX: minX, originY: minY, width, height };
}
