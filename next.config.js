import path from "path";
/** @type {import('next').NextConfig} */
const NextConfig = {
  /* config options here */
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'Cross-Origin-Opener-Policy',
  //           value: 'same-origin-allow-popups',

  //         },
  //       ],
  //     },
  //   ]
  // },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(process.cwd(), "src");
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default NextConfig;
