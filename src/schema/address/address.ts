import { GraphQLError } from 'graphql';
import { Address, Args, CreateAddressArgs } from './types';
import { readAddresses, writeAddresses } from './store';

const _getAddress = (username: string): Address | null => {
  const addresses = readAddresses();
  return addresses[username] ?? null;
};

export const getAddress = (_: any, args: Args, context: any): Address => {
  context.logger.info('getAddress', 'Enter resolver');
  const address = _getAddress(args.username);
  if (address) {
    context.logger.info('getAddress', 'Returning address');
    return address;
  }
  context.logger.error('getAddress', 'No address found');
  throw new GraphQLError('No address found in getAddress resolver');
};

export const createAddress = (
  _: any,
  args: CreateAddressArgs,
  context: any
): Address => {
  context.logger.info('createAddress', 'Enter resolver');
  const addresses = readAddresses();

  if (addresses[args.username]) {
    context.logger.error('createAddress', 'Address already exists');
    throw new GraphQLError('Address already exists in createAddress resolver');
  }

  addresses[args.username] = args.address;
  writeAddresses(addresses);

  context.logger.info('createAddress', 'Address created');
  return args.address;
};
