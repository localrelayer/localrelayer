import chai from 'chai';
import { finance, random } from 'faker';
import { request } from '../utils';

chai.should();

const getTokenAttributes = () => ({
  symbol: random.word(),
  address: finance.ethereumAddress(),
  name: '0x Token',
  decimals: 18
});

describe('Tokens create', () => {
  describe('create a new token', () => {
    it('should response 201 on create a new token', (done) => {
      request
        .post('/api/tokens')
        .send({
          data: {
            type: 'tokens',
            attributes: getTokenAttributes(),
          }
        })
        .expect(201, (err) => {
          if (err) throw err;
          done();
        });
    });
  });


  describe('create a new token with wrond data', () => {
    it('should response 400 on creation of with with token with same address as exists', (done) => {
      request
        .post('/api/tokens')
        .send({
          data: {
            type: 'tokens',
            attributes: {
              symbol: 'ZRX',
              address: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
              name: '0x Token',
              decimals: 18
            }
          }
        })
        .expect(400, (err, res) => {
          res.body.should.have.property('errors');
          done();
        });
    });
  });
});
