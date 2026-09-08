'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface SceneHandle { view(name: string): void; zoom(closer: boolean): void }
export type Finish = 'silver' | 'space-gray';
type Props = { lid: number; spin: boolean; finish: Finish; onReady(): void; onError(): void };
const DEFAULT_CAMERA = new THREE.Vector3(-5.3, 4.2, 8.2);
const SOURCE_LID_ANGLE = 110;
const LID_ANIMATION_DURATION = 0.75;
// Original asset materials for aluminum, trackpad, speaker grilles and metal trim.
const FINISH_MATERIALS = new Set([
  'nDsMUuDKliqGFdU', 'fNHiBfcxHUJCahl', 'iyDJFXmHelnMTbD', 'CRQixVLpahJzhJc',
  'YYwBgwvcyZVOOAA', 'bsmYIMHYRqMuLqz', 'zhGRTuGrQoJflBD', 'bsEIHfblEXNcUMs',
  'LpqXZqhaGCeSzdu', 'lmWQsEjxpsebDlK', 'gMtYExgrEUqPfln', 'SLGkCohDDelqXBu',
  'wjAYtisbflXilXi', 'ZCDwChwkbBfITSW', 'RyKTMHTpkkwQkvB',
]);

function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
  textures.forEach(texture => texture.dispose());
}

