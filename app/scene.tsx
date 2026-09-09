'use client';

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scoped 3D application must receive keyboard focus for arrow-key orbit and zoom controls. */

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createLaptop } from './model/laptop';
import { advanceLid, LID_DURATION, type LidMotion } from './model/motion';
import type { Finish } from './model/materials';

export type { Finish } from './model/materials';
export interface SceneHandle {
  view(name: string): void;
  zoom(closer: boolean): void;
}
type Props = {
  lid: number;
  spin: boolean;
  finish: Finish;
  onReady(): void;
  onError(): void;
};
const viewpoints: Record<string, [number, number, number]> = {
  Perspective: [-5.3, 3.5, 8.2],
  Front: [0, 1.9, 8.7],
  Top: [0, 9, 0.4],
  Back: [3.7, 2.9, -7.8],
};

function release(root: T.Object3D) {
  const geometries = new Set<T.BufferGeometry>(),
    materials = new Set<T.Material>(),
    textures = new Set<T.Texture>();
  root.traverse((object) => {
    if (!(object instanceof T.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material))
        if (value instanceof T.Texture) textures.add(value);
    }
    if (object instanceof T.InstancedMesh) object.dispose();
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}

const MacBookScene = forwardRef<SceneHandle, Props>(
  function MacBookScene(props, ref) {
    const host = useRef<HTMLDivElement>(null),
      current = useRef(props);
    useLayoutEffect(() => {
      current.current = props;
    }, [props]);
    const api = useRef<SceneHandle>({ view() {}, zoom() {} });
    useImperativeHandle(
      ref,
      () => ({
        view: (name) => api.current.view(name),
        zoom: (closer) => api.current.zoom(closer),
      }),
      [],
    );
    useEffect(() => {
      const container = host.current!;
      let renderer: T.WebGLRenderer;
      try {
        renderer = new T.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        current.current.onError();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0xffffff, 0);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFShadowMap;
      container.appendChild(renderer.domElement);
      const scene = new T.Scene(),
        camera = new T.PerspectiveCamera(32, 1, 0.12, 60);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.minDistance = 2.5;
      controls.maxDistance = 30;
      controls.rotateSpeed = 0.65;
      controls.minPolarAngle = 0.035;
      controls.maxPolarAngle = Math.PI - 0.035;
      controls.autoRotateSpeed = 0.75;
      controls.target.set(0, 1.12, -0.24);
      const room = new RoomEnvironment(),
        pmrem = new T.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(room, 0.04);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.7;
      room.dispose();
      pmrem.dispose();
      scene.add(new T.HemisphereLight(0xffffff, 0xbababa, 0.3));
      const key = new T.DirectionalLight(0xfffaf5, 1.5);
      key.position.set(-3, 7, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      Object.assign(key.shadow.camera, {
        left: -4,
        right: 4,
        top: 4,
        bottom: -4,
        near: 0.1,
        far: 20,
      });
      key.shadow.normalBias = 0.001;
      key.shadow.bias = -0.000006;
      scene.add(key);
      const fill = new T.DirectionalLight(0xffffff, 0.5);
      fill.position.set(4, 3, -4);
      scene.add(fill);
      const floor = new T.Mesh(
        new T.PlaneGeometry(100, 100),
        new T.ShadowMaterial({ color: 0x48515b, opacity: 0.13 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.002;
      floor.receiveShadow = true;
      scene.add(floor);
      const laptop = createLaptop();
      scene.add(laptop.root);
      let lid = current.current.lid,
        finish = current.current.finish === 'space-gray' ? 1 : 0;
      laptop.setLid(lid);
      laptop.materials.setFinish(finish);
      let motion: LidMotion = { from: lid, target: lid, elapsed: LID_DURATION };
      let destination: T.Vector3 | null = null,
        lastDistance = 0,
        active = true,
        frame = 0,
        lastTime = 0;
      function fittedDistance() {
        return Math.max(
          7.8,
          5.4 /
            (2 *
              Math.tan(T.MathUtils.degToRad(camera.fov / 2)) *
              camera.aspect),
        );
      }
      function resize() {
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        const distance = fittedDistance();
        if (!lastDistance)
          camera.position
            .set(...viewpoints.Perspective)
            .normalize()
            .multiplyScalar(distance)
            .add(controls.target);
        else {
          camera.position
            .sub(controls.target)
            .multiplyScalar(distance / lastDistance)
            .add(controls.target);
          destination
            ?.sub(controls.target)
            .multiplyScalar(distance / lastDistance)
            .add(controls.target);
        }
        lastDistance = distance;
        controls.update();
      }
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      api.current = {
        view(name) {
          destination = new T.Vector3(
            ...(viewpoints[name] ?? viewpoints.Perspective),
          )
            .normalize()
            .multiplyScalar(fittedDistance())
            .add(controls.target);
        },
        zoom(closer) {
          destination = (destination ?? camera.position)
            .clone()
            .sub(controls.target)
            .multiplyScalar(closer ? 0.82 : 1.22)
            .clampLength(controls.minDistance, controls.maxDistance)
            .add(controls.target);
        },
      };
      const cancelTween = () => {
        destination = null;
      };
      controls.addEventListener('start', cancelTween);
      const keydown = (event: KeyboardEvent) => {
        const spherical = new T.Spherical().setFromVector3(
          camera.position.clone().sub(controls.target),
        );
        if (event.key === 'ArrowLeft') spherical.theta -= 0.15;
        else if (event.key === 'ArrowRight') spherical.theta += 0.15;
        else if (event.key === 'ArrowUp')
          spherical.phi = Math.max(0.035, spherical.phi - 0.15);
        else if (event.key === 'ArrowDown')
          spherical.phi = Math.min(Math.PI - 0.035, spherical.phi + 0.15);
        else if (event.key === '+' || event.key === '=') api.current.zoom(true);
        else if (event.key === '-') api.current.zoom(false);
        else return;
        event.preventDefault();
        if (event.key.startsWith('Arrow'))
          destination = new T.Vector3()
            .setFromSpherical(spherical)
            .add(controls.target);
      };
      container.addEventListener('keydown', keydown);
      const contextLost = (event: Event) => {
        event.preventDefault();
        current.current.onError();
      };
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      function render(time: number) {
        if (!active) return;
        const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
        lastTime = time;
        const desiredLid = T.MathUtils.clamp(current.current.lid, 0, 135);
        if (motion.target !== desiredLid)
          motion = { from: lid, target: desiredLid, elapsed: 0 };
        lid = advanceLid(motion, dt);
        laptop.setLid(lid);
        finish = T.MathUtils.damp(
          finish,
          current.current.finish === 'space-gray' ? 1 : 0,
          10,
          dt,
        );
        laptop.materials.setFinish(finish);
        const openness = T.MathUtils.clamp(lid / 90, 0, 1);
        const targetY = T.MathUtils.damp(
          controls.target.y,
          T.MathUtils.lerp(0.12, 1.12, openness),
          6,
          dt,
        );
        const targetZ = T.MathUtils.damp(
          controls.target.z,
          -0.24 * openness,
          6,
          dt,
        );
        const shift = new T.Vector3(
          0,
          targetY - controls.target.y,
          targetZ - controls.target.z,
        );
        controls.target.add(shift);
        camera.position.add(shift);
        destination?.add(shift);
        // A view/zoom transition temporarily owns the camera. Auto-rotate resumes afterwards.
        controls.autoRotate = current.current.spin && destination === null;
        if (destination) {
          camera.position.lerp(destination, 1 - Math.exp(-7 * dt));
          if (camera.position.distanceTo(destination) < 0.003) {
            camera.position.copy(destination);
            destination = null;
          }
        }
        controls.update(dt);
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      }
      renderer
        .compileAsync(scene, camera)
        .then(() => {
          if (active) {
            current.current.onReady();
            frame = requestAnimationFrame(render);
          }
        })
        .catch(() => {
          if (active) current.current.onError();
        });
      return () => {
        active = false;
        cancelAnimationFrame(frame);
        observer.disconnect();
        container.removeEventListener('keydown', keydown);
        renderer.domElement.removeEventListener(
          'webglcontextlost',
          contextLost,
        );
        controls.dispose();
        release(scene);
        key.shadow.dispose();
        environment.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        api.current = { view() {}, zoom() {} };
      };
    }, []);
    return (
      <div
        ref={host}
        className="scene"
        tabIndex={0}
        role="application"
        aria-label={`${props.finish === 'silver' ? 'Silver' : 'Space Gray'} MacBook Pro 3D model. Drag or use arrow keys to rotate. Scroll, pinch, or use plus and minus to zoom.`}
      />
    );
  },
);
export default MacBookScene;
