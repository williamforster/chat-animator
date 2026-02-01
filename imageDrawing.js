function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y,     x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x,     y + h, radius);
  ctx.arcTo(x,     y + h, x,     y,     radius);
  ctx.arcTo(x,     y,     x + w, y,     radius);
  ctx.closePath();
}

/**
 * Draw image cropped ("cover") into a rounded-rectangle frame.
 * - Frame is fixed size: frameWidth x frameHeight
 * - Image always fills frame width (and height) by cropping as needed
 */
export function drawImageCoverFramed(ctx, img, {
  x,
  y,
  frameWidth,
  frameHeight,        // set this to your max height
  radius = 16,
  borderWidth = 3,
  borderColor = "#000",
  background = null,  // optional fill behind image
  imageSmoothing = true,
  anchorX = 0.5,      // 0 = left, 0.5 = center, 1 = right
  anchorY = 0.5       // 0 = top,  0.5 = center, 1 = bottom
} = {}) {
  if (!img?.naturalWidth || !img?.naturalHeight) return;

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  // Scale to COVER the frame (like CSS object-fit: cover)
  const scale = Math.max(frameWidth / iw, frameHeight / ih);

  const sw = frameWidth / scale;   // source width to take from the image
  const sh = frameHeight / scale;  // source height to take from the image

  // Choose where to crop from (anchored)
  let sx = (iw - sw) * anchorX;
  let sy = (ih - sh) * anchorY;

  
  // Clamp just in case
  sx = Math.max(0, Math.min(sx, iw - sw));
  sy = Math.max(0, Math.min(sy, ih - sh));

  // --- Clip to rounded rect and draw ---
  ctx.save();
  ctx.imageSmoothingEnabled = imageSmoothing;

  roundedRectPath(ctx, x, y, frameWidth, frameHeight, radius);
  ctx.clip();

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(x, y, frameWidth, frameHeight);
  }

  // Draw cropped region into the frame
  ctx.drawImage(img, sx, sy, sw, sh, x, y, frameWidth, frameHeight);
  //console.log(`drawing image ${img} ${sx} ${sy} ${sw} ${sh} ${x} ${y} ${frameWidth} ${frameHeight}`);

  ctx.restore();

    if (borderWidth > 0) {
        // --- Border on top ---
        ctx.save();
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        
        // Inset stroke so it stays inside the frame
        const inset = borderWidth / 2;
        roundedRectPath(ctx, x + inset, y + inset, frameWidth - borderWidth, frameHeight - borderWidth, radius);
        ctx.stroke();
        
        ctx.restore();
    }
 
  //console.log("Done");
  return { x, y, width: frameWidth, height: frameHeight };
}
