import React from 'react';
import '@/styles/codeTextAnimation.css';
const CodeTextAnimation = () => {
    return (
        <section className='code-animation-container'>
            <h1>
                console
                <span style={{ color: 'white' }}></span>.
                <span style={{ color: '#61afef' }}>log</span>("
            </h1>
            <div className='string'>
                <h1 className='greeting en'>Hello World!</h1>
                <h1 className='greeting es'>¡Hola Mundo!</h1>
                <h1 className='greeting de'>Hallo Welt!</h1>
                <h1 className='greeting it'>Ciao Mondo!</h1>
            </div>
            <h1 className='closure'>");</h1>
        </section>
    );
};

export default CodeTextAnimation;
