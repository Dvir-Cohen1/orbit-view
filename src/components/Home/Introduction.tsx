'use client';
import React from 'react';
import TextShadow from '../common/TextShadow';
import InViewAnimation from '../common/InViewAnimation';
import SectionComponent from '../common/SectionComponent';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import Footer from '../Layout/Footer';

const Introduction: React.FC = () => {
    const router = useRouter();

    return (
        <InViewAnimation>
            <SectionComponent
                id='About'
                className='relative flex min-h-screen flex-col place-items-center justify-center'
            >
                <div className='z-10 mt-36 max-w-2xl space-y-6 text-center md:mt-0'>
                    <h1>
                        <TextShadow title='OrbitView' coloredTitle='.' />{' '}
                    </h1>
                    <h4 className=''>
                        Explore the cosmos, one <span className='text-[var(--blue)]'>orbit</span> at
                        a time.
                    </h4>
                    <p className='text-xl'>
                        A 3D solar system simulation built with React and Three.js, bringing the
                        wonders of space to your screen.
                    </p>

                    <div className='group relative inline-flex'>
                        <div className='animate-tilt absolute -inset-px mt-10 rounded-xl bg-gradient-to-r from-[#44BCFF] to-[#FF675E] opacity-70 blur-lg transition-all duration-1000 group-hover:-inset-1 group-hover:opacity-100 group-hover:duration-200'></div>
                        <Button
                            size={'lg'}
                            onClick={() => router.push('/solar-system')}
                            title='Start Exploring'
                            className='font-pj relative mt-10 inline-flex items-center justify-center rounded-xl bg-gray-900 px-8 py-7 text-lg font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2'
                            role='button'
                        >
                            🪐 Start Exploring
                        </Button>
                    </div>
                </div>
                <Footer />
            </SectionComponent>
        </InViewAnimation>
    );
};

export default Introduction;
