import chai from 'chai';
import { omit } from 'lodash';
import { request } from '../utils';
import { tokensDefaultFields } from '../../src/models/tokens';

chai.should();

describe('Tokens filter', () => {
  describe('/tokens/filter - fetch tokens with right data', () => {
    const limit = 5;
    it('should response 200, check limit', (done) => {
      request
        .post('/api/tokens/filter')
        .send({
          page: {
            limit,
          },
        })
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
    it('should response 200, check limit | GET style', (done) => {
      request
        .get(`/api/tokens?page[limit]=${limit}`)
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
        .post('/api/tokens/filter')
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

          const attributes = omit(res.body.data[0].attributes, 'tradingInfo');
          attributes.should.to.have.all.keys(tokensDefaultFields.fields.filter(i => i !== 'address'));
          done();
        });
    });
    it('should response 200, check limit | GET style', (done) => {
      request
        .get('/api/tokens?page[limit]=1')
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');

          const attributes = omit(res.body.data[0].attributes, 'tradingInfo');
          attributes.should.to.have.all.keys(tokensDefaultFields.fields.filter(i => i !== 'address'));
          done();
        });
    });


    it('should response 200, check sort', (done) => {
      request
        .post('/api/tokens/filter')
        .send({
          sort: ['-created_at'],
        })
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');
          const firstDate = new Date(res.body.data[0].attributes.created_at);
          const secondDate = new Date(res.body.data[1].attributes.created_at);
          chai.assert(firstDate.getTime() > secondDate.getTime(), 'something wrong with sort');
          done();
        });
    });
    it('should response 200, check sort | GET style', (done) => {
      request
        .get('/api/tokens?sort=-created_at')
        .expect(200, (err, res) => {
          if (err) throw err;
          res.body.should.have.property('meta');
          res.body.should.have.property('links');
          res.body.should.have.property('data').and.to.be.a('array');

          const firstDate = new Date(res.body.data[0].attributes.created_at);
          const secondDate = new Date(res.body.data[1].attributes.created_at);
          chai.assert(firstDate.getTime() > secondDate.getTime(), 'something wrong with sort');
          done();
        });
    });
    it('should response 200, when no filtering results', (done) => {
      request
        .post('/api/tokens/filter')
        .send({
          filter: {
            address: '0x1d7042f5b17d2f8b695918fb48fa1089c9f85401',
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
