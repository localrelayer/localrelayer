import Raven from 'raven';
import config from '../config';

export const promiseTimeout = function (ms, promise) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`Timed out in ${ms}ms.`);
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

if (config.useSentry) {
  Raven.config('https://b54c33ad92334090b5c82c3fad2d762f@sentry.io/1210489').install();
}

export const catchError = (e) => {
  Raven.captureException(e, (err, eventId) => {
    console.log(`Reported error: ${eventId}`);
  });
};
