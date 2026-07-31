import type { Plugin } from '@envelop/core';
import { getOperationAST, GraphQLError } from 'graphql';
import { v4 as uuid } from 'uuid';
import { ContextType } from '../types';

export const buildHeaders = (): Plugin<ContextType> => {
  return {
    onExecute({ args, extendContext, setResultAndStopExecution }) {
      const requestId = uuid();
      const request = (args.contextValue as { request?: Request }).request;
      const client = request?.headers.get('client') ?? undefined;

      if (!client) {
        setResultAndStopExecution({
          errors: [new GraphQLError('Missing required header: client')],
        });
        return;
      }

      if (client === 'strata') {
        const operationAST = getOperationAST(args.document, args.operationName);
        if (operationAST?.operation === 'mutation') {
          setResultAndStopExecution({
            errors: [
              new GraphQLError(
                'Client strata is not allowed to perform mutations'
              ),
            ],
          });
          return;
        }
      }

      extendContext({ requestId, client });
    },
  };
};
