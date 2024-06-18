/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: '',
            },
        ],
        unoptimized: true,
    },
    transpilePackages: ['components', 'shared', 'shiki'],
};

export default nextConfig;
