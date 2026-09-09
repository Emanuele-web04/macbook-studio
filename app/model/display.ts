import * as T from 'three';

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
      [-180, 300],
      [1810, 300],
      [1810, 710],
      [1250, 710],
    ],
    [
      [380, 1770],
      [380, 930],
      [940, 930],
      [940, 1350],
      [2810, 1350],
    ],
    [
      [2610, 200],
      [2210, 200],
      [2210, 950],
      [2610, 950],
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
          r = 170;
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
    for (let w = 212; w >= 128; w -= 3) {
      const t = (212 - w) / 84;
      c.lineWidth = w;
      const light = Math.round(18 + 56 * Math.sin(t * Math.PI));
      c.strokeStyle = `rgb(${light},${light + 2},${light + 8})`;
      c.stroke(path);
    }
    c.lineWidth = 126;
    c.strokeStyle = '#08090d';
    c.stroke(path);
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
  c.fillStyle = '#92949d58';
  c.beginPath();
  c.roundRect(405, 1513, 1750, 123, 29);
  c.fill();
  const colors = [
    '#3994f6',
    '#8275d4',
    '#24a5e8',
    '#49bc6f',
    '#59a8ed',
    '#d68571',
    '#ededed',
    '#60ca78',
    '#e0585c',
    '#c79a66',
    '#efd557',
    '#dadde5',
    '#ed536b',
    '#262729',
    '#bb484a',
    '#e8e9ef',
    '#2689da',
    '#92949a',
    '#60a7dc',
    '#b9bbbd',
  ];
  const symbols = [
    '◐',
    '▦',
    '◈',
    '●',
    '✉',
    '◇',
    '✿',
    '▣',
    '9',
    '◎',
    '≡',
    '✓',
    '♫',
    '▶',
    '▤',
    'N',
    'A',
    '⚙',
    '▰',
    '▥',
  ];
  colors.forEach((color, i) => {
    const x = 422 + i * 86;
    c.fillStyle = color;
    c.beginPath();
    c.roundRect(x, 1530, 72, 82, 15);
    c.fill();
    c.fillStyle = i === 6 ? '#eaa351' : i === 10 ? '#5b5551' : '#ffffff';
    c.font = '500 45px Arial';
    c.textAlign = 'center';
    c.fillText(symbols[i], x + 36, 1587);
  });
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
