import React from 'react';
import { SiMysql, SiPostgresql, SiMongodb } from 'react-icons/si';

import { FaReact, FaNode, FaCss3Alt } from 'react-icons/fa';
const stackIconsStyle = 'text-4xl transition duration-150 ease-linear hover:text-white/70';

const stackIcons = [
    {
        href: 'https://linkedin.com/in/dvir-cohen-0685a5245',
        title: 'React',
        icon: <FaReact className={stackIconsStyle} />,
    },
    {
        href: 'https://github.com/Dvir-Cohen1',
        title: 'Nodejs',
        icon: <FaNode className={stackIconsStyle} />,
    },
    {
        href: 'mailto:dvir906@gmail.com?subject = Feedback&body = Message',
        title: 'Css3',
        icon: <FaCss3Alt className={stackIconsStyle} />,
    },
    {
        href: 'https://wa.me/0524235513',
        title: 'Mysql',
        icon: <SiMysql className={stackIconsStyle} />,
    },
    {
        href: 'https://wa.me/0524235513',
        title: 'Postgresql',
        icon: <SiPostgresql className={stackIconsStyle} />,
    },
    {
        href: 'https://wa.me/0524235513',
        title: 'Mongodb',
        icon: <SiMongodb className={stackIconsStyle} />,
    },
];

export default stackIcons;
