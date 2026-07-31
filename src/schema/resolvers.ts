import { createAddress, getAddress } from "./address/address";
import { Address, Args, CreateAddressArgs } from "./address/types";
import { getNearEarthObjects } from "./neo/neo";
import { NearEarthObjectFeed, NearEarthObjectsArgs } from "./neo/types";

export const resolvers = {
  Query: {
    address: (parent: any, args: Args, context: any, info: any): Address => {
      return getAddress(parent, args, context);
    },
    nearEarthObjects: (
      parent: any,
      args: NearEarthObjectsArgs,
      context: any,
      info: any
    ): Promise<NearEarthObjectFeed> => {
      return getNearEarthObjects(parent, args, context);
    },
  },
  Mutation: {
    createAddress: (
      parent: any,
      args: CreateAddressArgs,
      context: any,
      info: any
    ): Address => {
      return createAddress(parent, args, context);
    },
  },
};
