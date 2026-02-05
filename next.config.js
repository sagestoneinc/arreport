/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/audit',
        destination: '/playbook',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
