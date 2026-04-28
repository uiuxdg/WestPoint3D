/** @type {import('next').NextConfig} */
const config = {
  turbopack: {
    // Force Turbopack to treat this folder as the workspace root
    root: process.cwd(),
  },
  images: {
    qualities: [24, 70, 75],
  },
};

export default config;

