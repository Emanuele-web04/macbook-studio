import * as T from 'three';
export type Finish = 'silver' | 'space-gray';
export function createMaterials() {
  const metal = new T.MeshPhysicalMaterial({
    color: 0xbfc1c5,
    metalness: 0.92,
    roughness: 0.36,
    clearcoat: 0.08,
    clearcoatRoughness: 0.45,
  });
  // Fine machining grain is generated in the shader. No photographic texture maps.
  metal.onBeforeCompile = (shader) => {
    shader.vertexShader = 'varying vec3 vGrain;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvGrain = position;',
    );
    shader.fragmentShader = 'varying vec3 vGrain;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `
      #include <roughnessmap_fragment>
      vec3 grainCell = floor(vGrain * 9000.0);
      float grain = fract(sin(dot(grainCell, vec3(12.9898,78.233,37.719))) * 43758.5453);
      float grainFade = 1.0 / (1.0 + length(fwidth(vGrain)) * 9000.0);
      roughnessFactor = clamp(roughnessFactor + (grain - 0.5) * 0.10 * grainFade, 0.2, 0.7);
    `,
    );
  };
  metal.customProgramCacheKey = () => 'original-machined-aluminum';
  const trackpad = metal.clone();
  trackpad.roughness = 0.48;
  const edge = metal.clone();
  edge.roughness = 0.25;
  const black = new T.MeshStandardMaterial({
    color: 0x090a0c,
    roughness: 0.7,
    metalness: 0.15,
  });
  const key = new T.MeshPhysicalMaterial({
    color: 0x16171a,
    roughness: 0.48,
    metalness: 0.05,
    clearcoat: 0.12,
  });
  const rubber = new T.MeshStandardMaterial({
    color: 0x161618,
    roughness: 0.95,
  });
  const glass = new T.MeshPhysicalMaterial({
    color: 0x08090b,
    roughness: 0.18,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.07,
  });
  const logo = new T.MeshPhysicalMaterial({
    color: 0x141416,
    metalness: 1,
    roughness: 0.15,
    side: T.DoubleSide,
  });
  const gold = new T.MeshStandardMaterial({
    color: 0xb7a674,
    metalness: 0.85,
    roughness: 0.3,
  });
  const silver = new T.Color(0xbfc1c5),
    gray = new T.Color(0x66676b);
  return {
    metal,
    trackpad,
    edge,
    black,
    key,
    rubber,
    glass,
    logo,
    gold,
    setFinish(blend: number) {
      for (const m of [metal, trackpad, edge])
        m.color.lerpColors(silver, gray, blend);
    },
  };
}
export type Materials = ReturnType<typeof createMaterials>;
