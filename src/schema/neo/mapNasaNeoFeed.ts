import {
  NasaNearEarthObject,
  NasaNeoFeed,
  NearEarthObject,
  NearEarthObjectFeed,
} from './types';

const mapNasaObject = (neo: NasaNearEarthObject): NearEarthObject => {
  const approach = neo.close_approach_data?.[0];

  return {
    id: neo.id ?? null,
    name: neo.name ?? null,
    isPotentiallyHazardousAsteroid:
      neo.is_potentially_hazardous_asteroid ?? null,
    estimatedDiameterMinKm:
      neo.estimated_diameter?.kilometers?.estimated_diameter_min ?? null,
    estimatedDiameterMaxKm:
      neo.estimated_diameter?.kilometers?.estimated_diameter_max ?? null,
    closeApproachDate: approach?.close_approach_date ?? null,
    relativeVelocityKph:
      approach?.relative_velocity?.kilometers_per_hour ?? null,
    missDistanceKm: approach?.miss_distance?.kilometers ?? null,
  };
};

export const mapNasaNeoFeed = (feed: NasaNeoFeed | null | undefined): NearEarthObjectFeed => {
  const nearEarthObjects = feed?.near_earth_objects ?? {};
  const objects = Object.values(nearEarthObjects)
    .flatMap((group) => group ?? [])
    .map(mapNasaObject);

  return {
    elementCount: feed?.element_count ?? objects.length,
    objects,
  };
};
