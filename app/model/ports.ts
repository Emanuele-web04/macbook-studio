import * as T from 'three';
import { extrude, hole, mesh, outline } from './geometry';
import type { Materials } from './materials';
import { CORNER_RADIUS, curvedWall, profileHeights } from './chassis-profile';

type Port = {
  name: string;
  z: number;
  width: number;
  height: number;
  radius: number;
};
const left: Port[] = [
  { name: 'MagSafe', z: -0.956, width: 0.132, height: 0.036, radius: 0.012 },
  {
    name: 'Thunderbolt 1',
    z: -0.71,
    width: 0.086,
    height: 0.034,
    radius: 0.015,
  },
  {
    name: 'Thunderbolt 2',
    z: -0.472,
    width: 0.086,
    height: 0.034,
    radius: 0.015,
  },
  { name: 'Headphone', z: -0.213, width: 0.038, height: 0.038, radius: 0.019 },
];
const right: Port[] = [
  { name: 'HDMI', z: -0.91, width: 0.153, height: 0.049, radius: 0.005 },
  {
    name: 'Thunderbolt 3',
    z: -0.614,
    width: 0.086,
    height: 0.034,
    radius: 0.015,
  },
  { name: 'SDXC', z: -0.2, width: 0.255, height: 0.022, radius: 0.003 },
];
export function createPorts(parent: T.Object3D, m: Materials) {
  for (const side of [-1, 1]) {
    const ports = side < 0 ? left : right;
    const wall = outline(2.481 - 2 * CORNER_RADIUS, 0.071, 0.001);
    for (const p of ports)
      hole(wall, p.width, p.height, p.radius, -p.z, -0.0045);
    // These are holes through the aluminum side wall, with sockets recessed behind them.
    const geometry = extrude(wall, 0.019, 0);
    geometry.rotateY(Math.PI / 2);
    mesh(
      parent,
      side < 0 ? 'Left machined side wall' : 'Right machined side wall',
      geometry,
      m.metal,
      side * 1.769,
      0.0855,
      0,
    );
    const ys = profileHeights(),
      limit = 2.481 / 2 - CORNER_RADIUS;
    for (const heights of [ys.slice(0, 13), ys.slice(13)]) {
      const rounding = curvedWall(
        (t) => ({
          x: side * 1.7785,
          z: -limit + 2 * limit * t,
          nx: side,
          nz: 0,
        }),
        1,
        heights,
      );
      mesh(parent, 'Rounded side shoulder', rounding, m.metal);
    }
    for (const p of ports) {
      const back = extrude(
        outline(p.width + 0.003, p.height + 0.003, p.radius),
        0.001,
      );
      back.rotateY(Math.PI / 2);
      mesh(parent, `${p.name} socket`, back, m.black, side * 1.754, 0.081, p.z);
      if (p.name.startsWith('Thunderbolt')) {
        const tongue = new T.BoxGeometry(0.012, 0.006, 0.06);
        mesh(
          parent,
          `${p.name} connector tongue`,
          tongue,
          m.rubber,
          side * 1.756,
          0.081,
          p.z,
        );
        for (let i = 0; i < 8; i++)
          mesh(
            parent,
            `${p.name} contact ${i}`,
            new T.BoxGeometry(0.003, 0.001, 0.002),
            m.gold,
            side * 1.763,
            0.0846,
            p.z - 0.022 + i * 0.006,
          );
      } else if (p.name === 'MagSafe') {
        for (let i = 0; i < 5; i++) {
          const contact = new T.CylinderGeometry(0.0035, 0.0035, 0.004, 12);
          contact.rotateZ(Math.PI / 2);
          mesh(
            parent,
            `MagSafe pin ${i}`,
            contact,
            m.gold,
            side * 1.757,
            0.081,
            p.z + (i - 2) * 0.02,
          );
        }
      } else if (p.name === 'HDMI') {
        mesh(
          parent,
          'HDMI connector tongue',
          new T.BoxGeometry(0.007, 0.009, 0.113),
          m.rubber,
          side * 1.756,
          0.082,
          p.z,
        );
        for (let i = 0; i < 10; i++)
          mesh(
            parent,
            `HDMI contact ${i}`,
            new T.BoxGeometry(0.003, 0.001, 0.0025),
            m.gold,
            side * 1.761,
            0.087,
            p.z - 0.048 + i * 0.01,
          );
      } else if (p.name === 'Headphone') {
        const ring = new T.TorusGeometry(0.0165, 0.0015, 6, 32);
        ring.rotateY(Math.PI / 2);
        mesh(
          parent,
          'Headphone socket rim',
          ring,
          m.edge,
          side * 1.777,
          0.081,
          p.z,
        );
      }
    }
  }
}
