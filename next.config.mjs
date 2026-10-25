/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The floating dev badge sits on top of the phone dock's Settings button.
  devIndicators: false,
  images: {
    // Unsplash's CDN (imgix) resizes, crops and re-encodes at the edge, so we hand it the
    // width instead of re-optimising an already optimised image. See src/lib/image-loader.js.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.js',
  },
  turbopack: {
    rules: {
      // CSS Modules are excluded: `as: '*.css'` would re-type them as global CSS and
      // drop their scoped class names. They only use token variables, not utilities.
      '*.css': {
        condition: { not: { path: '*.module.css' } },
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
