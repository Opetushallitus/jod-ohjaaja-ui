/**
 * Returns a promise that a loader returns without awaiting it. The page renders a rejection with
 * `<Await errorElement>`, the error is logged here, which also prevents an unhandled rejection if
 * the page is left before it is rendered.
 */
export const deferred = <T>(promise: Promise<T>) => {
  promise.catch((error: unknown) => {
    console.error('Failed to load the page content', error);
  });
  return promise;
};
