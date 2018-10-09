import chai from 'chai';

import { request } from '../utils';

chai.should();

describe('Orders create', () => {
  describe('create a new order', () => {
    it('should response 201 on create a new order', (done) => {
      request
        .post('/api/orders')
        .send({
          data: {
            type: 'orders',
            attributes: {
              price: 0.0003,
              amount: 400,
              total: 0.12,
              type: 'sell',
              zrxOrder: '{}',
              expires_at: '2019-05-30 22:36:17.528+00',
              token_address: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
              pair_address: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
              order_hash: '0x0',
            }
          }
        })
        .expect(201, (err) => {
          if (err) {
            console.log(err);
            throw err;
          }
          done();
        });
    });
  });


  describe('create a new order with wrond data', () => {
    it('should response 400 on creation of with with product and product price that do not match', (done) => {
      request
        .post('/api/orders')
        .send({
          data: {
            type: 'orders',
            attributes: {
              zrxOrder: 4,
              expires_at: '2018-02-08T14:05:15.639Z',
              token_address: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401'
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
