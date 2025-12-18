/** @type {import('next').NextConfig} */
const config = {
  turbopack: {
    // Force Turbopack to treat this folder as the workspace root
    root: process.cwd(),
  },
};

export default config;

