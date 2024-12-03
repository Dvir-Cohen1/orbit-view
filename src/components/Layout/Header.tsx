'use client';
import React, { useState } from 'react';
import SliderToggle from '../common/ThemeModeSlider';
import MobileMenu from './MobileMenu';

const Header = () => {
    return (
        <header className='hidden relative z-50 md:flex place-items-center justify-between px-3 py-2 md:px-8 md:py-8'>
            {/* <SliderToggle /> */}
            <MobileMenu />
        </header>
    );
};

export default Header;
