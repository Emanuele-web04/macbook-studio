// Geometry/animation checks run without a browser or GPU. Canvas drawing is stubbed;
// this validates the physical model and motion, not its rendered appearance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as T from 'three';
const temp = path.resolve('node_modules/.cache/macbook-model-check');
fs.mkdirSync(temp, { recursive: true });
fs.writeFileSync(path.join(temp, 'package.json'), '{"type":"commonjs"}');
for (const file of fs
  .readdirSync('app/model')
  .filter((f) => f.endsWith('.ts'))) {
  const result = ts.transpileModule(
    fs.readFileSync(`app/model/${file}`, 'utf8'),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
      },
    },
  );
  fs.writeFileSync(
    path.join(temp, file.replace('.ts', '.js')),
    result.outputText,
  );
}
const drawing = new Proxy(
  {},
  {
    get: (object, key) => object[key] ?? (() => {}),
    set: (object, key, value) => {
      object[key] = value;
      return true;
    },
  },
);
Object.defineProperty(globalThis, 'document', {
  value: {
    createElement: () => ({ width: 0, height: 0, getContext: () => drawing }),
  },
  configurable: true,
});
globalThis.Path2D = class {
  moveTo() {}
  lineTo() {}
  quadraticCurveTo() {}
};
const require = createRequire(import.meta.url);
const { createLaptop, DIMENSIONS } = require(path.join(temp, 'laptop.js'));
const { advanceLid, LID_DURATION } = require(path.join(temp, 'motion.js'));
const laptop = createLaptop();
laptop.setLid(0);
laptop.root.updateMatrixWorld(true);
const box = new T.Box3().setFromObject(laptop.root),
  size = box.getSize(new T.Vector3());
for (const [actual, expected, name] of [
  [size.x, DIMENSIONS.width, 'width'],
  [size.z, DIMENSIONS.depth, 'depth'],
  [size.y, DIMENSIONS.height + 0.0001, 'closed height including lid emblem'],
])
  assert.ok(
    Math.abs(actual - expected) < 0.00005,
    `${name}: ${actual} expected ${expected}`,
  );
let keys = 0,
  triangles = 0;
laptop.root.traverse((object) => {
  if (object.name.startsWith('Key ')) keys++;
  if (!object.geometry) return;
  const vertices = object.geometry.getAttribute('position');
  for (const value of vertices.array)
    assert.ok(Number.isFinite(value), `Invalid vertex in ${object.name}`);
  triangles += (object.geometry.index?.count ?? vertices.count) / 3;
});
assert.equal(
  keys,
  78,
  'US ANSI keyboard must have 78 keys including four arrows and Touch ID',
);
const ray = new T.Raycaster();
for (const [side, z] of [
  [-1, -0.956],
  [-1, -0.71],
  [-1, -0.472],
  [-1, -0.213],
  [1, -0.91],
  [1, -0.614],
  [1, -0.2],
]) {
  ray.set(new T.Vector3(side * 2, 0.081, z), new T.Vector3(-side, 0, 0));
  const wall = laptop.root.getObjectByName(
    side < 0 ? 'Left machined side wall' : 'Right machined side wall',
  );
  assert.equal(
    ray.intersectObject(wall).length,
    0,
    `Port at ${side},${z} must be an opening`,
  );
}
const contact = new T.Vector3(1, -0.002, 2.38);
laptop.setLid(0);
laptop.root.updateMatrixWorld(true);
assert.ok(
  Math.abs(
    contact.clone().applyMatrix4(laptop.hinge.matrixWorld).y - DIMENSIONS.deck,
  ) < 1e-9,
  'Lid gasket must contact deck exactly when closed',
);
for (const degrees of [0.01, 1, 45, 105, 135]) {
  laptop.setLid(degrees);
  laptop.root.updateMatrixWorld(true);
  assert.ok(
    contact.clone().applyMatrix4(laptop.hinge.matrixWorld).y > DIMENSIONS.deck,
    `Front must remain separated at ${degrees} degrees`,
  );
}
for (const fps of [30, 60, 120]) {
  const motion = { from: 105, target: 0, elapsed: 0 };
  let angle = 105;
  for (let frame = 1; frame <= Math.ceil(LID_DURATION * fps); frame++) {
    const next = advanceLid(motion, 1 / fps);
    assert.ok(next <= angle && next >= 0);
    if (frame < LID_DURATION * fps - 1e-8)
      assert.ok(next > 0, 'No early closure');
    angle = next;
  }
  assert.equal(angle, 0, 'Closure must finish at exact contact');
}
laptop.materials.setFinish(1);
assert.equal(laptop.materials.metal.color.getHex(), 0x66676b);
laptop.materials.setFinish(0);
assert.equal(laptop.materials.metal.color.getHex(), 0xbfc1c5);
console.log(
  `Model checks passed: 355.7 × 248.1 × 16.8 mm; ${keys} keys; 7 real port openings; ${Math.round(triangles).toLocaleString()} triangles; exact lid contact at 30/60/120 fps.`,
);
fs.rmSync(temp, { recursive: true, force: true });
