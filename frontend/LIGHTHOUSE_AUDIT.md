# Lighthouse Audit Configuration

## Performance Targets

| Metric | Target | Priority |
|--------|--------|----------|
| Performance | >90 | High |
| Accessibility | >95 | High |
| Best Practices | >90 | Medium |
| SEO | >90 | Medium |
| PWA | >80 | Low |

## Current Optimizations

### Already Implemented (from Vite config)

- **Code Splitting**: Manual chunks for vendor, query, and forms
- **Bundle Analysis**: Achieved via Vite build

### Recommended Optimizations

#### 1. Image Optimization

```bash
# Install image optimization
npm install -D vite-plugin-imagemin

# In vite.config.js
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      pngquant: { quality: [0.65, 0.9] },
      svgo: {},
    }),
  ],
});
```

#### 2. Lazy Loading

Components already lazy-loaded:
- ProductsPage
- GalleryPage
- QuotePage
- BookingPage
- OrdersPage
- Admin pages

#### 3. Tailwind CSS Purge

In `tailwind.config.js`:
```js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  // This ensures unused styles are removed
}
```

#### 4. Preload Critical Resources

Add to `index.html`:
```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/dm-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://res.cloudinary.com">
```

## Running Lighthouse Audit

```bash
# Using Chrome DevTools
# 1. Open Chrome DevTools
# 2. Go to Lighthouse tab
# 3. Select categories
# 4. Run audit

# Using CLI
npm install -g lighthouse
lighthouse http://localhost:5173 --output=json --output-path=./lighthouse-report.json

# Using PageSpeed Insights
npx psi http://localhost:5173 --strategy=desktop
```

## Performance Checklist

- [x] React Query caching strategy implemented
- [x] Code splitting configured in Vite
- [x] Tailwind CSS purge enabled
- [ ] Image optimization (Cloudinary handles this)
- [ ] Font preloading
- [ ] Service worker for PWA (Phase 2)
- [ ] Bundle analysis
- [ ] Critical CSS inlining