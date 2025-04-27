/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['raw.githubusercontent.com', 'github.com'],
  },
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    localeDetection: true,
  }
};

module.exports = nextConfig; 