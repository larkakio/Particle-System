# Asset generation

Neon cyberpunk **JPEG** exports for Base.dev listings.

```bash
npm run generate-assets
```

Outputs:

- `public/app-icon.jpg` — 1024×1024 (from SVG raster)
- `public/app-thumbnail.jpg` — 1.91:1 (1910×1000)

### Verify size & dimensions (macOS)

```bash
sips -g pixelWidth -g pixelHeight public/app-icon.jpg
ls -l public/app-icon.jpg public/app-thumbnail.jpg
```

Target: each file **under 1MB**. If needed: adjust `quality` in `generate-assets.mjs` or run:

```bash
sips -s format jpeg -s formatOptions 80 public/app-icon.jpg
```

### Square icon from non-square source

Crop to square on the **short** side, then scale:

```bash
W=$(sips -g pixelWidth -x in.jpg | awk '/pixelWidth/ {print $2}')
H=$(sips -g pixelHeight -x in.jpg | awk '/pixelHeight/ {print $2}')
S=$W; [ "$H" -lt "$W" ] && S=$H
sips --cropToHeightWidth "$S" "$S" in.jpg --out square.jpg
sips -z 1024 1024 square.jpg --out app-icon.jpg
```
