import { parse } from 'graphql';
import { mapNasaNeoFeed } from '../../src/schema/neo/mapNasaNeoFeed';
import { NasaNeoFeed } from '../../src/schema/neo/types';
import { executor } from '../exectuor';

const mockNasaNeoFeedQuery = jest.fn();

jest.mock('../../src/mesh/client', () => ({
  getNasaSdk: () => ({
    nasaNeoFeed_query: (...args: unknown[]) => mockNasaNeoFeedQuery(...args),
  }),
}));

describe('mapNasaNeoFeed', () => {
  test('flattens date-keyed objects and maps exposed fields', () => {
    const feed: NasaNeoFeed = {
      element_count: 2,
      near_earth_objects: {
        '2015-09-07': [
          {
            id: '1',
            name: 'Asteroid A',
            is_potentially_hazardous_asteroid: true,
            estimated_diameter: {
              kilometers: {
                estimated_diameter_min: 0.1,
                estimated_diameter_max: 0.2,
              },
            },
            close_approach_data: [
              {
                close_approach_date: '2015-09-07',
                relative_velocity: {
                  kilometers_per_hour: '1000',
                },
                miss_distance: {
                  kilometers: '50000',
                },
              },
            ],
          },
        ],
        '2015-09-08': [
          {
            id: '2',
            name: 'Asteroid B',
            is_potentially_hazardous_asteroid: false,
            estimated_diameter: {
              kilometers: {
                estimated_diameter_min: 0.3,
                estimated_diameter_max: 0.4,
              },
            },
            close_approach_data: [
              {
                close_approach_date: '2015-09-08',
                relative_velocity: {
                  kilometers_per_hour: '2000',
                },
                miss_distance: {
                  kilometers: '60000',
                },
              },
            ],
          },
        ],
      },
    };

    expect(mapNasaNeoFeed(feed)).toEqual({
      elementCount: 2,
      objects: [
        {
          id: '1',
          name: 'Asteroid A',
          isPotentiallyHazardousAsteroid: true,
          estimatedDiameterMinKm: 0.1,
          estimatedDiameterMaxKm: 0.2,
          closeApproachDate: '2015-09-07',
          relativeVelocityKph: '1000',
          missDistanceKm: '50000',
        },
        {
          id: '2',
          name: 'Asteroid B',
          isPotentiallyHazardousAsteroid: false,
          estimatedDiameterMinKm: 0.3,
          estimatedDiameterMaxKm: 0.4,
          closeApproachDate: '2015-09-08',
          relativeVelocityKph: '2000',
          missDistanceKm: '60000',
        },
      ],
    });
  });
});

describe('nearEarthObjects query', () => {
  beforeEach(() => {
    mockNasaNeoFeedQuery.mockReset();
  });

  test('returns mapped feed from Mesh SDK', async () => {
    mockNasaNeoFeedQuery.mockResolvedValue({
      nasaNeoFeed: {
        element_count: 1,
        near_earth_objects: {
          '2015-09-07': [
            {
              id: '2465633',
              name: '465633 (2009 JR5)',
              is_potentially_hazardous_asteroid: true,
              estimated_diameter: {
                kilometers: {
                  estimated_diameter_min: 0.2,
                  estimated_diameter_max: 0.4,
                },
              },
              close_approach_data: [
                {
                  close_approach_date: '2015-09-07',
                  relative_velocity: {
                    kilometers_per_hour: '65000',
                  },
                  miss_distance: {
                    kilometers: '45000000',
                  },
                },
              ],
            },
          ],
        },
      },
    });

    const query = `
      query NearEarthObjects($startDate: String!, $endDate: String!) {
        nearEarthObjects(startDate: $startDate, endDate: $endDate) {
          elementCount
          objects {
            id
            name
            isPotentiallyHazardousAsteroid
            estimatedDiameterMinKm
            estimatedDiameterMaxKm
            closeApproachDate
            relativeVelocityKph
            missDistanceKm
          }
        }
      }
    `;

    const result = await executor({
      document: parse(query),
      variables: {
        startDate: '2015-09-07',
        endDate: '2015-09-08',
      },
    });

    expect(mockNasaNeoFeedQuery).toHaveBeenCalledWith({
      startDate: '2015-09-07',
      endDate: '2015-09-08',
    });
    expect(result).toEqual(
      expect.objectContaining({
        data: {
          nearEarthObjects: {
            elementCount: 1,
            objects: [
              {
                id: '2465633',
                name: '465633 (2009 JR5)',
                isPotentiallyHazardousAsteroid: true,
                estimatedDiameterMinKm: 0.2,
                estimatedDiameterMaxKm: 0.4,
                closeApproachDate: '2015-09-07',
                relativeVelocityKph: '65000',
                missDistanceKm: '45000000',
              },
            ],
          },
        },
        metadata: {
          requestId: expect.any(String),
        },
      })
    );
  });
});
