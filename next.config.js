/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable file system watching for problematic directories
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Exclude problematic Windows directories
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Exclude Windows system directories that cause permission issues
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/C:/Users/*/Application Data/**',
        '**/C:/Users/*/AppData/**',
        '**/C:/Windows/**',
        '**/C:/Program Files/**',
        '**/C:/Program Files (x86)/**',
        '**/C:/Users/User/Application Data/**',
        '**/Application Data/**',
      ],
    };

    // Additional exclusions for build process
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };
    
    return config;
  },
  
  // Optimize for development with Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Disable source maps in development to speed up builds
  productionBrowserSourceMaps: false,

  // Disable ESLint during builds to avoid deployment issues
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
