import fs from 'fs';
import path from 'path';
import { Addresses } from './types';

const addressesFilePath = path.join(__dirname, '../../../data/addresses.json');

export const readAddresses = (): Addresses => {
  const raw = fs.readFileSync(addressesFilePath, 'utf-8');
  return JSON.parse(raw) as Addresses;
};

export const writeAddresses = (addresses: Addresses): void => {
  fs.writeFileSync(addressesFilePath, JSON.stringify(addresses, null, 2));
};
