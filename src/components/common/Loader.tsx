import React from 'react';
import '@/styles/loader.css';
const Loader = () => {
    return (
        <section className='absolute right-0 top-0 flex min-h-screen min-w-full flex-col place-items-center justify-center gap-10'>
            <div className='app-loader'></div>
        </section>
    );
};

export default Loader;
