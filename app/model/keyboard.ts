import * as T from 'three';
import { mesh, slab } from './geometry';
import type { Materials } from './materials';

type Key = {
  label: string;
  width: number;
  secondary?: string;
  half?: 'up' | 'down';
};
const key = (label: string, width = 1, secondary?: string): Key => ({
  label,
  width,
  secondary,
});
const rows: Key[][] = [
  [
    key('esc', 1.5),
    ...['☀', '☼', '▣', '⌕', '♩', '☾', '◀◀', '▶Ⅱ', '▶▶', '◁', '◁))', '◁)))'].map(
      (s, i) => key(s, 1, `F${i + 1}`),
    ),
    key(''),
  ],
  [
    key('`', 1, '~'),
    ...'1234567890-='.split('').map((s, i) => key(s, 1, '!@#$%^&*()_+'[i])),
    key('delete', 1.5),
  ],
  [
    key('tab', 1.5),
    ...'QWERTYUIOP'.split('').map((s) => key(s)),
    key('[', 1, '{'),
    key(']', 1, '}'),
    key('\\', 1, '|'),
  ],
  [
    key('caps lock', 1.75),
    ...'ASDFGHJKL'.split('').map((s) => key(s)),
    key(';', 1, ':'),
    key("'", 1, '"'),
    key('return', 1.75),
  ],
  [
    key('shift', 2.25),
    ...'ZXCVBNM'.split('').map((s) => key(s)),
    key(',', 1, '<'),
    key('.', 1, '>'),
    key('/', 1, '?'),
    key('shift', 2.25),
  ],
  [
    key('fn', 1, '◎'),
    key('control', 1, '⌃'),
    key('option', 1, '⌥'),
    key('command', 1.25, '⌘'),
    key('', 5),
    key('command', 1.25, '⌘'),
    key('option', 1, '⌥'),
    key('◀'),
    key('▲'),
    key('▶'),
  ],
];

