import React, { useMemo } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { PLANETS } from './SolarSystem';

type PlanetMenuProps = {
    isPlanetMenuOpen: boolean;
    selectedPlanet: string | null;
    setIsPlanetMenuOpen: (value: React.SetStateAction<boolean>) => void;
    setSelectedPlanet: (value: React.SetStateAction<string | null>) => void;
};

const PlanetMenu = ({
    isPlanetMenuOpen,
    selectedPlanet,
    setIsPlanetMenuOpen,
    setSelectedPlanet,
}: PlanetMenuProps) => {
    // Memoize planets list for performance
    const planets = useMemo(() => PLANETS, []);

    // Handle toggling planet menu
    const handleToggleMenu = () => {
        setIsPlanetMenuOpen((prev) => !prev);

        if (isPlanetMenuOpen) {
            setSelectedPlanet(null);
        }
    };

    // Handle planet selection
    const handlePlanetSelect = (planetName: string) => {
        setSelectedPlanet(planetName);
    };

    return (
        <section aria-labelledby='planet-menu'>
            {selectedPlanet && (
                <div
                    aria-live='polite'
                    className='absolute left-5 top-5 rounded-lg bg-black bg-opacity-70 p-4 text-sm text-white'
                >
                    <h4>{selectedPlanet}</h4>
                    <p>{planets.find((planet) => planet.name === selectedPlanet)?.details}</p>
                </div>
            )}

            <div
                id='main-panel'
                className='absolute bottom-5 left-1/2 mb-4 flex -translate-x-1/2 transform flex-col items-center gap-5'
            >
                {/* Planet Menu Toggle Button */}
                <button
                    aria-label={`${isPlanetMenuOpen ? 'Close' : 'Open'} planet menu`}
                    aria-expanded={isPlanetMenuOpen}
                    className='rounded-full bg-slate-800/35 p-4 hover:bg-slate-800/50 focus:outline-none'
                    onClick={handleToggleMenu}
                >
                    {isPlanetMenuOpen ? <FaChevronDown size={15} /> : <FaChevronUp size={15} />}
                </button>

                {/* Planet Menu */}
                {isPlanetMenuOpen && (
                    <div role='menu' className='flex flex-wrap'>
                        {planets.map((planet) => (
                            <div
                                key={planet.name}
                                role='menuitem'
                                aria-label={`Select ${planet.name}`}
                                className={`flex min-w-24 cursor-pointer flex-col items-center justify-center gap-4 rounded bg-slate-800/30 p-4 ${selectedPlanet === planet.name ? 'bg-slate-800/80' : 'hover:bg-slate-800/50'}`}
                                onClick={() => handlePlanetSelect(planet.name)}
                            >
                                <img
                                    width={25}
                                    height={25}
                                    src={planet.icon}
                                    alt={`${planet.name} icon`}
                                    className='rounded-full'
                                />
                                <p>{planet.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PlanetMenu;
