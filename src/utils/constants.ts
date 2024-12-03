import {
    IntroductionButton,
} from '../../globals';

// App Navigation Links
// export const SECTION_CATEGORIES = [
//     { title: 'About', href: '#About' },
//     { title: 'Projects', href: '#Projects' },
//     { title: 'Services', href: '#Services' },
//     { title: 'Contact', href: '#Contact' },
//     { title: 'MyStack', href: '#MyStack' },
// ];

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


export const FOOTER_LINKS = [
    {
        label: 'Terms',
        href: 'https://docs.github.com/site-policy/github-terms/github-terms-of-service',
        analyticsEvent: '{"category":"Footer","action":"go to terms","label":"text:terms"}',
    },
    {
        label: 'Privacy',
        href: 'https://docs.github.com/site-policy/privacy-policies/github-privacy-statement',
        analyticsEvent: '{"category":"Footer","action":"go to privacy","label":"text:privacy"}',
    },
    {
        label: 'Sitemap',
        href: '/sitemap',
        analyticsEvent: '{"category":"Footer","action":"go to sitemap","label":"text:sitemap"}',
    },
];