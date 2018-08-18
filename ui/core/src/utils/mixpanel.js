import mixpanel from 'mixpanel-browser';

mixpanel.init('dfbed728952e1b2099b5bf39f64dd19e');

export const trackMixpanel = (event, data) => {
  // if (process.env.DISABLE_MIXPANEL !== '1' && process.env.MIXPANEL_API_TOKEN) {
  if (process.env.NODE_ENV === 'production') {
    try {
      mixpanel.track(event, data);
    } catch (e) {
      console.warn('Blocked by adblock');
    }
  }
};

export const identity = (address) => {
  mixpanel.identify(address);
};

