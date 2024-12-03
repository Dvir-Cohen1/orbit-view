import React from 'react';
import socialLinks from '../common/socialLinks';
import { FOOTER_LINKS } from '@/utils/constants';

const Footer = () => {
    return (
        <footer className='z-20 p-5 text-black dark:text-white'>
            <div className='relative my-5 flex justify-center space-x-8'>
                {socialLinks.map((item, index) => (
                    <a
                        target='_blank'
                        key={index}
                        href={item.href}
                        title={item.title}
                        aria-label={item.title}
                    >
                        {item.icon}
                    </a>
                ))}
            </div>
            <ul className='flex justify-center text-xs'>
                <li className='mx-2'>© 2024 DvirCohen.</li>
                {FOOTER_LINKS.map((link, index) => (
                    <li key={index} className='mx-2'>
                        <a
                            href={link.href}
                            data-analytics-event={link.analyticsEvent}
                            className='Link--secondary'
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </footer>
    );
};

export default Footer;
