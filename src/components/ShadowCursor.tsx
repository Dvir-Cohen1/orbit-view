'use client';
import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

import useMousePosition from '@/hooks/useMousePosition';
const ShadowCursor = () => {
    const [isHovered, setIsHovered] = useState(false);
    const { x, y }: any = useMousePosition();
    const size = 400;
    return (
        <motion.div
            className={'mask'}
            animate={{
                WebkitMaskPosition: `${x - size / 1}px ${y - size / 1.8}px`,

                WebkitMaskSize: `100px`,
            }}
            transition={{ type: 'tween', ease: 'backOut', duration: 0.2 }}
        >
            <p
                onMouseEnter={() => {
                    setIsHovered(true);
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                }}
            >
                {/* {children} */}
            </p>
        </motion.div>
    );
};

export default ShadowCursor;
