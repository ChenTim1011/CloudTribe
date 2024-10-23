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

// next.config.mjs
export default async (phase) => {
  const { PHASE_DEVELOPMENT_SERVER } = await import("next/constants.js");
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,

    // 設置 Google Map API 環境變量
    env: {
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      NEXT_PUBLIC_MAP_ID: process.env.NEXT_PUBLIC_MAP_ID,
    },


    images: {
      remotePatterns: [
        {
          protocol: 'https', // 協議，例如 http 或 https
          hostname: 'online.carrefour.com.tw', // 主機名
          port: '', // 可選，若有特定的端口號（通常為空）
          pathname: '/**', // 路徑匹配，可以使用 ** 通配符來匹配所有路徑
        },
      ],
    },

    // API 路徑重寫
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: isDev
            ? "http://localhost:8000/api/:path*" // 開發環境 API
            : "https://www.cloudtribe.online/api/:path*", // 生產環境 API
        },
      ];
    },
  };
};
