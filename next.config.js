const million = require('million/compiler');

/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: {
        allowedOrigins: ['192.168.1.6', '192.168.56.1']
    },
    reactStrictMode: true,
}

module.exports = million.next(nextConfig, { 
    auto: true,
    mute: false
})
