# MacBook Studio

An interactive 3D MacBook viewer with an independently written model, built with React, Three.js, and Vinext.

**[Live demo](https://x.com/emanueledpt/status/2097293889610903703?s=20)**

The notebook is constructed entirely in code: rounded aluminum panels, 78 individual US ANSI keys, recessed connectors, speaker perforations, trackpad, hinge, feet, screws, and a hand-constructed lid emblem. Metal grain, key legends, and display artwork are generated locally. **No Apple 3D model, textures, product photographs, wallpaper, or icon pack is loaded or downloaded.**

- Drag to orbit; scroll or pinch to zoom.
- Open and close the articulated lid with a slider or presets.
- Choose Silver or Space Gray with the two compact color swatches.
- Select a camera view or enable automatic rotation.
- Enter immersive fullscreen mode with controls that fade when idle.
- Use arrow keys to rotate the focused viewer, `+` / `-` to zoom, and Escape to leave immersive mode.

The overall closed dimensions are 355.7 × 248.1 × 16.8 mm. Details were reconstructed from photographic references; this is not certified CAD or a verified exact replica of every M5-specific detail. The lid contact gasket is physical geometry that moves with the display, without a timed seam overlay.

## Run locally

Requires Node.js 22.13 or newer, npm, and a browser with WebGL 2.

```sh
npm ci
npm run dev
```

Open the local URL printed by the development server, usually http://localhost:3000. No model download or asset preparation is required. The Google fonts used by the interface may require network access during the first build.

## Build and check

```sh
npm run typecheck
npm run test:model
npm run build
npm start
```

The model checks verify dimensions, finite geometry, the 78-key layout, openings through both port walls, color selection, and precise lid contact at several frame rates. They run without a browser and do not assess rendered appearance.

The production build targets Cloudflare Workers. `npm start` previews it locally through Wrangler. Your own deployment requires your hosting configuration and account; this repository contains no credentials or binding to the original Sites project.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/model/laptop.ts` | Original chassis, trackpad, articulated lid, and exterior details |
| `app/model/geometry.ts` | Rounded outlines, extrusions, and mesh helpers |
| `app/model/keyboard.ts` | Individual US keycaps, locally drawn legends, and speaker perforations |
| `app/model/ports.ts` | Machined openings and recessed connector details |
| `app/model/materials.ts` | Aluminum finishes and procedural grain |
| `app/model/display.ts` | Original locally drawn screen artwork |
| `app/model/dock.ts` | Desktop icon studies drawn from simple Canvas paths |
| `app/model/front-edge.ts` | Curved aluminum front profile and finger scoop |
| `app/model/chassis-profile.ts` | Continuous shoulder, side, and corner profiles |
| `app/model/motion.ts` | Finite lid animation with exact contact |
| `app/scene.tsx` | Studio lighting, camera, rendering, and resource cleanup |
| `app/page.tsx` | Viewer controls and immersive mode |
| `app/webmcp.ts` | Optional lid tools for supporting browsers |
| `scripts/check-model.mjs` | Geometry and motion checks |

## Contributing

Issues and pull requests are welcome. Run the checks and production build before submitting changes. Keep the viewer accessible and the geometry independently authored. Do not add downloaded product models, proprietary media, credentials, or build output.

## License

The original source code and procedural artwork are available under [MIT](LICENSE). Apple and MacBook are trademarks of Apple Inc.; the software license does not grant rights to Apple's trademarks or product design. This is an independent, unofficial project, not affiliated with or endorsed by Apple. See [third-party notices](THIRD_PARTY_NOTICES.md) for dependency attribution.
