import type { NextConfig } from 'next'


const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: ["packages"],
    experimental: {
            // turbo configuration has been removed as it's not a valid property
            // in the ExperimentalConfig type
        },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "@packages": require("path").resolve(__dirname, "../../packages"),
        };
        return config;
    },
};

export default nextConfig;
