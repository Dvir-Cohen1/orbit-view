export const PLANETS = [
    {
        name: 'Mercury',
        radius: 0.5, // visualization radius
        realRadius: 2439.7, // real radius in km
        distance: 60,
        avgDistanceFromSun: 57.9, // in million km
        speed: 1,
        velocity: 47.87, // km/s
        angle: 7, // degrees
        realMass: 3.3011e23, // kg
        color: 'gray',
        details: 'The smallest and fastest planet in our solar system, closest to the Sun.',
        icon: '/planets/mercury.png',
    },
    {
        name: 'Venus',
        radius: 0.9, // visualization radius
        realRadius: 6051.8, // real radius in km
        distance: 80,
        avgDistanceFromSun: 108.2, // in million km
        speed: 0.5,
        velocity: 35.02, // km/s
        angle: 3.39, // degrees
        realMass: 4.8675e24, // kg
        color: 'orange',
        details: 'The second planet from the Sun, known for its extreme heat and thick atmosphere.',
        icon: '/planets/venus.png',
    },
    {
        name: 'Earth',
        radius: 1, // visualization radius
        realRadius: 6371, // real radius in km
        distance: 100,
        avgDistanceFromSun: 149.6, // in million km
        speed: 0.3,
        velocity: 29.78, // km/s
        angle: 0, // degrees
        realMass: 5.97237e24, // kg
        color: 'blue',
        details: 'Our home planet, the only known planet to support life.',
        icon: '/planets/earth.png',
    },
    {
        name: 'Mars',
        radius: 0.8, // visualization radius
        realRadius: 3389.5, // real radius in km
        distance: 130,
        avgDistanceFromSun: 227.9, // in million km
        speed: 0.25,
        velocity: 24.07, // km/s
        angle: 1.85, // degrees
        realMass: 6.4171e23, // kg
        color: 'red',
        details: 'The Red Planet, known for its iron oxide-rich soil.',
        icon: '/planets/mars.png',
    },
    {
        name: 'Jupiter',
        radius: 4, // visualization radius
        realRadius: 69911, // real radius in km
        distance: 150,
        avgDistanceFromSun: 778.5, // in million km
        speed: 0.1,
        velocity: 13.07, // km/s
        angle: 1.31, // degrees
        realMass: 1.8982e27, // kg
        details: 'The largest planet in our solar system, a gas giant with a Great Red Spot.',
        icon: '/planets/jupiter.png',
    },
    {
        name: 'Saturn',
        radius: 3.5, // visualization radius
        realRadius: 58232, // real radius in km
        distance: 200,
        avgDistanceFromSun: 1434, // in million km
        speed: 0.09,
        velocity: 9.69, // km/s
        angle: 2.49, // degrees
        realMass: 5.6834e26, // kg
        color: 'goldenrod',
        hasRings: true,
        details: 'Known for its prominent ring system, Saturn is the second-largest planet.',
        icon: '/planets/saturn.png',
    },
    {
        name: 'Uranus',
        radius: 3, // visualization radius
        realRadius: 25362, // real radius in km
        distance: 250,
        avgDistanceFromSun: 2871, // in million km
        speed: 0.08,
        velocity: 6.81, // km/s
        angle: 0.77, // degrees
        realMass: 8.681e25, // kg
        color: 'lightblue',
        details: 'The planet with a unique sideways rotation and faint ring system.',
        icon: '/planets/uranus.png',
    },
    {
        name: 'Neptune',
        radius: 3, // visualization radius
        realRadius: 24622, // real radius in km
        distance: 300,
        avgDistanceFromSun: 4497, // in million km
        speed: 0.07,
        velocity: 5.43, // km/s
        angle: 1.77, // degrees
        realMass: 1.02413e26, // kg
        color: 'blue',
        details: 'The most distant planet from the Sun, known for its deep blue color.',
        icon: '/planets/neptune.png',
    },
    {
        name: 'Pluto',
        radius: 0.4, // visualization radius
        realRadius: 1188.3, // real radius in km
        distance: 350,
        avgDistanceFromSun: 5906, // in million km
        speed: 0.05,
        velocity: 4.74, // km/s
        angle: 17.16, // degrees
        realMass: 1.303e22, // kg
        color: 'white',
        details: 'Once considered the ninth planet, Pluto is now classified as a dwarf planet.',
        icon: '/planets/pluto.png',
    },
];
