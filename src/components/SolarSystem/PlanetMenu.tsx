import { PLANETS } from '@/constants/solarSystem.constants';
import { useNavigation } from '@/context/NavigationContext';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { FaCirclePause, FaCirclePlay, FaChevronDown, FaChevronUp, FaArrowRotateLeft } from "react-icons/fa6";
import * as THREE from 'three';

type PlanetMenuProps = {
    isPlanetMenuOpen: boolean;
    isCameraRotationEnabled: boolean;
    selectedPlanet: string | null;
    setIsPlanetMenuOpen: (value: React.SetStateAction<boolean>) => void;
    setSelectedPlanet: (value: React.SetStateAction<string | null>) => void;
    toggleCameraRotation: () => void;
    setFocusPosition: (position: THREE.Vector3 | null) => void; // New prop
};

const PlanetMenu = ({
    isPlanetMenuOpen,
    selectedPlanet,
    setIsPlanetMenuOpen,
    setSelectedPlanet,
    toggleCameraRotation,
    isCameraRotationEnabled,
    setFocusPosition, // Receiving new prop here
}: PlanetMenuProps) => {

    const router = useRouter()

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
        // Find the planet and set the camera focus position
        const planet = planets.find(p => p.name === planetName);
        if (planet) {
            // Calculate the planet's position based on its distance (simple assumption here)
            setFocusPosition(new THREE.Vector3(planet.distance, 0, 0)); // Use this as a rough focus point
        }
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
                            <img
                                width={18}
                                height={18}
                                src={selectedPlanetDetails.icon}
                                alt={`${selectedPlanetDetails.name} icon`}
                                className='rounded-full'
                                loading='lazy'
                            />
                            {selectedPlanet}
                        </h4>
                        <p className='text-sm'>{selectedPlanetDetails.details}</p>
                    </div>
                    <ul>
                        <li>
                            <strong>Radius:</strong> {selectedPlanetDetails.realRadius}km
                        </li>
                        <li>
                            <strong>Avg Distance From Sun:</strong> {selectedPlanetDetails.avgDistanceFromSun}M KM
                        </li>
                        <li>
                            <strong>Angle:</strong> {selectedPlanetDetails.angle} Degrees
                        </li>
                        <li>
                            <strong>Velocity:</strong> {selectedPlanetDetails.velocity} km/s
                        </li>
                        <li>
                            <strong>Mass:</strong> {selectedPlanetDetails.realMass} km/s
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
                        aria-label='Back home'
                        className='bg-gray-900/35 rounded-bl rounded-tl p-3 hover:bg-gray-900/50 focus:outline-none'
                        onClick={() => router.push('/')}
                    >
                        <FaArrowRotateLeft />
                    </button>
                    <button
                        aria-label={`${isCameraRotationEnabled ? 'Pause' : 'Resume'} rotation`}
                        className='bg-gray-900/35 p-3 hover:bg-gray-900/50 focus:outline-none'
                        onClick={toggleCameraRotation}
                    >
                        {isCameraRotationEnabled ? <FaCirclePause /> : <FaCirclePlay />}
                    </button>
                    <button
                        aria-label={`${isPlanetMenuOpen ? 'Close' : 'Open'} planet menu`}
                        aria-expanded={isPlanetMenuOpen}
                        className='bg-gray-900/35 rounded-br rounded-tr  p-3 hover:bg-gray-900/50 focus:outline-none'
                        onClick={handleToggleMenu}
                    >
                        {isPlanetMenuOpen ? <FaChevronDown /> : <FaChevronUp />}
                    </button>
                </div>

                {/* Planet Menu */}
                {isPlanetMenuOpen && (
                    <div role='menu' className='flex flex-wrap'>
                        {planets.map((planet, index) => (
                            <div
                                key={planet.name}
                                role='menuitem'
                                aria-label={`Select ${planet.name}`}
                                className={`flex min-w-24 cursor-pointer flex-col items-center justify-center gap-4 ${index === 0 && 'rounded-bl rounded-tl'} ${index === planets.length - 1 && 'rounded-br rounded-tr'} bg-gray-900/30 p-4 ${selectedPlanet === planet.name ? 'bg-gray-900/60' : 'hover:bg-gray-800/40'}`}
                                onClick={() => handlePlanetSelect(planet.name)}
                            >
                                <img
                                    width={25}
                                    height={25}
                                    src={planet.icon}
                                    alt={`${planet.name} icon`}
                                    className='rounded-full'
                                />
                                <p className='text-xs'>{planet.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PlanetMenu;
