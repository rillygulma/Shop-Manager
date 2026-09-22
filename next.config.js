/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // recommended for catching potential issues
  trailingSlash: false, // keeps URLs clean
  output: "standalone", // good for deployments
};

module.exports = nextConfig;