export function createKeyboard(parent: T.Object3D, materials: Materials) {
  const keyboard = new T.Group();
  keyboard.name = 'US ANSI keyboard';
  parent.add(keyboard);
  const atlas = document.createElement('canvas');
  atlas.width = 2048;
  atlas.height = 1024;
  const ctx = atlas.getContext('2d')!;
  const cell = 128,
    columns = 16;
  const texture = new T.CanvasTexture(atlas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 8;
  const labels = new T.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    opacity: 0.84,
  });
  const pitch = 0.186,
    gap = 0.013,
    fullWidth = 14.5 * pitch;
  let index = 0;
  const geometries = new Map<string, T.BufferGeometry>();
  function addKey(k: Key, x: number, z: number, row: number, h = 0.167) {
    const width = k.width * pitch - gap,
      signature = `${width}:${h}`;
    let geometry = geometries.get(signature);
    if (!geometry) {
      geometry = slab(width, h, 0.009, 0.019, 0.003);
      geometries.set(signature, geometry);
    }
    mesh(
      keyboard,
      `Key ${k.label || (row === 0 ? 'Touch ID' : 'space')}`,
      geometry,
      materials.key,
      x,
      0.1195,
      z,
    );
    if (row === 0 && !k.label) {
      const ring = mesh(
        keyboard,
        'Touch ID ring',
        new T.TorusGeometry(0.048, 0.0016, 8, 48),
        materials.edge,
        x,
        0.1241,
        z,
      );
      ring.rotation.x = -Math.PI / 2;
      const button = mesh(
        keyboard,
        'Touch ID sensor',
        new T.CylinderGeometry(0.047, 0.047, 0.0012, 48),
        materials.black,
        x,
        0.124,
        z,
      );
      button.castShadow = false;
      return;
    }
    const column = index % columns,
      atlasRow = Math.floor(index / columns);
    const cx = column * cell,
      cy = atlasRow * cell;
    ctx.fillStyle = '#eeeeef';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (k.label.length > 2 && row > 0) {
      ctx.font = '19px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(k.label, cx + 12, cy + 98, cell - 24);
      if (k.secondary) {
        ctx.textAlign = 'right';
        ctx.font = '26px Arial, sans-serif';
        ctx.fillText(k.secondary, cx + 112, cy + 35);
      }
    } else if (row === 0) {
      ctx.font =
        k.label === 'esc' ? '23px Arial, sans-serif' : '30px Arial, sans-serif';
      ctx.fillText(k.label, cx + 64, cy + (k.secondary ? 47 : 83));
      if (k.secondary) {
        ctx.font = '14px Arial, sans-serif';
        ctx.fillText(k.secondary, cx + 64, cy + 96);
      }
    } else if (k.secondary) {
      ctx.font = '28px Arial, sans-serif';
      ctx.fillText(k.secondary, cx + 64, cy + 35);
      ctx.fillText(k.label, cx + 64, cy + 88);
    } else {
      ctx.font = '31px Arial, sans-serif';
      ctx.fillText(k.label, cx + 64, cy + 66);
    }
    // The legend sits on a separate surface, so keycap edges retain their physical shading.
    const labelGeometry = new T.PlaneGeometry(
      Math.min(width - 0.009, 0.22),
      h - 0.007,
    );
    const uv = labelGeometry.getAttribute('uv');
    for (let n = 0; n < uv.count; n++)
      uv.setXY(
        n,
        (column + uv.getX(n)) / columns,
        1 - (atlasRow + 1 - uv.getY(n)) / 8,
      );
    const label = mesh(
      keyboard,
      `Legend ${k.label}`,
      labelGeometry,
      labels,
      x,
      0.1241,
      z,
    );
    label.rotation.x = -Math.PI / 2;
    label.castShadow = false;
    label.receiveShadow = false;
    index++;
    if (k.label === 'caps lock')
      mesh(
        keyboard,
        'Caps lock indicator',
        new T.CylinderGeometry(0.002, 0.002, 0.0004, 8),
        materials.rubber,
        x - width / 2 + 0.024,
        0.1242,
        z - 0.045,
      );
    if (k.label === 'F' || k.label === 'J')
      mesh(
        keyboard,
        `${k.label} tactile bar`,
        slab(0.038, 0.004, 0.0006, 0.001),
        materials.key,
        x,
        0.1244,
        z + 0.044,
      );
  }
  rows.forEach((row, r) => {
    let offset = -fullWidth / 2;
    row.forEach((k, c) => {
      const x = offset + (k.width * pitch) / 2,
        z = -0.916 + r * 0.186;
      if (r === 5 && c === 8) {
        addKey({ ...k, label: '▲' }, x, z - 0.045, r, 0.077);
        addKey({ ...k, label: '▼' }, x, z + 0.045, r, 0.077);
      } else addKey(k, x, z, r);
      offset += k.width * pitch;
    });
  });
  texture.needsUpdate = true;
  return keyboard;
}

export function createSpeakers(parent: T.Object3D) {
  const material = new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    uniforms: {
      spacing: { value: new T.Vector2(0.336 / 0.0048, 1.112 / 0.0048) },
    },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv; uniform vec2 spacing;
      void main(){
        vec2 p=vUv*spacing; float d=length(fract(p)-.5);
        float aa=max(length(fwidth(p))*.55,.02);
        float holes=1.-smoothstep(.21-aa,.21+aa,d);
        // Subpixel perforations converge to their average coverage instead of shimmering.
        float farBlend=smoothstep(.5,1.5,max(fwidth(p).x,fwidth(p).y));
        gl_FragColor=vec4(vec3(.025),mix(holes,.1385,farBlend)*.77);
      }`,
  });
  for (const side of [-1, 1]) {
    const speaker = mesh(
      parent,
      side < 0 ? 'Left speaker perforations' : 'Right speaker perforations',
      new T.PlaneGeometry(0.336, 1.112),
      material,
      side * 1.5925,
      0.1281,
      -0.443,
    );
    speaker.rotation.x = -Math.PI / 2;
    speaker.castShadow = false;
    speaker.receiveShadow = false;
  }
}
