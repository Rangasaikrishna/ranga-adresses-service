import { Logger } from '../src/logger';

describe('Logger', () => {
  test('includes requestId and client on every log level', () => {
    const logger = new Logger();
    logger.setRequestId('req-123');
    logger.setClient('acme');

    const info = jest.fn();
    const error = jest.fn();
    const warn = jest.fn();
    (logger as any).winston = { info, error, warn };

    logger.info('info-message');
    logger.error('error-message');
    logger.warn('warn-message');

    const expectedContext = {
      requestId: 'req-123',
      client: 'acme',
    };

    expect(info).toHaveBeenCalledWith('info-message', expectedContext);
    expect(error).toHaveBeenCalledWith('error-message', expectedContext);
    expect(warn).toHaveBeenCalledWith('warn-message', expectedContext);
  });
});
