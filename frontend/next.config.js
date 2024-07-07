const { default: next } = require('next')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allows us to add svg images
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  images : {
    domains : ['firebasestorage.googleapis.com', 'localhost'] // <== Domain name
  },
}

module.exports = nextConfig
