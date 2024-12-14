'use client';
import React from 'react';
import MobileMenu from './MobileMenu';

const Header = () => {
    return (
        <header className='relative z-50 place-items-center justify-between px-3 py-2 md:flex md:px-8 md:py-8'>
            <MobileMenu />
        </header>
    );
};

export default Header;
