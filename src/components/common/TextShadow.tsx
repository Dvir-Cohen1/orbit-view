'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type TTextShadowProps = {
    title?: string;
    coloredTitle?: string;
    shadowColor?: 'orange' | 'blue' | 'green' | 'pink' | 'red';
};

// Wrap with React.Suspense and React.useClient() for Next.js client-side rendering
const TextShadow = React.memo(
    ({ title = 'title', coloredTitle = '.', shadowColor = 'blue' }: TTextShadowProps) => {
        const [x, setX] = useState(-8); // Initial x coordinate
        const [y, setY] = useState(-8); // Initial y coordinate

        useEffect(() => {
            const updateShadow = (event: MouseEvent) => {
                const range = 16;
                const newX = Math.round((event.pageX * range) / window.innerWidth) - range / 2;
                const newY = Math.round((event.pageY * range) / window.innerHeight) - range / 2;

                setX(newX);
                setY(newY);
            };

            window.addEventListener('mousemove', updateShadow);

            return () => window.removeEventListener('mousemove', updateShadow);
        }, []); // Empty dependency array ensures effect runs only once

        return (
            <motion.div
                id='text'
                initial={{
                    textShadow: `${-x}px ${-y}px 100px var(--${shadowColor}),${-2 * x}px ${-2 * y}px 300px var(--${shadowColor}),
                   ${-4 * x}px ${-4 * y}px 250px var(--${shadowColor})`,
                }}
                layout
                animate={{
                    textShadow: `${-x}px ${-y}px 100px var(--${shadowColor}),${-2 * x}px ${-2 * y}px 300px var(--${shadowColor}),
                     ${-4 * x}px ${-4 * y}px 550px var(--${shadowColor})`,
                }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
            >
                <div className='flex justify-center'>
                    <h1 className='text-primary-text'>{title}</h1>
                    <span className={`text-[var(--${shadowColor})]`}>{coloredTitle}</span>
                </div>
            </motion.div>
        );
    }
);

export default TextShadow;
