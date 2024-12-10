import { PLANETS } from '@/constants/solarSystem.constants';
import React, { useMemo } from 'react';
import { FaCirclePause, FaCirclePlay, FaChevronDown, FaChevronUp } from "react-icons/fa6";

type PlanetMenuProps = {
    isPlanetMenuOpen: boolean;
    isCameraRotationEnabled: boolean;
    selectedPlanet: string | null;
    setIsPlanetMenuOpen: (value: React.SetStateAction<boolean>) => void;
    setSelectedPlanet: (value: React.SetStateAction<string | null>) => void;
    toggleCameraRotation: () => void;
};

const PlanetMenu = ({
    isPlanetMenuOpen,
    selectedPlanet,
    setIsPlanetMenuOpen,
    setSelectedPlanet,
    toggleCameraRotation,
    isCameraRotationEnabled
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
                    className='absolute left-5 top-5 max-w-96 space-y-2 rounded-lg bg-gray-900/30 bg-opacity-70 p-4 text-sm text-white shadow shadow-gray-900/50'
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
                <div>
                    <button
                        aria-label={`${isCameraRotationEnabled ? 'Pause' : 'Resume'} rotarion`}
                        className='bg-gray-900/35 p-3 hover:bg-gray-900/50 focus:outline-none'
                        onClick={toggleCameraRotation}
                    >
                        {isCameraRotationEnabled ? <FaCirclePause /> : <FaCirclePlay />}

                    </button>
                    <button
                        aria-label={`${isPlanetMenuOpen ? 'Close' : 'Open'} planet menu`}
                        aria-expanded={isPlanetMenuOpen}
                        className='bg-gray-900/35 p-3 hover:bg-gray-900/50 focus:outline-none'
                        onClick={handleToggleMenu}
                    >
                        {isPlanetMenuOpen ? <FaChevronDown size={15} /> : <FaChevronUp size={15} />}
                    </button>
                </div>

                {/* Planet Menu */}
                {isPlanetMenuOpen && (
                    <div role='menu' className='flex flex-wrap'>
                        {planets.map((planet) => (
                            <div
                                key={planet.name}
                                role='menuitem'
                                aria-label={`Select ${planet.name}`}
                                className={`flex min-w-24 cursor-pointer flex-col items-center justify-center gap-4 rounded bg-gray-900/30 p-4 ${selectedPlanet === planet.name ? 'bg-gray-900/60' : 'hover:bg-gray-800/40'}`}
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
