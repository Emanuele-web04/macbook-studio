import * as T from 'three';

// Model coordinates use 1 unit = 100 mm. Geometry is authored here, not imported.
export function outline(width: number, depth: number, radius: number) {
  const s = new T.Shape(),
    x = -width / 2,
    y = -depth / 2,
    r = radius;
  s.moveTo(x + r, y);
  s.lineTo(x + width - r, y);
  s.quadraticCurveTo(x + width, y, x + width, y + r);
  s.lineTo(x + width, y + depth - r);
  s.quadraticCurveTo(x + width, y + depth, x + width - r, y + depth);
  s.lineTo(x + r, y + depth);
  s.quadraticCurveTo(x, y + depth, x, y + depth - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
export function hole(
  shape: T.Shape,
  width: number,
  height: number,
  radius: number,
  x: number,
  y: number,
) {
  const path = outline(width, height, radius);
  const points = path.getPoints(12).map((p) => new T.Vector2(p.x + x, p.y + y));
  shape.holes.push(new T.Path(points));
}
export function extrude(shape: T.Shape, thickness: number, bevel = 0) {
  const g = new T.ExtrudeGeometry(shape, {
    depth: Math.max(0.0001, thickness - 2 * bevel),
    steps: 1,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 20,
  });
  g.translate(0, 0, bevel - thickness / 2);
  return g;
}
export function slab(
  width: number,
  depth: number,
  thickness: number,
  radius: number,
  bevel = 0,
) {
  const g = extrude(
    outline(
      width - 2 * bevel,
      depth - 2 * bevel,
      Math.max(0.001, radius - bevel),
    ),
    thickness,
    bevel,
  );
  g.rotateX(-Math.PI / 2);
  return g;
}
export function mesh(
  parent: T.Object3D,
  name: string,
  geometry: T.BufferGeometry,
  material: T.Material,
  x = 0,
  y = 0,
  z = 0,
) {
  const m = new T.Mesh(geometry, material);
  m.name = name;
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function topPlane(
  parent: T.Object3D,
  name: string,
  width: number,
  depth: number,
  material: T.Material,
  x: number,
  y: number,
  z: number,
) {
  const p = mesh(
    parent,
    name,
    new T.PlaneGeometry(width, depth),
    material,
    x,
    y,
    z,
  );
  p.rotation.x = -Math.PI / 2;
  p.castShadow = false;
  return p;
}
