import mixpanel from 'mixpanel-browser';

mixpanel.init('dfbed728952e1b2099b5bf39f64dd19e');

export const trackMixpanel = (event, data) => {
  // if (process.env.DISABLE_MIXPANEL !== '1' && process.env.MIXPANEL_API_TOKEN) {
  mixpanel.track(event, data);
  // }
};

export const identity = (address) => {
  mixpanel.identify(address);
};

