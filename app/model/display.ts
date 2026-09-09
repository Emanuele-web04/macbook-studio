import * as T from 'three';
import { drawDock } from './dock';

// Original screen artwork drawn locally; no screenshot, OS icon pack or wallpaper download.
export function createDisplayTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2560;
  canvas.height = 1664;
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#050608';
  c.fillRect(0, 0, 2560, 1664);
  const paths = [
    [
      [-260, 305],
      [1620, 305],
      [1620, 657],
      [-260, 657],
    ],
    [
      [960, 842],
      [535, 842],
      [535, 1425],
      [2800, 1425],
    ],
    [
      [2530, -160],
      [2170, -160],
      [2170, 1070],
      [2750, 1070],
    ],
  ];
  c.lineCap = 'round';
  c.lineJoin = 'round';
  for (const points of paths) {
    const path = new Path2D();
    path.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const p = points[i],
        next = points[i + 1];
      if (next) {
        const prev = points[i - 1],
          r = 175;
        const a = Math.hypot(p[0] - prev[0], p[1] - prev[1]),
          b = Math.hypot(next[0] - p[0], next[1] - p[1]);
        path.lineTo(
          p[0] + ((prev[0] - p[0]) * r) / a,
          p[1] + ((prev[1] - p[1]) * r) / a,
        );
        path.quadraticCurveTo(
          p[0],
          p[1],
          p[0] + ((next[0] - p[0]) * r) / b,
          p[1] + ((next[1] - p[1]) * r) / b,
        );
      } else path.lineTo(p[0], p[1]);
    }
    // Broad, softly lit contours are painted as nested strokes. Every pixel
    // comes from these paths; the reference wallpaper is never loaded.
    for (let width = 370; width >= 2; width -= 2) {
      const t = (370 - width) / 370;
      const light = Math.round(
        3 + 86 * Math.exp(-Math.pow((t - 0.19) / 0.19, 2)),
      );
      c.lineWidth = width;
      c.strokeStyle = `rgb(${light},${light + 1},${light + 7})`;
      c.stroke(path);
    }
  }
  c.fillStyle = '#101116e8';
  c.fillRect(0, 0, 2560, 39);
  c.font = '500 20px Arial';
  c.fillStyle = '#dddfe5';
  c.fillText(
    '●   Finder    File    Edit    View    Go    Window    Help',
    25,
    27,
  );
  c.textAlign = 'right';
  c.fillText('◉   ▰   ⌕     Tue 9 Sep   12:44', 2534, 27);
  c.textAlign = 'left';
  drawDock(c);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
