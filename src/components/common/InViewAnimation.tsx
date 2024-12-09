import { motion } from 'framer-motion';

interface Props {
    children: React.ReactNode;
}

const OpacityAnimationComponent: React.FC<Props> = ({ children, ...rest }) => {
    const container = {
        hidden: { opacity: 0, translateY: -160 },
        show: {
            translateY: 0,
            opacity: 1,
            transition: {
                delayChildren: 0,
                // staggerDirection: -1,
                ease: 'linear',
                duration: 0.6,
                delay: 10,
            },
        },
    };
    return (
        <motion.div
            {...rest}
            // variants={container}
            animate='show'
            initial={{ opacity: 0, translateY: -25 }}
            whileInView={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            // className='my-12'
        >
            {children}
        </motion.div>
    );
};

export default OpacityAnimationComponent;
