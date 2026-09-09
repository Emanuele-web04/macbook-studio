import * as T from 'three';
import { extrude, hole, mesh, outline, slab } from './geometry';
import { createMaterials } from './materials';
import { createKeyboard, createSpeakers } from './keyboard';
import { createPorts } from './ports';
import { createDisplayTexture } from './display';

export const DIMENSIONS = {
  width: 3.557,
  depth: 2.481,
  height: 0.168,
  deck: 0.128,
  hingeY: 0.13,
  hingeZ: -1.1975,
};

function displaySurface(width: number, height: number, radius: number) {
  const geometry = new T.ShapeGeometry(outline(width, height, radius), 32);
  const p = geometry.getAttribute('position'),
    uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++)
    uv.setXY(i, p.getX(i) / width + 0.5, p.getY(i) / height + 0.5);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

// An original Bézier construction of the silhouette visible in the references.
function emblem() {
  const s = new T.Shape();
  s.moveTo(0.002, 0.128);
  s.bezierCurveTo(-0.042, 0.164, -0.094, 0.159, -0.13, 0.124);
  s.bezierCurveTo(-0.203, 0.047, -0.155, -0.105, -0.098, -0.162);
  s.bezierCurveTo(-0.065, -0.198, -0.028, -0.165, 0.004, -0.165);
  s.bezierCurveTo(0.041, -0.165, 0.066, -0.193, 0.099, -0.158);
  s.bezierCurveTo(0.125, -0.13, 0.151, -0.091, 0.159, -0.061);
  s.bezierCurveTo(0.087, -0.029, 0.086, 0.069, 0.147, 0.106);
  s.bezierCurveTo(0.102, 0.166, 0.052, 0.157, 0.002, 0.128);
  const leaf = new T.Shape();
  leaf.moveTo(0.005, 0.162);
  leaf.bezierCurveTo(0.0, 0.21, 0.035, 0.239, 0.079, 0.246);
  leaf.bezierCurveTo(0.082, 0.202, 0.052, 0.169, 0.005, 0.162);
  return [s, leaf];
}

