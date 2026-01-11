import React, { ReactNode } from 'react';

type TSectionComponentProps = {
    children: ReactNode;
    id?: string;
    className?: string;
};

const SectionComponent = ({ children, id, className = '', ...rest }: TSectionComponentProps) => {
    return (
        <section
            {...rest}
            id={id}
            className={`m-auto space-y-4 px-5  md:space-y-16 md:px-0 ${className}`}
        >
            {children}
        </section>
    );
};

export default SectionComponent;
