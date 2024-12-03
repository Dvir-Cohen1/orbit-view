import React, { useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import SliderToggle from '../common/ThemeModeSlider';
import Link from 'next/link';
import { ANIMATED_HAMBURGER_BUTTON_VARIANTS } from '@/utils/constants';
import { useNavigation } from '@/context/NavigationContext';
const MobileMenu = () => {
    const [active, setActive] = useState(false);
    const { selectedLink, updateSelectedLink } = useNavigation();

    const handleLinkClick = (link: string) => {
        setActive((pv) => !pv);
        updateSelectedLink(link);
    };
    return (
        <nav className='block md:hidden'>
            <MotionConfig
                transition={{
                    duration: 0.5,
                    ease: 'easeInOut',
                }}
            >
                <motion.button
                    initial={false}
                    animate={active ? 'open' : 'closed'}
                    onClick={() => setActive((pv) => !pv)}
                    className='relative z-40 h-16 w-16 rounded-full bg-white/0 transition-colors hover:bg-white/20'
                >
                    <motion.span
                        variants={ANIMATED_HAMBURGER_BUTTON_VARIANTS.top}
                        className='absolute h-[0.1rem] w-8 bg-white'
                        style={{ y: '-50%', left: '50%', x: '-50%', top: '35%' }}
                    />
                    <motion.span
                        variants={ANIMATED_HAMBURGER_BUTTON_VARIANTS.middle}
                        className='absolute h-[0.1rem] w-8 bg-white'
                        style={{ left: '50%', x: '-50%', top: '50%', y: '-50%' }}
                    />
                    <motion.span
                        variants={ANIMATED_HAMBURGER_BUTTON_VARIANTS.bottom}
                        className='absolute h-[0.1rem] w-3 bg-white'
                        style={{
                            x: '-50%',
                            y: '50%',
                            bottom: '35%',
                            left: 'calc(50% + 10px)',
                        }}
                    />
                </motion.button>

                {active && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0' }}
                        // transition={{ type: 'spring', duration: 0.5 }}
                        transition={{
                            type: 'spring',
                            ease: 'linear',
                            duration: 1,
                            x: { duration: 1 },
                        }}
                        className='absolute bottom-0 left-0 right-0 top-0 z-30 flex min-h-screen w-full flex-col place-items-center justify-center bg-[var(--main-bg)]'
                    >
                        About
                    </motion.div>
                )}
            </MotionConfig>
        </nav>
    );
};

export default MobileMenu;