const MacBookScene = forwardRef<SceneHandle, Props>(function MacBookScene({ lid, spin, finish, onReady, onError }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const params = useRef({ lid, spin, finish });
  params.current = { lid, spin, finish };
  const api = useRef<SceneHandle>({ view() {}, zoom() {} });
  const callbacks = useRef({ onReady, onError });
  callbacks.current = { onReady, onError };
  useImperativeHandle(ref, () => ({ view: name => api.current.view(name), zoom: closer => api.current.zoom(closer) }), []);

  useEffect(() => {
    const container = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      callbacks.current.onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const studioRoom = new RoomEnvironment();
    const environment = pmrem.fromScene(studioRoom, 0.025);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.7;
    studioRoom.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(32, 1, 0.02, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.23, -0.25);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 30;
    controls.autoRotateSpeed = 0.75;
    controls.rotateSpeed = 0.65;
    controls.minPolarAngle = 0.035;
    controls.maxPolarAngle = Math.PI - 0.035;
    camera.position.copy(DEFAULT_CAMERA);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb4bbc5, 0.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(-3, 7, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    Object.assign(keyLight.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.1, far: 20 });
    keyLight.shadow.normalBias = 0.002;
    keyLight.shadow.bias = -0.000015;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xf1f5ff, 0.45);
    fillLight.position.set(4, 2, -3);
    scene.add(fillLight);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ color: 0x525d68, opacity: 0.13 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.003;
    ground.receiveShadow = true;
    scene.add(ground);

    let active = true;
    let model: THREE.Group | null = null;
    let hinge: THREE.Object3D | null = null;
    let lidMotion: { from: number; target: number; elapsed: number } | null = null;
    const seamStrength = { value: 0 };
    const finishMaterials = new Map<THREE.MeshStandardMaterial, { silver: THREE.Color; gray: THREE.Color }>();
    let finishBlend = params.current.finish === 'space-gray' ? 1 : 0;
    let cameraTarget: THREE.Vector3 | null = null;
    let frame = 0;
    let last = 0;
    const loader = new GLTFLoader();
    loader.load('/models/macbook-pro-16-silver.glb', async gltf => {
      if (!active) { disposeModel(gltf.scene); return; }
      model = gltf.scene;
      // GLB retains Apple's real-world metre scale. This is a uniform viewing scale.
      model.scale.setScalar(10);
      hinge = model.getObjectByName('Lid') ?? null;
      if (!hinge) { disposeModel(model); callbacks.current.onError(); return; }
      hinge.rotation.x = THREE.MathUtils.degToRad(SOURCE_LID_ANGLE - params.current.lid);
      model.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material instanceof THREE.MeshStandardMaterial && FINISH_MATERIALS.has(material.name) && !finishMaterials.has(material)) {
            const silver = material.color.clone();
            const gray = silver.clone().multiplyScalar(0.24);
            finishMaterials.set(material, { silver, gray });
            material.color.lerpColors(silver, gray, finishBlend);
          }
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
          }
          if (material instanceof THREE.MeshStandardMaterial && material.emissiveMap) material.toneMapped = false;
          if (material.transparent) object.castShadow = false;
        }
      });
      scene.add(model);
      // Align the joint with the lid's lower front lip, above the finger recess.
      const lidShell = model.getObjectByName('EsQRFXIuhhkXDHc');
      if (lidShell instanceof THREE.Mesh) {
        const openRotation = hinge.rotation.x;
        hinge.rotation.x = THREE.MathUtils.degToRad(SOURCE_LID_ANGLE);
        lidShell.updateWorldMatrix(true, false);
        const frontEdge = new THREE.Box3().setFromObject(lidShell, true).max.z;
        const vertices = lidShell.geometry.getAttribute('position');
        const point = new THREE.Vector3();
        let seamHeight = Infinity;
        for (let i = 0; i < vertices.count; i++) {
          point.fromBufferAttribute(vertices, i).applyMatrix4(lidShell.matrixWorld);
          if (point.z >= frontEdge - 0.0003) seamHeight = Math.min(seamHeight, point.y);
        }
        hinge.rotation.x = openRotation;
        model.updateMatrixWorld(true);
        const shellNames = ['SDuwtEsnNduSSwf', 'eEDJDQDQQpAlFLR', 'EsQRFXIuhhkXDHc'];
        for (const name of shellNames) {
          const shell = model.getObjectByName(name);
          if (!(shell instanceof THREE.Mesh)) continue;
          const shellMaterials: THREE.Material[] = Array.isArray(shell.material) ? shell.material : [shell.material];
          for (const material of shellMaterials) {
            material.onBeforeCompile = shader => {
              shader.uniforms.seamStrength = seamStrength;
              shader.uniforms.seamHeight = { value: seamHeight };
              shader.vertexShader = 'varying float vSeamHeight;\n' + shader.vertexShader;
              shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>',
                '#include <project_vertex>\nvSeamHeight = (modelMatrix * vec4(transformed, 1.0)).y;');
              shader.fragmentShader = 'uniform float seamStrength;\nuniform float seamHeight;\nvarying float vSeamHeight;\n' + shader.fragmentShader;
              shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
                float pixelHeight = max(fwidth(vSeamHeight), 0.00001);
                float seamOffset = vSeamHeight - seamHeight;
                float seamOverlap = max(0.0, min(seamOffset + pixelHeight * 0.5, 0.0006) - max(seamOffset - pixelHeight * 0.5, -0.0006));
                float seamCoverage = clamp(seamOverlap / pixelHeight, 0.0, 1.0);
                outgoingLight = mix(outgoingLight, vec3(0.028), seamCoverage * seamStrength);
                #include <opaque_fragment>
              `);
            };
            material.customProgramCacheKey = () => 'closed-lid-seam';
            material.needsUpdate = true;
          }
        }
      }
      try {
        await renderer.compileAsync(scene, camera);
        if (active) callbacks.current.onReady();
      } catch {
        if (active) callbacks.current.onError();
      }
    }, undefined, () => { if (active) callbacks.current.onError(); });

    let fittedDistance = 0;
    const framingDistance = () => Math.max(7.8, 5.2 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    function fit(initial = false) {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      const distance = framingDistance();
      if (initial) camera.position.copy(DEFAULT_CAMERA).sub(controls.target).normalize().multiplyScalar(distance).add(controls.target);
      else if (fittedDistance) {
        camera.position.sub(controls.target).multiplyScalar(distance / fittedDistance).add(controls.target);
        if (cameraTarget) cameraTarget.sub(controls.target).multiplyScalar(distance / fittedDistance).add(controls.target);
      }
      fittedDistance = distance;
      controls.update();
    }
    fit(true);
    const observer = new ResizeObserver(() => fit());
    observer.observe(container);
    api.current = {
      view(name) {
        const positions: Record<string, [number, number, number]> = {
          Perspective: [-5.3, 4.2, 8.2], Front: [0, 2.8, 8.7], Top: [0, 9, 0], Back: [3.7, 3.4, -7.8],
        };
        cameraTarget = new THREE.Vector3(...(positions[name] ?? positions.Perspective));
        cameraTarget.sub(controls.target).normalize().multiplyScalar(framingDistance()).add(controls.target);
      },
      zoom(closer) {
        cameraTarget = camera.position.clone().sub(controls.target).multiplyScalar(closer ? 0.82 : 1.22);
        cameraTarget.clampLength(controls.minDistance, controls.maxDistance).add(controls.target);
      },
    };
    const cancelCameraAnimation = () => { cameraTarget = null; };
    controls.addEventListener('start', cancelCameraAnimation);
    function handleKey(event: KeyboardEvent) {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      if (event.key === 'ArrowLeft') spherical.theta -= 0.15;
      else if (event.key === 'ArrowRight') spherical.theta += 0.15;
      else if (event.key === 'ArrowUp') spherical.phi = Math.max(0.035, spherical.phi - 0.15);
      else if (event.key === 'ArrowDown') spherical.phi = Math.min(Math.PI - 0.035, spherical.phi + 0.15);
      else if (event.key === '+' || event.key === '=') api.current.zoom(true);
      else if (event.key === '-') api.current.zoom(false);
      else return;
      event.preventDefault();
      if (event.key.startsWith('Arrow')) cameraTarget = new THREE.Vector3().setFromSpherical(spherical).add(controls.target);
    }
    container.addEventListener('keydown', handleKey);
    function render(time: number) {
      if (!active) return;
      frame = requestAnimationFrame(render);
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      const targetFinish = params.current.finish === 'space-gray' ? 1 : 0;
      finishBlend = THREE.MathUtils.damp(finishBlend, targetFinish, 10, dt);
      if (Math.abs(finishBlend - targetFinish) < 0.001) finishBlend = targetFinish;
      for (const [material, colors] of finishMaterials) material.color.lerpColors(colors.silver, colors.gray, finishBlend);
      // Let the camera reach its destination before resuming automatic rotation.
      controls.autoRotate = params.current.spin && cameraTarget === null;
      const openness = THREE.MathUtils.clamp(params.current.lid / 90, 0, 1);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, THREE.MathUtils.lerp(0.12, 1.23, openness), 6, dt);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, -0.25 * openness, 6, dt);
      if (hinge) {
        const targetRotation = THREE.MathUtils.degToRad(SOURCE_LID_ANGLE - params.current.lid);
        if (!lidMotion || lidMotion.target !== targetRotation) {
          lidMotion = { from: hinge.rotation.x, target: targetRotation, elapsed: hinge.rotation.x === targetRotation ? LID_ANIMATION_DURATION : 0 };
        }
        lidMotion.elapsed = Math.min(LID_ANIMATION_DURATION, lidMotion.elapsed + dt);
        const progress = lidMotion.elapsed / LID_ANIMATION_DURATION;
        // Preserve the original exponential easing, with a definite contact frame.
        const eased = (1 - Math.exp(-6 * progress)) / (1 - Math.exp(-6));
        const reachedPosition = progress >= 1 - 1e-10;
        hinge.rotation.x = reachedPosition ? targetRotation : THREE.MathUtils.lerp(lidMotion.from, targetRotation, eased);
        seamStrength.value = params.current.lid === 0 && reachedPosition ? 0.7 : 0;
      }
      if (cameraTarget) {
        camera.position.lerp(cameraTarget, 1 - Math.exp(-7 * dt));
        if (camera.position.distanceTo(cameraTarget) < 0.005) cameraTarget = null;
      }
      controls.update(dt);
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener('keydown', handleKey);
      controls.dispose();
      disposeModel(scene);
      environment.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);
  return <div className="scene" ref={host} tabIndex={0} role="img" aria-label={`${finish === 'silver' ? 'Silver' : 'Space Gray'} MacBook Pro 3D model. Drag or use arrow keys to rotate; scroll, pinch, or use plus and minus to zoom.`} />;
});
export default MacBookScene;
