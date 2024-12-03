import React from 'react';
import '@/styles/loader.css';
const Loader = () => {
    return (
        <section className='flex min-h-screen min-w-full place-items-center justify-center'>
            <span className='app-loader'></span>
        </section>
    );
};

export default Loader;
