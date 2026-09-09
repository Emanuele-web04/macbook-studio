import * as T from 'three';
import { CORNER_RADIUS, BODY_PROFILE, wallProfile } from './chassis-profile';

// A sampled aluminum profile produces a continuous rounded highlight, rather
// than the flat vertical face of a box. The central scoop is part of the profile.
export function frontEdge(width: number, depth: number) {
  const across = 192,
    around = 28,
    positions: number[] = [],
    indices: number[] = [];
  const half = width / 2 - CORNER_RADIUS,
    bottom = BODY_PROFILE.bottom;
  for (let i = 0; i <= across; i++) {
    const x = -half + (2 * half * i) / across;
    const transition = T.MathUtils.smoothstep(Math.abs(x), 0.236, 0.286);
    const top = T.MathUtils.lerp(0.102, 0.128, transition);
    for (let j = 0; j <= around; j++) {
      const y = bottom + ((top - bottom) * j) / around;
      const { inset } = wallProfile(y, top);
      positions.push(x, y, depth / 2 - inset);
      if (i < across && j < around) {
        const a = i * (around + 1) + j,
          b = a + around + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
