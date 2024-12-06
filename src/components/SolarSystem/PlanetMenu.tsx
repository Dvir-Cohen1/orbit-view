import React, { useMemo } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { PLANETS } from './SolarSystem';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

    // Find selected planet details
    const selectedPlanetDetails = planets.find((planet) => planet.name === selectedPlanet);

    return (
        <section aria-labelledby='planet-menu'>
            {selectedPlanet && selectedPlanetDetails && (
                <div
                    aria-live='polite'
                    className='absolute left-5 top-5 max-w-96 space-y-2 rounded-lg bg-slate-800/30 bg-opacity-70 p-4 text-sm text-white shadow shadow-slate-800/50'
                >
                    <div>
                        <h4 className='flex place-items-center gap-2'>
                            <span>
                                <img
                                    width={18}
                                    height={18}
                                    src={selectedPlanetDetails.icon}
                                    alt={`${selectedPlanetDetails.name} icon`}
                                    className='rounded-full'
                                />
                            </span>
                            {selectedPlanet}
                        </h4>
                        <p className='text-base'>{selectedPlanetDetails.details}</p>
                    </div>
                    <ul>
                        <li>
                            <strong>Speed:</strong> {selectedPlanetDetails.speed}
                        </li>
                        <li>
                            <strong>Distance:</strong> {selectedPlanetDetails.distance}
                        </li>
                        <li>
                            <strong>Radius:</strong> {selectedPlanetDetails.radius}
                        </li>
                    </ul>
                </div>
            )}

            <div
                id='main-panel'
                className='absolute bottom-5 left-1/2 mb-4 flex -translate-x-1/2 transform flex-col items-center gap-5'
            >
                {/* Planet Menu Toggle Button */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <button
                                aria-label={`${isPlanetMenuOpen ? 'Close' : 'Open'} planet menu`}
                                aria-expanded={isPlanetMenuOpen}
                                className='rounded bg-slate-800/35 p-3 hover:bg-slate-800/50 focus:outline-none'
                                onClick={handleToggleMenu}
                            >
                                {isPlanetMenuOpen ? (
                                    <FaChevronDown size={15} />
                                ) : (
                                    <FaChevronUp size={15} />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{`${isPlanetMenuOpen ? 'Close' : 'Open'} planet menu`}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Planet Menu */}
                {isPlanetMenuOpen && (
                    <div role='menu' className='flex flex-wrap'>
                        {planets.map((planet) => (
                            <div
                                key={planet.name}
                                role='menuitem'
                                aria-label={`Select ${planet.name}`}
                                className={`flex min-w-24 cursor-pointer flex-col items-center justify-center gap-4 rounded bg-slate-800/30 p-4 ${selectedPlanet === planet.name ? 'bg-slate-800/60' : 'hover:bg-slate-800/40'}`}
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
