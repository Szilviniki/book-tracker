/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker image-hez: .next/standalone csak a futáshoz szükséges fájlokkal
  output: "standalone",
  // az adatbázis a futáskor csatolt volume-ban él, ne kerüljön az image-be
  outputFileTracingExcludes: { "/*": ["data/**"] },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
