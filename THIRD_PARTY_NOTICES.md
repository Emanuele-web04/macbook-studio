# Third-party notices

## Apple model and images

The repository's MIT license covers the application source code, not Apple's model, textures, product images, logos, or trademarks. These media files are excluded from this Git repository.

`npm run assets` retrieves the converted demonstration model and reference image from the public demo into ignored local files. Downloading these files does not grant an open-source license to the assets. Review applicable permissions before redistributing or using them in another project.

The model originates from Apple's [2023 MacBook Pro 16-inch M3 Pro silver AR asset](https://www.apple.com/105/media/us/macbook-pro/2023/232a2dbf-5898-4fd1-a350-6a7c5c2e31c9/ar/macbook_pro_m3_pro_16_silver.usdz). Its original geometry and textures were converted to GLB, with an articulated lid and calibrated dimensions. See `public/models/provenance.json` for details. Space Gray is a material visualization; the displayed M5 Pro configuration is not a certified M5 CAD model.

This project is independent and is not affiliated with or endorsed by Apple.

## UI components and dependencies

The `components/ui` files derive from shadcn/ui, used under the MIT license. Its notice is retained in `LICENSES/shadcn-ui-MIT.txt`.

Dependencies retain their own licenses. Consult each package's license in `node_modules` after installation; the application MIT license does not replace those notices.
