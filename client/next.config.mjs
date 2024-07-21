// next.config.mjs
// How to use GoogleMapAPI
// 1:create client\.env.local file and add the following code to the file
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
// NEXT_PUBLIC_MAP_ID=
// 2:Go to https://developers.google.com/maps?hl=zh-tw to get the API key
// 3:Create a new project and enable the Maps JavaScript API
// 4:Go to the Credentials page and create a new API key
// 5:Copy the API key and paste it into the .env.local file
// 6:Go to the APIs & Services > Library page and enable the Maps JavaScript API
// 7:Go to the APIs & Services > Library page and enable the Places API
// 8:Go to the APIs & Services > Library page and enable the Geocoding API
// 9:Go to the APIs & Services > Library page and enable the Directions API

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
