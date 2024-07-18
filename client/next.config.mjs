// next.config.mjs
export default async (phase) => {
  const { PHASE_DEVELOPMENT_SERVER } = await import("next/constants.js");
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    env: {
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      NEXT_PUBLIC_MAP_ID: process.env.NEXT_PUBLIC_MAP_ID,
    },
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: isDev
            ? "http://localhost:8000/api/:path*" // development api endpoint
            : "https://your-production-api.com/api/:path*", // Todo: render api endpoint
        },
      ];
    },
  };
};
