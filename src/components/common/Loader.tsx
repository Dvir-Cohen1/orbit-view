import React from 'react';
import '@/styles/loader.css';
const Loader = () => {
    return (
        <section className='absolute top-0 right-0 flex flex-col gap-10 min-h-screen min-w-full place-items-center justify-center'>
            <div className='app-loader'></div>
        </section>
    );
};

export default Loader;
