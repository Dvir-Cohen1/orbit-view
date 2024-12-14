import React from 'react';
import socialLinks from '../common/socialLinks';

const Footer = () => {
    return (
        <footer className='z-20 p-5 text-black dark:text-white'>
            <ul className='flex place-items-center justify-center text-xs'>
                <li className='mx-2'>© 2024 DvirCohen •</li>
                <li className='flex gap-4'>
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
                </li>
            </ul>
        </footer>
    );
};

export default Footer;
