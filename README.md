# MacBook Studio

An interactive 3D MacBook viewer with a minimal interface, built with React, Three.js, and Vinext.

**[Live demo](https://x.com/emanueledpt/status/2097293889610903703?s=20)**

- Drag to orbit, scroll or pinch to zoom.
- Open and close the articulated lid with a slider or presets.
- Switch between Silver and Space Gray using the color swatches.
- Explore preset camera views or enable automatic rotation.
- Enter immersive fullscreen mode with controls that fade when idle.
- See a subtle separation seam at the front lip when the lid closes.
- Use the keyboard: arrow keys rotate the focused viewer, `+` / `-` zoom, and Escape exits immersive mode.

## Run locally

Requires Node.js 22.13 or newer and npm. WebGL is required in the browser.

```sh
npm ci
npm run assets
npm run dev
```

Open the local URL printed by the development server, usually http://localhost:3000.

The asset command downloads the demo model and image into ignored local files. **The code is MIT licensed; Apple media is separate and is not included in this repository.** Read [third-party notices](THIRD_PARTY_NOTICES.md) before reusing the media. The download currently depends on the original hosted viewer remaining available. Without the model file, the viewer will display a loading error.

The Google fonts used by the page may require network access during the first build.

## Build and check

```sh
npm run typecheck
npm run build
npm start
```

The production build targets Cloudflare Workers. `npm start` previews that build locally through Wrangler. Publishing your own deployment requires your own hosting configuration and account; this repository contains no credentials or binding to the original Sites project.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/scene.tsx` | Model loading, lighting, materials, camera, lid animation, and seam shader |
| `app/page.tsx` | Viewer controls, finish selection, and immersive mode |
| `app/globals.css` | Interface styling and responsive layouts |
| `app/webmcp.ts` | Optional `set_lid_angle` and `get_lid_angle` tools for supporting browsers |
| `scripts/download-assets.mjs` | Explicit download and SHA-256 verification of demo assets |
| `public/models/provenance.json` | Model origin and limitations |

The viewer uses the original 2023 Apple 16-inch M3 Pro model, adapted to 355.7 × 248.1 × 16.8 mm. It is not a certified 1:1 M5 model. Material and mesh names in the scene are specific to this asset; replacing the model requires updating those mappings and the lid hinge.

## Contributing

Issues and pull requests are welcome. Run the type check and production build before submitting changes. Keep the interaction simple, preserve keyboard accessibility, and do not commit downloaded third-party media, credentials, or build output.

## License

[MIT](LICENSE) for the source code. See [third-party notices](THIRD_PARTY_NOTICES.md) for Apple media and dependency licensing.
