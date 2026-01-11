// PlanetMenu.tsx
import { PLANETS } from '@/constants/solarSystem.constants';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import {
  FaCirclePause,
  FaCirclePlay,
  FaChevronDown,
  FaChevronUp,
  FaArrowRotateLeft,
} from 'react-icons/fa6';

type FocusTarget =
  | { type: 'sun' }
  | { type: 'planet'; name: string }
  | null;

type PlanetMenuProps = {
  isPlanetMenuOpen: boolean;
  isCameraRotationEnabled: boolean;
  selectedPlanet: string | null;
  focusedTarget: FocusTarget;

  setIsPlanetMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedPlanet: React.Dispatch<React.SetStateAction<string | null>>;
  setFocusedTarget: React.Dispatch<React.SetStateAction<FocusTarget>>;

  toggleCameraRotation: () => void;
};

const PlanetMenu = ({
  isPlanetMenuOpen,
  selectedPlanet,
  focusedTarget,
  setIsPlanetMenuOpen,
  setSelectedPlanet,
  setFocusedTarget,
  toggleCameraRotation,
  isCameraRotationEnabled,
}: PlanetMenuProps) => {
  const router = useRouter();
  const planets = useMemo(() => PLANETS, []);

  const handleToggleMenu = () => setIsPlanetMenuOpen((prev) => !prev);

  const focusSun = () => {
    setSelectedPlanet(null);
    setFocusedTarget({ type: 'sun' });
  };

  const handlePlanetSelect = (planetName: string) => {
    setSelectedPlanet(planetName);
    setFocusedTarget({ type: 'planet', name: planetName });
  };

  const selectedPlanetDetails = planets.find((p) => p.name === selectedPlanet);

  const isFollowingSun = focusedTarget?.type === 'sun';

  return (
    <section aria-labelledby="planet-menu">
      {selectedPlanet && selectedPlanetDetails && (
        <div
          aria-live="polite"
          className="absolute left-5 top-5 max-w-96 space-y-2 rounded-lg bg-gray-900/30 bg-opacity-70 p-4 text-sm text-white shadow shadow-gray-900/50"
        >
          <div>
            <h4 className="flex place-items-center gap-2">
              <img
                width={18}
                height={18}
                src={selectedPlanetDetails.icon}
                alt={`${selectedPlanetDetails.name} icon`}
                className="rounded-full"
                loading="lazy"
              />
              {selectedPlanetDetails.name}
            </h4>
            <p className="text-sm">{selectedPlanetDetails.details}</p>
          </div>
          <ul>
            <li>
              <strong>Radius:</strong> {selectedPlanetDetails.realRadius}km
            </li>
            <li>
              <strong>Avg Distance From Sun:</strong>{' '}
              {selectedPlanetDetails.avgDistanceFromSun}M KM
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
        id="main-panel"
        className="absolute bottom-5 left-1/2 mb-4 flex -translate-x-1/2 transform flex-col items-center gap-5"
      >
        <div>
          <button
            aria-label="Back home"
            className="rounded-bl rounded-tl bg-gray-900/35 p-3 hover:bg-gray-900/50 focus:outline-none"
            onClick={() => router.push('/')}
          >
            <FaArrowRotateLeft />
          </button>

          <button
            aria-label={`${isCameraRotationEnabled ? 'Pause' : 'Resume'} rotation`}
            className="bg-gray-900/35 p-3 hover:bg-gray-900/50 focus:outline-none"
            onClick={toggleCameraRotation}
          >
            {isCameraRotationEnabled ? <FaCirclePause /> : <FaCirclePlay />}
          </button>

          <button
            aria-label={`${isPlanetMenuOpen ? 'Close' : 'Open'} planet menu`}
            aria-expanded={isPlanetMenuOpen}
            className="rounded-br rounded-tr bg-gray-900/35 p-3 hover:bg-gray-900/50 focus:outline-none"
            onClick={handleToggleMenu}
          >
            {isPlanetMenuOpen ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>

        {isPlanetMenuOpen && (
          <div role="menu" className="flex flex-wrap">
            {/* ✅ Sun focus item */}
            <div
              role="menuitem"
              aria-label="Focus Sun"
              className={[
                'flex min-w-24 cursor-pointer flex-col items-center justify-center gap-4 bg-gray-900/30 p-4',
                isFollowingSun ? 'bg-gray-900/70' : 'hover:bg-gray-800/40',
              ].join(' ')}
              onClick={focusSun}
            >
              <div className="h-[25px] w-[25px] rounded-full bg-yellow-200/90" />
              <p className="text-xs">Sun</p>
            </div>

            {planets.map((planet, index) => {
              const isFocused =
                focusedTarget?.type === 'planet' && focusedTarget.name === planet.name;

              // +1 because Sun is added as first item
              const realIndex = index + 1;
              const totalItems = planets.length + 1;

              return (
                <div
                  key={planet.name}
                  role="menuitem"
                  aria-label={`Select ${planet.name}`}
                  className={[
                    'flex min-w-24 cursor-pointer flex-col items-center justify-center gap-4 bg-gray-900/30 p-4',
                    realIndex === 0 ? 'rounded-bl rounded-tl' : '',
                    realIndex === totalItems - 1 ? 'rounded-br rounded-tr' : '',
                    isFocused ? 'bg-gray-900/70' : 'hover:bg-gray-800/40',
                  ].join(' ')}
                  onClick={() => handlePlanetSelect(planet.name)}
                >
                  <img
                    width={25}
                    height={25}
                    src={planet.icon}
                    alt={`${planet.name} icon`}
                    className="rounded-full"
                  />
                  <p className="text-xs">{planet.name}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PlanetMenu;
