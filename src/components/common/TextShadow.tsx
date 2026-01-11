// TextShadow.tsx
'use client';

import React, { useEffect } from 'react';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
} from 'framer-motion';

type TTextShadowProps = {
    title?: string;
    coloredTitle?: string;
    shadowColor?: 'orange' | 'blue' | 'green' | 'pink' | 'red';
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const TextShadow = React.memo(
    ({ title = 'title', coloredTitle = '.', shadowColor = 'blue' }: TTextShadowProps) => {
        const mx = useMotionValue(0);
        const my = useMotionValue(0);

        // smooth mouse motion
        const x = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.6 });
        const y = useSpring(my, { stiffness: 180, damping: 22, mass: 0.6 });

        // ✅ precompute scaled motion values (so TS is happy)
        const xNeg = useTransform(x, (v) => -v);
        const yNeg = useTransform(y, (v) => -v);

        const x2 = useTransform(x, (v) => -2 * v);
        const y2 = useTransform(y, (v) => -2 * v);

        const x4 = useTransform(x, (v) => -4 * v);
        const y4 = useTransform(y, (v) => -4 * v);

        useEffect(() => {
            let raf: number | null = null;

            const onMove = (e: MouseEvent) => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    raf = null;

                    const range = 16;
                    const nx = (e.clientX / window.innerWidth) * range - range / 2;
                    const ny = (e.clientY / window.innerHeight) * range - range / 2;

                    mx.set(clamp(nx, -range / 2, range / 2));
                    my.set(clamp(ny, -range / 2, range / 2));
                });
            };

            window.addEventListener('mousemove', onMove, { passive: true });
            return () => {
                window.removeEventListener('mousemove', onMove);
                if (raf) cancelAnimationFrame(raf);
            };
        }, [mx, my]);

        const colorVar = `var(--${shadowColor})`;

        // ✅ useMotionTemplate can mix motion values + strings safely
        const textShadow = useMotionTemplate`
      ${xNeg}px ${yNeg}px 100px ${colorVar},
      ${x2}px ${y2}px 300px ${colorVar},
      ${x4}px ${y4}px 550px ${colorVar}
    `;

        return (
            <motion.div style={{ textShadow }}>
                <div className="flex justify-center">
                    <h1 className="text-primary-text">{title}</h1>
                    <span className={`text-[var(--${shadowColor})]`}>{coloredTitle}</span>
                </div>
            </motion.div>
        );
    }
);

export default TextShadow;
