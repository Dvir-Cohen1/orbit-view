'use client'
import React from 'react';
import TextShadow from '../common/TextShadow';
import InViewAnimation from '../common/InViewAnimation';
import SectionComponent from '../common/SectionComponent';
import WaterDropGrid from '../common/WaterDropGrid';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import TiltCard from '../common/TiltCard';

const Introduction: React.FC = () => {
    const router = useRouter()

    return (
        <InViewAnimation>
            <SectionComponent
                id='About'
                className='relative flex justify-center min-h-screen place-items-center'
            >
                <div className='max-w-2xl space-y-6 text-center z-10 mt-36 md:mt-0'>
                    <h1><TextShadow title="OrbitView" coloredTitle='.' /> </h1>
                    <h4 className=''>Explore the cosmos, one <span className='text-[var(--blue)]'>orbit</span> at a time.</h4>
                    <p className='text-xl'>
                        A 3D solar system simulation built with React and Three.js, bringing the wonders of space to your screen.
                    </p>

                    <div className="relative inline-flex group">
                        <div
                            className="absolute mt-10 transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] to-[#FF675E] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"
                        ></div>
                        <Button
                            size={'lg'}
                            onClick={() => router.push('/scene')}
                            title="Start Exploring"
                            className="relative mt-10 inline-flex items-center justify-center px-8 py-7 text-lg font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                            role="button"
                        >
                            🪐 Start Exploring
                        </Button>
                    </div>

                </div>

                {/* <div className='hidden md:block absolute'>
                    <WaterDropGrid />
                </div> */}
            </SectionComponent>
        </InViewAnimation>
    );
};

export default Introduction;
