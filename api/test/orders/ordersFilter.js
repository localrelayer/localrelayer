import chai from 'chai';

import { request } from '../utils';
import { ordersDefaultFields } from '../../src/models/orders';

chai.should();

describe('Orders filter', () => {
  describe('/orders/filter - fetch orders with right data', () => {
    const limit = 1;
    it('should response 200, check limit', (done) => {
      request
        .post('/api/orders/filter')
        .send({
          page: {
            limit,
          },
        })
        .expect(200, (err, res) => {
          if (err) {
            console.log('ERROR', err);
            throw err;
          }
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');

          const meta = res.body.meta;
          meta.limit.should.be.equal(limit);

          const dataCount = res.body.data.length;
          dataCount.should.be.equal(limit);
          done();
        });
    });
    it('should response 200, check limit | GET style', (done) => {
      request
        .get(`/api/orders?page[limit]=${limit}`)
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');

          const meta = res.body.meta;
          meta.limit.should.be.equal(limit);

          const dataCount = res.body.data.length;
          dataCount.should.be.equal(limit);
          done();
        });
    });

    it('should response 200, check default fields', (done) => {
      request
        .post('/api/orders/filter')
        .send({
          page: {
            limit: 1,
          },
        })
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');

          const attributes = res.body.data[0].attributes;
          attributes.should.to.have.all.keys(ordersDefaultFields.fields.filter(i => i !== 'id'));
          done();
        });
    });
    it('should response 200, check limit | GET style', (done) => {
      request
        .get('/api/orders?page[limit]=1')
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');

          const attributes = res.body.data[0].attributes;
          attributes.should.to.have.all.keys(ordersDefaultFields.fields.filter(i => i !== 'id'));
          done();
        });
    });


    it('should response 200, check sort', (done) => {
      request
        .post('/api/orders/filter')
        .send({
          sort: ['-price'],
        })
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');


          const firstPrice = parseFloat(res.body.data[0].attributes.price);
          const secondPrice = parseFloat(res.body.data[1].attributes.price);
          chai.assert(firstPrice >= secondPrice, 'something wrong with sort');
          done();
        });
    });
    it('should response 200, check sort | GET style', (done) => {
      request
        .get('/api/orders?sort=-price')
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');

          const firstPrice = parseFloat(res.body.data[0].attributes.price);
          const secondPrice = parseFloat(res.body.data[1].attributes.price);
          chai.assert(firstPrice >= secondPrice, 'something wrong with sort');
          done();
        });
    });
    it('should response 200, when no filtering results', (done) => {
      request
        .post('/api/orders/filter')
        .send({
          filter: {
            id: 'c186ab76-580b-4ff1-9645-1a3d378e93d2',
          }
        })
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array').and.to.be.empty; // eslint-disable-line
          done();
        });
    });
  });
});
