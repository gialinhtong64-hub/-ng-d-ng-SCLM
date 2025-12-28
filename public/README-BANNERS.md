How to replace the banner images

- This project serves files in `public/` directly at the site root.
- The preview app includes six sample banners in `public/banners/`.

Paths you can use in the app (examples):
- /banners/banner1.svg
- /banners/banner2.svg
- /banners/banner3.svg
- /banners/banner4.svg
- /banners/banner5.svg
- /banners/banner6.svg

To replace a banner:
1. Put your image file (png/jpg/webp/svg) into `public/banners/`.
2. Keep the same filename to override the sample, or update the banner list in `src/components/HomeScreen.tsx` to point to new filenames.
3. The dev server will auto-reload; if it doesn't, restart with `npm run dev`.

Notes:
- For best results, use wide images (recommended 1200×400) or SVGs that scale well.
- When adding images via the in-app "Thêm banner" button, they are stored as temporary object URLs in memory (not persisted). For persistent banners, copy files into `public/banners/`.
