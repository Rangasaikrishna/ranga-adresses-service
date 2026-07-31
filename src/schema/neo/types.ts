export type NearEarthObject = {
  id: string | null;
  name: string | null;
  isPotentiallyHazardousAsteroid: boolean | null;
  estimatedDiameterMinKm: number | null;
  estimatedDiameterMaxKm: number | null;
  closeApproachDate: string | null;
  relativeVelocityKph: string | null;
  missDistanceKm: string | null;
};

export type NearEarthObjectFeed = {
  elementCount: number | null;
  objects: NearEarthObject[];
};

export type NearEarthObjectsArgs = {
  startDate: string;
  endDate: string;
};

export type NasaNearEarthObject = {
  id?: string | null;
  name?: string | null;
  is_potentially_hazardous_asteroid?: boolean | null;
  estimated_diameter?: {
    kilometers?: {
      estimated_diameter_min?: number | null;
      estimated_diameter_max?: number | null;
    } | null;
  } | null;
  close_approach_data?: Array<{
    close_approach_date?: string | null;
    relative_velocity?: {
      kilometers_per_hour?: string | null;
    } | null;
    miss_distance?: {
      kilometers?: string | null;
    } | null;
  } | null> | null;
};

export type NasaNeoFeed = {
  element_count?: number | null;
  near_earth_objects?: Record<string, NasaNearEarthObject[] | null> | null;
};