function frontDeckOutline() {
  const { width: w, depth: d } = DIMENSIONS,
    r = 0.075,
    x = -w / 2,
    y = -d / 2;
  const s = new T.Shape();
  s.moveTo(x + r, y);
  s.lineTo(-0.286, y);
  s.bezierCurveTo(-0.27, y, -0.27, y + 0.026, -0.239, y + 0.029);
  s.lineTo(0.239, y + 0.029);
  s.bezierCurveTo(0.27, y + 0.026, 0.27, y, 0.286, y);
  s.lineTo(w / 2 - r, y);
  s.quadraticCurveTo(w / 2, y, w / 2, y + r);
  s.lineTo(w / 2, d / 2 - r);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
  s.lineTo(x + r, d / 2);
  s.quadraticCurveTo(x, d / 2, x, d / 2 - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function createLaptop() {
  const root = new T.Group();
  root.name = 'Independently modeled 16-inch notebook';
  const m = createMaterials(),
    { width: w, depth: d } = DIMENSIONS;
  // The interior stops before the side walls, leaving depth behind every port.
  mesh(
    root,
    'Internal aluminum unibody',
    slab(w - 0.086, d - 0.14, 0.086, 0.048, 0.006),
    m.metal,
    0,
    0.067,
    0,
  );
  mesh(
    root,
    'Bottom cover',
    slab(w - 0.01, d - 0.01, 0.016, 0.074, 0.005),
    m.metal,
    0,
    0.024,
    0,
  );
  const deck = frontDeckOutline();
  hole(deck, 2.813, 1.154, 0.031, 0, 0.443);
  hole(deck, 1.604, 1.045, 0.052, 0, -0.69);
  const deckGeometry = extrude(deck, 0.008);
  deckGeometry.rotateX(-Math.PI / 2);
  mesh(
    root,
    'Palm rest with keyboard and trackpad recesses',
    deckGeometry,
    m.metal,
    0,
    0.124,
    0,
  );
  mesh(
    root,
    'Keyboard recess',
    slab(2.811, 1.152, 0.012, 0.03, 0.002),
    m.black,
    0,
    0.109,
    -0.443,
  );
  mesh(
    root,
    'Trackpad perimeter gap',
    slab(1.604, 1.045, 0.008, 0.052),
    m.black,
    0,
    0.12,
    0.69,
  );
  mesh(
    root,
    'Force Touch trackpad',
    slab(1.6, 1.041, 0.006, 0.05, 0.001),
    m.trackpad,
    0,
    0.124,
    0.69,
  );

  // Rounded vertical corners join independent front, rear and port-bearing side walls.
  const r = 0.075;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const points: T.Vector2[] = [];
      const cx = sx * (w / 2 - r),
        cz = sz * (d / 2 - r),
        start =
          sx > 0 ? (sz > 0 ? 0 : -Math.PI / 2) : sz > 0 ? Math.PI / 2 : Math.PI;
      for (let i = 0; i <= 20; i++) {
        const a = start + (i * Math.PI) / 40;
        points.push(
          new T.Vector2(cx + r * Math.cos(a), -(cz + r * Math.sin(a))),
        );
      }
      for (let i = 20; i >= 0; i--) {
        const a = start + (i * Math.PI) / 40;
        points.push(
          new T.Vector2(
            cx + (r - 0.022) * Math.cos(a),
            -(cz + (r - 0.022) * Math.sin(a)),
          ),
        );
      }
      const g = extrude(new T.Shape(points), 0.095);
      g.rotateX(-Math.PI / 2);
      mesh(root, 'Rounded unibody corner', g, m.metal, 0, 0.0745, 0);
    }
  const front = new T.Shape(),
    edge = w / 2 - r;
  front.moveTo(-edge, 0.027);
  front.lineTo(edge, 0.027);
  front.lineTo(edge, 0.124);
  front.lineTo(0.286, 0.124);
  front.bezierCurveTo(0.272, 0.124, 0.264, 0.104, 0.236, 0.102);
  front.lineTo(-0.236, 0.102);
  front.bezierCurveTo(-0.264, 0.104, -0.272, 0.124, -0.286, 0.124);
  front.lineTo(-edge, 0.124);
  front.closePath();
  mesh(
    root,
    'Front wall and finger scoop',
    extrude(front, 0.022),
    m.metal,
    0,
    0,
    d / 2 - 0.011,
  );
  const scoop = new T.Shape();
  scoop.moveTo(-0.285, -d / 2);
  scoop.lineTo(0.285, -d / 2);
  scoop.quadraticCurveTo(0.266, -d / 2 + 0.03, 0.238, -d / 2 + 0.03);
  scoop.lineTo(-0.238, -d / 2 + 0.03);
  scoop.quadraticCurveTo(-0.266, -d / 2 + 0.03, -0.285, -d / 2);
  const sg = new T.ShapeGeometry(scoop, 24);
  sg.rotateX(-Math.PI / 2);
  mesh(root, 'Finger scoop floor', sg, m.edge, 0, 0.103, 0);
  mesh(
    root,
    'Rear wall',
    new T.BoxGeometry(w - 0.15, 0.071, 0.02),
    m.metal,
    0,
    0.063,
    -d / 2 + 0.01,
  );
  createPorts(root, m);
  createKeyboard(root, m);
  createSpeakers(root);

  const hingeBar = new T.CylinderGeometry(0.02, 0.02, 2.82, 48);
  hingeBar.rotateZ(Math.PI / 2);
  mesh(root, 'Hinge barrel', hingeBar, m.black, 0, 0.114, -1.191);
  for (const x of [-1.46, 1.46]) {
    const cap = new T.CylinderGeometry(0.0202, 0.0202, 0.099, 32);
    cap.rotateZ(Math.PI / 2);
    mesh(root, 'Hinge end cap', cap, m.edge, x, 0.114, -1.191);
  }
  // Repeated slots and feet remain actual geometry when viewed from below.
  const vents = new T.InstancedMesh(
    new T.BoxGeometry(0.022, 0.026, 0.012),
    m.black,
    74,
  );
  const matrix = new T.Matrix4();
  for (let i = 0; i < 74; i++) {
    matrix.makeTranslation(-1.46 + i * 0.04, 0.094, -1.231);
    vents.setMatrixAt(i, matrix);
  }
  vents.name = 'Rear cooling outlets';
  root.add(vents);
  for (const x of [-1.415, 1.415])
    for (const z of [-0.986, 0.986]) {
      mesh(
        root,
        'Rubber foot',
        new T.CylinderGeometry(0.067, 0.061, 0.016, 48),
        m.rubber,
        x,
        0.008,
        z,
      );
      mesh(
        root,
        'Foot inset',
        new T.CylinderGeometry(0.072, 0.071, 0.002, 48),
        m.black,
        x,
        0.016,
        z,
      );
    }
  for (const [x, z] of [
    [-1.59, -1.08],
    [1.59, -1.08],
    [-1.59, 1.08],
    [1.59, 1.08],
    [-0.52, -1.13],
    [0.52, -1.13],
    [-0.52, 1.13],
    [0.52, 1.13],
  ]) {
    mesh(
      root,
      'Bottom screw',
      new T.CylinderGeometry(0.009, 0.009, 0.001, 16),
      m.edge,
      x,
      0.0158,
      z,
    );
    const star = new T.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5,
        rad = i % 2 ? 0.0017 : 0.0036;
      if (i === 0) star.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else star.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    star.closePath();
    const g = new T.ShapeGeometry(star);
    g.rotateX(Math.PI / 2);
    mesh(root, 'Pentalobe screw recess', g, m.black, x, 0.0152, z);
  }

  const hinge = new T.Group();
  hinge.name = 'Display hinge';
  hinge.position.set(0, DIMENSIONS.hingeY, DIMENSIONS.hingeZ);
  root.add(hinge);
  const center = d / 2 - 0.043;
  mesh(
    hinge,
    'Aluminum display enclosure',
    slab(w, d, 0.034, 0.071, 0.006),
    m.metal,
    0,
    0.021,
    center,
  );
  // Rubber perimeter is the physical contact surface. It moves with the lid;
  // there is no delayed overlay, screen-space line, or artificial closed-state fade.
  const gasket = outline(w - 0.034, d - 0.034, 0.061);
  hole(gasket, w - 0.062, d - 0.062, 0.052, 0, 0);
  const gasketGeometry = extrude(gasket, 0.002);
  gasketGeometry.rotateX(-Math.PI / 2);
  mesh(
    hinge,
    'Display contact gasket',
    gasketGeometry,
    m.rubber,
    0,
    -0.001,
    center,
  );
  mesh(
    hinge,
    'Display bezel',
    slab(w - 0.056, d - 0.056, 0.003, 0.054),
    m.glass,
    0,
    0.0015,
    center,
  );
  const displayTexture = createDisplayTexture();
  const screenMaterial = new T.MeshBasicMaterial({
    map: displayTexture,
    toneMapped: false,
  });
  const screen = mesh(
    hinge,
    'Original procedural display artwork',
    displaySurface(3.456, 2.245, 0.042),
    screenMaterial,
    0,
    -0.0001,
    1.2245,
  );
  screen.castShadow = false;
  screen.receiveShadow = false;
  const notch = mesh(
    hinge,
    'Camera notch',
    slab(0.326, 0.057, 0.001, 0.013),
    m.black,
    0,
    -0.001,
    2.319,
  );
  notch.castShadow = false;
  const lensMaterial = new T.MeshPhysicalMaterial({
    color: 0x10222d,
    metalness: 0.65,
    roughness: 0.12,
    clearcoat: 1,
  });
  const lens = new T.CylinderGeometry(0.0068, 0.0068, 0.001, 24);
  mesh(hinge, 'Camera lens', lens, lensMaterial, 0, -0.0018, 2.325);
  mesh(
    hinge,
    'Camera indicator',
    new T.CylinderGeometry(0.0015, 0.0015, 0.001, 8),
    m.rubber,
    0.021,
    -0.0018,
    2.325,
  );
  for (const shape of emblem()) {
    const geometry = new T.ShapeGeometry(shape, 40);
    geometry.rotateX(Math.PI / 2);
    mesh(
      hinge,
      'Hand-constructed lid emblem',
      geometry,
      m.logo,
      0,
      0.0381,
      center - 0.027,
    );
  }
  function setLid(degrees: number) {
    hinge.rotation.x = -T.MathUtils.degToRad(
      T.MathUtils.clamp(degrees, 0, 135),
    );
  }
  return { root, hinge, materials: m, screenMaterial, setLid };
}
