import * as T from 'three';

export const CORNER_RADIUS = 0.095;
export const BODY_PROFILE = {
  bottom: 0.027,
  top: 0.128,
  lowerRadius: 0.023,
  upperRadius: 0.007,
};
export function wallProfile(y: number, top = BODY_PROFILE.top) {
  const { bottom, lowerRadius, upperRadius } = BODY_PROFILE;
  let ny = 0,
    r = 0;
  if (y < bottom + lowerRadius) {
    r = lowerRadius;
    ny = (y - bottom - lowerRadius) / r;
  } else if (y > top - upperRadius) {
    r = upperRadius;
    ny = (y - top + upperRadius) / r;
  }
  ny = T.MathUtils.clamp(ny, -1, 1);
  const outward = Math.sqrt(Math.max(0, 1 - ny * ny));
  return { inset: r * (1 - outward), ny, outward };
}

type Boundary = (t: number) => { x: number; z: number; nx: number; nz: number };
export function curvedWall(boundary: Boundary, steps: number, ys: number[]) {
  const vertices: number[] = [],
    normals: number[] = [],
    indices: number[] = [];
  const count = ys.length;
  for (let i = 0; i <= steps; i++) {
    const p = boundary(i / steps);
    ys.forEach((y) => {
      const profile = wallProfile(y);
      vertices.push(p.x - p.nx * profile.inset, y, p.z - p.nz * profile.inset);
      normals.push(p.nx * profile.outward, profile.ny, p.nz * profile.outward);
    });
    if (i < steps)
      for (let j = 0; j < count - 1; j++) {
        const a = i * count + j,
          b = a + count;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
  }
  // Boundary traversal may point either way (left/right wall). Orient triangles
  // against their authored outward normals rather than using double-sided metal.
  const a = new T.Vector3(),
    b = new T.Vector3(),
    c = new T.Vector3(),
    normal = new T.Vector3();
  for (let i = 0; i < indices.length; i += 3) {
    a.fromArray(vertices, indices[i] * 3);
    b.fromArray(vertices, indices[i + 1] * 3);
    c.fromArray(vertices, indices[i + 2] * 3);
    normal.fromArray(normals, indices[i + 1] * 3);
    if (b.sub(a).cross(c.sub(a)).dot(normal) < 0)
      [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
  g.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  g.setIndex(indices);
  return g;
}
export function profileHeights() {
  const { bottom, top, lowerRadius, upperRadius } = BODY_PROFILE,
    ys: number[] = [];
  for (let i = 0; i <= 12; i++)
    ys.push(bottom + lowerRadius - lowerRadius * Math.cos((i * Math.PI) / 24));
  for (let i = 0; i <= 12; i++)
    ys.push(top - upperRadius + upperRadius * Math.sin((i * Math.PI) / 24));
  return ys;
}
