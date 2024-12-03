import React from 'react';

type SectionTitleProps = {
    title: string;
    description?: string;
    secondDescription?: string;
};

const SectionTitle = ({
    title = 'Title',
    description,
    secondDescription,
    ...rest
}: SectionTitleProps) => {
    return (
        <header
            className='relative flex flex-col place-items-center text-center text-black dark:text-white md:mb-14'
            {...rest}
        >
            <h2 className='mb-4 text-[2.313rem] md:text-[4.313rem]'>{title}</h2>
            {description && <p className='text-center md:w-1/2'>{description}</p>}
            {secondDescription && <p>{secondDescription}</p>}
        </header>
    );
};

export default SectionTitle;
