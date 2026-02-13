/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/services', destination: '/#services', permanent: true },
      { source: '/portfolio', destination: '/#portfolio', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
    ]
  },
}

export default nextConfig
