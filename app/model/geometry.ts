import * as T from 'three';

// Model coordinates use 1 unit = 100 mm. Geometry is authored here, not imported.
export function outline(width: number, depth: number, radius: number) {
  const s = new T.Shape(),
    x = -width / 2,
    y = -depth / 2,
    r = radius;
  s.moveTo(x + r, y);
  s.lineTo(x + width - r, y);
  s.absarc(x + width - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + width, y + depth - r);
  s.absarc(x + width - r, y + depth - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + depth);
  s.absarc(x + r, y + depth - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
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
  // Circular fillets with analytic normals keep flat panels flat while their
  // shoulders reflect light continuously. No faceted extrusion side normals.
  const r = Math.min(radius, width / 2, depth / 2);
  const b = Math.min(bevel, thickness / 2);
  const arcSteps = 16,
    bevelSteps = 10,
    perimeter = 4 * (arcSteps + 1);
  const positions: number[] = [],
    normals: number[] = [],
    indices: number[] = [];
  const rings: { y: number; inset: number; ny: number; outward: number }[] = [];
  for (const sign of [1, -1]) {
    for (let step = 0; step <= bevelSteps; step++) {
      const angle =
        (((sign === 1 ? step : bevelSteps - step) / bevelSteps) * Math.PI) / 2;
      rings.push({
        y: sign * (thickness / 2 - b + b * Math.cos(angle)),
        inset: b * (1 - Math.sin(angle)),
        ny: sign * Math.cos(angle),
        outward: Math.sin(angle),
      });
    }
  }
  if (!b) {
    rings.splice(
      0,
      rings.length,
      { y: thickness / 2, inset: 0, ny: 0, outward: 1 },
      { y: -thickness / 2, inset: 0, ny: 0, outward: 1 },
    );
  }
  rings.forEach((ring, row) => {
    for (let corner = 0; corner < 4; corner++) {
      const angle0 = (corner * Math.PI) / 2;
      const sx = corner === 0 || corner === 3 ? 1 : -1;
      const sz = corner < 2 ? 1 : -1;
      for (let step = 0; step <= arcSteps; step++) {
        const angle = angle0 + ((step / arcSteps) * Math.PI) / 2;
        const nx = Math.cos(angle),
          nz = Math.sin(angle);
        positions.push(
          sx * (width / 2 - r) + (r - ring.inset) * nx,
          ring.y,
          sz * (depth / 2 - r) + (r - ring.inset) * nz,
        );
        normals.push(nx * ring.outward, ring.ny, nz * ring.outward);
        const column = corner * (arcSteps + 1) + step;
        if (row < rings.length - 1) {
          const a = row * perimeter + column,
            next = row * perimeter + ((column + 1) % perimeter);
          indices.push(
            a,
            next,
            a + perimeter,
            next,
            next + perimeter,
            a + perimeter,
          );
        }
      }
    }
  });
  // Separate cap vertices retain the exact plane normal even for unfilleted slabs.
  for (const [row, sign] of [
    [0, 1],
    [rings.length - 1, -1],
  ]) {
    const start = positions.length / 3;
    positions.push(0, (sign * thickness) / 2, 0);
    normals.push(0, sign, 0);
    for (let n = 0; n < perimeter; n++) {
      const i = (row * perimeter + n) * 3;
      positions.push(positions[i], positions[i + 1], positions[i + 2]);
      normals.push(0, sign, 0);
    }
    for (let n = 0; n < perimeter; n++) {
      const a = start + 1 + n,
        c = start + 1 + ((n + 1) % perimeter);
      if (sign > 0) indices.push(start, c, a);
      else indices.push(start, a, c);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  g.setIndex(indices);
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
