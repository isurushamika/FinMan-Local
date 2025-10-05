# Icon Generation Guide

You need to create app icons for your PWA. Here are your options:

## Option 1: Using Online Tool (Easiest)
1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 PNG image (your logo)
3. Download the generated icons
4. Extract to `apps/finman/frontend/public/icons/`

## Option 2: Using ImageMagick (Command Line)
If you have a logo file (logo.png), run these commands:

```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Ubuntu: sudo apt install imagemagick

# Create icons directory
mkdir -p apps/finman/frontend/public/icons

# Generate all sizes
magick logo.png -resize 72x72 apps/finman/frontend/public/icons/icon-72x72.png
magick logo.png -resize 96x96 apps/finman/frontend/public/icons/icon-96x96.png
magick logo.png -resize 128x128 apps/finman/frontend/public/icons/icon-128x128.png
magick logo.png -resize 144x144 apps/finman/frontend/public/icons/icon-144x144.png
magick logo.png -resize 152x152 apps/finman/frontend/public/icons/icon-152x152.png
magick logo.png -resize 192x192 apps/finman/frontend/public/icons/icon-192x192.png
magick logo.png -resize 384x384 apps/finman/frontend/public/icons/icon-384x384.png
magick logo.png -resize 512x512 apps/finman/frontend/public/icons/icon-512x512.png
```

## Option 3: Temporary Placeholder
For now, you can use a simple colored square:

```bash
# Create icons directory
mkdir apps\finman\frontend\public\icons

# Create a simple blue square icon (requires ImageMagick)
magick -size 512x512 xc:#3b82f6 -gravity center -pointsize 200 -fill white -annotate +0+0 "FM" apps/finman/frontend/public/icons/icon-512x512.png

# Then resize for other sizes
magick apps/finman/frontend/public/icons/icon-512x512.png -resize 72x72 apps/finman/frontend/public/icons/icon-72x72.png
magick apps/finman/frontend/public/icons/icon-512x512.png -resize 96x96 apps/finman/frontend/public/icons/icon-96x96.png
magick apps/finman/frontend/public/icons/icon-512x512.png -resize 128x128 apps/finman/frontend/public/icons/icon-128x128.png
magick apps/finman/frontend/public/icons/icon-512x512.png -resize 144x144 apps/finman/frontend/public/icons/icon-144x144.png
magick apps/finman/frontend/public/icons/icon-512x512.png -resize 152x152 apps/finman/frontend/public/icons/icon-152x152.png
magick apps/finman/frontend/public/icons/icon-512x512.png -resize 192x192 apps/finman/frontend/public/icons/icon-192x192.png
magick apps/finman/frontend/public/icons/icon-512x512.png -resize 384x384 apps/finman/frontend/public/icons/icon-384x384.png
```

## Required Icon Sizes
- 72x72 (Android)
- 96x96 (Android)
- 128x128 (Android)
- 144x144 (Android)
- 152x152 (iOS)
- 192x192 (Android)
- 384x384 (Android)
- 512x512 (Android, Splash screen)

## Design Tips
- Use a simple, recognizable logo
- Make sure it looks good at small sizes
- Use high contrast
- Avoid fine details
- Consider a colored background
- Center your icon content

## Quick Suggestion
For FinMan, you could use:
- 💰 Dollar/Rupee symbol
- 📊 Chart/Graph icon
- 🏦 Bank building
- 💳 Credit card
- 🔒 Lock (for security focus)
- Or combination: "FM" text with background

Would you like me to create a simple SVG logo for you?
