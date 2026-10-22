# Template lab: After Effects (Lottie) and Alight Motion (XML) -> Remotion

Both paths render through the `templates` workflow (GitHub Actions only). Output: a 4:5 (1080x1350) and a 16:9 (1920x1080)
test mp4 plus a contact sheet per format (4 fps tiles), as artifact `templates-<kind>-<name>`.

## Replace map (same for both paths)
`{"text":{"old":"new"},"colors":{"#hex":"#hex"}}`. Text: exact match first, otherwise substring. Colours: hex to hex (Lottie matches within ~1/255).

## After Effects -> Lottie
1. In AE install the Bodymovin/LottieFiles plugin, open Window > Extensions > Bodymovin, pick the comp, tick "Glyphs: off" (we need live text), Export to JSON.
2. Drop the file at `public/templates/lottie/<name>.json` (commit it only if it is yours/licensed; the repo is PUBLIC, no paid assets).
3. Render: `gh workflow run templates.yml --ref <branch> -f kind=lottie -f name=<name> -f replace='{"text":{"Old":"New"},"colors":{"#ff3366":"#7C83FF"}}'`
Survives: shape layers (paths, rect/ellipse, fills, strokes, trim paths, repeaters), transforms, keyframes + easing, masks, mattes, precomps, text layers (live text), solids, image assets (embedded or in `images/` next to the JSON).
Does NOT survive (Bodymovin limits): most effects (blur, glow, fractal noise, etc.), 3D layers/cameras/lights, expressions (partial), blend modes (partial), layer styles, video layers, time remap on some comps.
Replace map limits: gradients (`gf/gs`), effect colours and expression-driven colours are not recoloured; text on a path / per-character animators keep old styling. Fonts: the text uses the AE font name; if it is not installed on the runner it falls back to a default sans (put font handling in a follow-up).
Duration, fps and size come from the JSON (`ip/op/fr/w/h`); 4:5 and 16:9 fit the animation inside the frame ("meet", background `#111111`).

## Alight Motion -> XML -> neutral JSON
1. Export the preset XML from AM, drop it at `public/templates/am/<name>.xml`.
2. Optional local check: `python scripts/am2json.py public/templates/am/<name>.xml` (writes `<name>.json`, prints `unsupported` effects).
3. Render: `gh workflow run templates.yml --ref <branch> -f kind=am -f name=<name> -f replace='{"text":{"Old":"New"}}'` (the workflow runs am2json itself).
Supported: scene size/fps/duration, text, rect/ellipse shapes (fill, stroke, radius), images (`src` under `public/`), groups, position/scale/rotation/opacity keyframes with linear/ease/cubic-bezier/hold easing.
Not supported (listed in `unsupported` and the render log, NOT drawn): every effect, blend modes, masks, gradients, 3D, audio, video layers.
IMPORTANT: Alight Motion publishes no XML spec and no public raw sample was found, so `am2json.py` is schema-tolerant and was written against our own hand-made `sample.xml`. Run the founder's first real file, read the `warnings`/`unsupported` output, and extend the ALIAS tables at the top of `scripts/am2json.py` (time unit defaults to ms; use `--time-unit s|frames` if needed).

## Entry point
`npx remotion render src/templates/index.ts <Lottie|AM>-<4x5|16x9|native> out.mp4 --props=props.json` with `props.json = {"name":"sample","replace":{...}}` (`native` = the template's own size).
