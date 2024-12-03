'use client'
import React from 'react';
import TextShadow from '../common/TextShadow';
import InViewAnimation from '../common/InViewAnimation';
import Link from 'next/link';
import socialLinks from '../common/socialLinks';
import SectionComponent from '../common/SectionComponent';
import WaterDropGrid from '../common/WaterDropGrid';

const Introduction: React.FC = () => {
    return (
        <InViewAnimation>
            <SectionComponent
                id='About'
                className='relative md:flex justify-center place-items-center'
            >
                <div className='max-w-xl space-y-6 text-center md:text-start'>
                    <h1><TextShadow title="OrbitView" coloredTitle='.' /> </h1>
                    <h4>Explore the cosmos, one <span className='text-[var(--blue)]'>orbit</span> at a time.</h4>
                    <p className='text-xl'>
                        A 3D solar system simulation built with React and Three.js, bringing the wonders of space to your screen.
                    </p>

                    <Link
                        href='/scene'
                        className={`mt-4 w-fit rounded text-white bg-[var(--blue)] px-7 py-2 text-sm shadow-[3px_3px_0px_black] shadow-[#cee0fb] dark:shadow-[#2b3b53] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none md:mt-2`}
                    >
                        Start Exploring
                    </Link>

                    <div className='flex flex-wrap justify-center space-x-8 md:justify-start'>
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
                    </div>
                </div>
                <div className='hidden md:block'>
                    <WaterDropGrid />
                </div>
            </SectionComponent>
        </InViewAnimation>
    );
};

export default Introduction;
