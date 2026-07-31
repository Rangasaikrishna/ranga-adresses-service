import {
  handleStreamOrSingleExecutionResult,
  type Plugin,
} from '@envelop/core';
import { ContextType } from '../types';

type ResultWithMetadata = {
  data?: unknown;
  errors?: unknown;
  extensions?: unknown;
  metadata?: { requestId: string };
};

export const useRequestMetadata = (): Plugin<ContextType> => {
  return {
    onExecute({ args }) {
      return {
        onExecuteDone(payload) {
          return handleStreamOrSingleExecutionResult(payload, ({ result, setResult }) => {
            const nextResult: ResultWithMetadata = {
              ...result,
              metadata: {
                requestId: args.contextValue.requestId,
              },
            };
            setResult(nextResult as typeof result);
          });
        },
      };
    },
  };
};
