/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "magic.decentralized-content.com",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "scontent-iad4-1.choicecdn.com",
      },
    ],
  },
};

export default nextConfig;
