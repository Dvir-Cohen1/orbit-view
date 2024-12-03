import React from 'react';
import { FaLinkedin, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';

const socialLinksIconStyle = 'text-lg transition duration-150 ease-linear hover:text-white/70';
const socialLinks = [
    {
        href: 'https://linkedin.com/in/dvir-cohen-0685a5245',
        title: 'Go to my LinkedIn page',
        icon: <FaLinkedin className={socialLinksIconStyle} />,
    },
    {
        href: 'https://github.com/Dvir-Cohen1',
        title: 'Go to my GitHub page',
        icon: <FaGithub className={socialLinksIconStyle} />,
    },
    {
        href: 'mailto:dvir906@gmail.com?subject = Feedback&body = Message',
        title: 'Send email via Gmail',
        icon: <SiGmail className={socialLinksIconStyle} />,
    },
    {
        href: 'https://wa.me/0524235513',
        title: 'Send message via Whatsapp',
        icon: <FaWhatsapp className={socialLinksIconStyle} />,
    },
];

export default socialLinks;
