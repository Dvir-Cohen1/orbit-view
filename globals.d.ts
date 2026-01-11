// globals.ts
export interface PlanetProps {
  name: string;

  radius: number;
  distance: number;

  speed: number;
  color?: string;
  texture?: string;

  realRadius?: number;          // km
  avgDistanceFromSun?: number;  // million km
  angle?: number;               // degrees (used as inclination)
  hasRings?: boolean;
}
