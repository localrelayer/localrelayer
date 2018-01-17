import config from '../config';
import tokensSeeds from './seeds/tokens.json';

const fakeTokens = () =>
  Promise.resolve({
    data: tokensSeeds.map(({ id, ...attributes }) => ({
      type: 'tokens',
      id,
      links: {
        self: `${config.apiUrl}/tokens/${id}`,
      },
      attributes,
    })),
  });

export function apiFetch({
  url,
}) {
  switch (url) {
    case `${config.apiUrl}/tokens/filter`:
      return fakeTokens();
    default:
      return null;
  }
}
