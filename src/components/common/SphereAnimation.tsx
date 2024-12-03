'use client';
import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

interface SphereAnimationProps {
    // Add any props you want to pass to the component
}

const SphereAnimation: React.FC<SphereAnimationProps> = ({}) => {
    const sphereElRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const sphereEl = sphereElRef.current;
        if (!sphereEl) return;

        const spherePathEls = sphereEl.querySelectorAll('.sphere path');
        const pathLength = spherePathEls.length;
        const aimations: any[] = [];

        // Call fitElementToParent function (see below)

        const breathAnimation = anime({
            // ... animation configuration (see below)
        });

        const introAnimation = anime.timeline({
            // ... animation configuration (see below)
        });

        const shadowAnimation = anime({
            // ... animation configuration (see below)
        });

        const init = () => {
            introAnimation.play();
            breathAnimation.play();
            shadowAnimation.play();
        };

        init();

        // Cleanup function to remove animations on unmount
        return () => {
            aimations.forEach((animation) => animation.pause());
            breathAnimation.pause();
            introAnimation.pause();
            shadowAnimation.pause();
        };
    }, []);

    return (
        <div className='animation-wrapper'>
            <svg className='sphere' viewBox='0 0 440 440' stroke='rgba(80,80,80,.35)'>
                <defs>
                    <linearGradient id='sphereGradient' x1='5%' x2='5%' y1='0%' y2='15%'>
                        <stop stopColor='#373734' offset='0%' />
                        <stop stopColor='#242423' offset='50%' />
                        <stop stopColor='#0D0D0C' offset='100%' />
                    </linearGradient>
                </defs>
                {/* ... all the path elements from your original code */}
            </svg>
        </div>
    );
};

export default SphereAnimation;
