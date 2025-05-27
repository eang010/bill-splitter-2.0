import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Disable workbox logging in development
  buildExcludes: [/middleware-manifest\.json$/],
  // Exclude middleware to prevent warnings
  exclude: [
    /middleware-manifest\.json$/,
    /build-manifest\.json$/,
    /react-loadable-manifest\.json$/
  ]
})(nextConfig)

export default config
