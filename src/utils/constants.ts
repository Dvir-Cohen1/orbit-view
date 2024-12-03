
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
