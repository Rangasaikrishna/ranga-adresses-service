import { GraphQLError } from 'graphql';
import { getNasaSdk } from '../../mesh/client';
import { mapNasaNeoFeed } from './mapNasaNeoFeed';
import { NasaNeoFeed, NearEarthObjectFeed, NearEarthObjectsArgs } from './types';

export const getNearEarthObjects = async (
  _: unknown,
  args: NearEarthObjectsArgs,
  context: any
): Promise<NearEarthObjectFeed> => {
  context.logger.info('getNearEarthObjects', 'Enter resolver');

  try {
    const sdk = getNasaSdk();
    const result = await sdk.nasaNeoFeed_query({
      startDate: args.startDate,
      endDate: args.endDate,
    });

    const feed = mapNasaNeoFeed(
      result.nasaNeoFeed as NasaNeoFeed | null | undefined
    );
    context.logger.info('getNearEarthObjects', 'Returning near earth objects');
    return feed;
  } catch {
    context.logger.error(
      'getNearEarthObjects',
      'Failed to fetch near earth objects'
    );
    throw new GraphQLError('Failed to fetch near earth objects');
  }
};
