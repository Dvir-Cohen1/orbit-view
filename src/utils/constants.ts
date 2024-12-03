
// Mobile Menu
export const ANIMATED_HAMBURGER_BUTTON_VARIANTS = {
    top: {
        open: {
            rotate: ['0deg', '0deg', '45deg'],
            top: ['35%', '50%', '50%'],
        },
        closed: {
            rotate: ['45deg', '0deg', '0deg'],
            top: ['50%', '50%', '35%'],
        },
    },
    middle: {
        open: {
            rotate: ['0deg', '0deg', '-45deg'],
        },
        closed: {
            rotate: ['-45deg', '0deg', '0deg'],
        },
    },
    bottom: {
        open: {
            rotate: ['0deg', '0deg', '45deg'],
            bottom: ['35%', '50%', '50%'],
            left: '50%',
        },
        closed: {
            rotate: ['45deg', '0deg', '0deg'],
            bottom: ['50%', '50%', '35%'],
            left: 'calc(50% + 10px)',
        },
    },
};


export const APP_METADATA = {
    title: 'OrbitView - Explore the Cosmos in 3D with React & Three.js',
    description: "Explore the cosmos in 3D with OrbitView, a solar system simulation built with React and Three.js. Learn, interact, and immerse yourself in the wonders of space.",
    keywords: ['react', 'threejs', 'space exploration', 'solar system simulation', '3D space app', 'cosmos', 'orbit view'],
    twitter: {
        card: 'summary_large_image',
        title: 'OrbitView - Explore the Cosmos',
        description: 'Explore the 3D solar system simulation with React and Three.js.',
        images: ['/images/twitter-image.jpg'],
    },
    openGraph: {
        title: 'OrbitView - Explore the Cosmos',
        description: 'A 3D solar system simulation built with React and Three.js, bringing space exploration to your fingertips.',
        url: 'https://www.orbitview.com',
        siteName: 'OrbitView',
        images: [
            {
                url: '/images/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'OrbitView - Explore the Cosmos',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
    },
    alternates: {
        canonical: 'https://www.orbitview.com',
    },
    viewport: 'width=device-width, initial-scale=1',
}