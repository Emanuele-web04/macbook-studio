# Apple SF Symbols

The SVG artwork in this directory and `public/symbols/` is Apple SF Symbols, owned by Apple Inc. It is **not covered by this project's MIT license**.

These symbols were exported using File > Export Symbol in Apple's official SF Symbols 8 beta application. Unmodified exports are retained in `original/`; `provenance.json` records their source and SHA-256 hashes. The browser assets select the Regular-S monochrome subpaths without redrawing them, remove the template artboard, and center the viewport. The F1–F12 keys use the same unmodified path data bundled in `app/model/function-key-symbols.ts`, drawn with Canvas Path2D into the keyboard legend texture. This requires no downloaded font or runtime SVG fetch.

Apple's accompanying license is retained verbatim in `APPLE-LICENSE.txt`. Its Apple-platform and distribution restrictions continue to apply; this repository's inclusion and attribution do not grant additional permission for web use or redistribution. Obtain any necessary rights from Apple before reusing these assets. See [SF Symbols](https://developer.apple.com/sf-symbols/) and the [Xcode and Apple SDKs agreement](https://www.apple.com/legal/sla/docs/xcode.pdf).

Only the twelve function-key symbols use these Apple assets. The viewer controls use Lucide icons. The laptop geometry, screen artwork, other keyboard legends, and hand-constructed lid emblem remain independently authored.
