import { parse } from 'graphql';
import { createExecutor, executor } from '../exectuor';
import { readAddresses, writeAddresses } from '../../src/schema/address/store';
import { Addresses } from '../../src/schema/address/types';

const expectRequestIdMetadata = (result: any) => {
  expect(result.metadata).toEqual({
    requestId: expect.any(String),
  });
  expect(result.metadata.requestId.length).toBeGreaterThan(0);
};

describe('getAddress', () => {
  test('Success', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    state
                    zipcode
                }
            }
        `;

    const variables = { username: 'jack' };

    const result = await executor({
      document: parse(query),
      variables,
    });

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          address: {
            street: '123 Street St.',
            city: 'Sometown',
            state: 'OH',
            zipcode: '43215',
          },
        },
      })
    );
    expectRequestIdMetadata(result);
  });

  test('Error', async () => {
    const query = `
            query GetAddress($username: String!) {
                address(username: $username) {
                    street
                    city
                    state
                    zipcode
                }
            }
        `;

    const variables = { username: 'john' };

    const result = await executor({
      document: parse(query),
      variables,
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'No address found in getAddress resolver',
          }),
        ]),
      })
    );
    expectRequestIdMetadata(result);
  });
});

describe('createAddress', () => {
  const username = 'ticket7-create-user';
  let snapshot: Addresses;

  beforeEach(() => {
    snapshot = readAddresses();
  });

  afterEach(() => {
    writeAddresses(snapshot);
  });

  test('creates a new address', async () => {
    const mutation = `
      mutation CreateAddress($username: String!, $address: AddressInput!) {
        createAddress(username: $username, address: $address) {
          street
          city
          state
          zipcode
        }
      }
    `;

    const address = {
      street: '999 New St',
      city: 'Columbus',
      state: 'OH',
      zipcode: '43201',
    };

    const result = await executor({
      document: parse(mutation),
      variables: { username, address },
    });

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          createAddress: address,
        },
      })
    );
    expectRequestIdMetadata(result);
    expect(readAddresses()[username]).toEqual(address);
  });

  test('does not overwrite an existing address', async () => {
    const mutation = `
      mutation CreateAddress($username: String!, $address: AddressInput!) {
        createAddress(username: $username, address: $address) {
          street
          city
          state
          zipcode
        }
      }
    `;

    const result = await executor({
      document: parse(mutation),
      variables: {
        username: 'jack',
        address: {
          street: 'should not save',
          city: 'Nowhere',
          state: 'XX',
          zipcode: '00000',
        },
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Address already exists in createAddress resolver',
          }),
        ]),
      })
    );
    expectRequestIdMetadata(result);
    expect(readAddresses().jack).toEqual(snapshot.jack);
  });
});

describe('client header', () => {
  const query = `
    query GetAddress($username: String!) {
      address(username: $username) {
        street
        city
        state
        zipcode
      }
    }
  `;

  const mutation = `
    mutation CreateAddress($username: String!, $address: AddressInput!) {
      createAddress(username: $username, address: $address) {
        street
        city
        state
        zipcode
      }
    }
  `;

  test('rejects requests missing the client header', async () => {
    const noClientExecutor = createExecutor({});

    const result = await noClientExecutor({
      document: parse(query),
      variables: { username: 'jack' },
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Missing required header: client',
          }),
        ]),
      })
    );
    expectRequestIdMetadata(result);
  });

  test('allows queries for strata client', async () => {
    const strataExecutor = createExecutor({ client: 'strata' });

    const result = await strataExecutor({
      document: parse(query),
      variables: { username: 'jack' },
    });

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          address: {
            street: '123 Street St.',
            city: 'Sometown',
            state: 'OH',
            zipcode: '43215',
          },
        },
      })
    );
    expectRequestIdMetadata(result);
  });

  test('rejects mutations for strata client', async () => {
    const strataExecutor = createExecutor({ client: 'strata' });
    const snapshot = readAddresses();

    const result = await strataExecutor({
      document: parse(mutation),
      variables: {
        username: 'strata-blocked-user',
        address: {
          street: '1 Blocked St',
          city: 'Blockedville',
          state: 'OH',
          zipcode: '11111',
        },
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Client strata is not allowed to perform mutations',
          }),
        ]),
      })
    );
    expectRequestIdMetadata(result);
    expect(readAddresses()).toEqual(snapshot);
  });
});
