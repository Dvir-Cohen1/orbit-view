'use client';
import { motion, Variants } from 'framer-motion';

const variants: Variants = {
    initial: {
        scaleY: 0.5,
        opacity: 0,
    },
    animate: {
        scaleY: 1,
        opacity: 1,
        transition: {
            repeat: Infinity,
            repeatType: 'mirror',
            duration: 1,
            ease: 'circIn',
        },
    },
};

const BarLoader: React.FC = () => {
    return (
        <motion.div
            transition={{
                staggerChildren: 0.25,
            }}
            initial='initial'
            animate='animate'
            className='flex gap-1'
        >
            <Bar />
            <Bar />
            <Bar />
            <Bar />
            <Bar />
        </motion.div>
    );
};

const Bar: React.FC = () => {
    return <motion.div variants={variants} className='h-12 w-2 bg-white' />;
};

export default BarLoader;
