/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost', 'your-image-domain.com'], // Optional: Specify allowed image domains
        // loader: 'custom', // Use a custom loader to handle SVGs
        // Optional: Configure other image optimization options
    },
    //     webpack(config) {
    //         config.module.rules.push({
    //             test: /\.(png|jpe?g|svg)$/i,
    //             use: [
    //                 {
    //                     loader: 'next-image-loader',
    //                     options: {
    //                         // Pass your custom loader function here
    //                         loader: require.resolve('./loader'),
    //                     },
    //                 },
    //             ],
    //         });
    //         return config;
    //     },
};

export default nextConfig;
